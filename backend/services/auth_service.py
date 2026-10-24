"""SQLite-backed account storage and password validation."""
import re
import sqlite3
from contextlib import contextmanager
from typing import Optional

from werkzeug.security import check_password_hash, generate_password_hash

from config import Config


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(Config.AUTH_DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


@contextmanager
def _connection():
    connection = _connect()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_auth_database() -> None:
    with _connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                phone TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def validate_registration(name: object, email: object, phone: object, password: object) -> Optional[str]:
    if not isinstance(name, str) or not name.strip():
        return 'Please enter your name or preferred alias.'
    if not isinstance(email, str) or not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email.strip()):
        return 'Please provide a valid email address.'
    if not isinstance(phone, str):
        return 'Please enter a valid phone number.'
    phone_digits = re.sub(r'\D', '', phone)
    if not re.fullmatch(r'\+?[0-9\s().-]+', phone.strip()) or not 7 <= len(phone_digits) <= 15:
        return 'Please enter a valid phone number.'
    if not isinstance(password, str) or len(password) < 8:
        return 'Password must contain at least 8 characters.'
    return None


def create_user(name: str, email: str, phone: str, password: str) -> tuple[Optional[dict], Optional[str]]:
    initialize_auth_database()
    try:
        with _connection() as connection:
            cursor = connection.execute(
                'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
                (name.strip(), email.strip().lower(), phone.strip(), generate_password_hash(password))
            )
            row = connection.execute(
                'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
                (cursor.lastrowid,)
            ).fetchone()
    except sqlite3.IntegrityError:
        return None, 'An account with this email address or phone number already exists.'
    return dict(row), None


def authenticate_user(email: object, password: object) -> Optional[dict]:
    if not isinstance(email, str) or not isinstance(password, str):
        return None
    initialize_auth_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT id, name, email, phone, password_hash, created_at FROM users WHERE email = ? COLLATE NOCASE',
            (email.strip(),)
        ).fetchone()
    if row is None or not check_password_hash(row['password_hash'], password):
        return None
    return {
        'id': row['id'],
        'name': row['name'],
        'email': row['email'],
        'phone': row['phone'],
        'created_at': row['created_at']
    }


def get_user(user_id: object) -> Optional[dict]:
    if not isinstance(user_id, int):
        return None
    initialize_auth_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
            (user_id,)
        ).fetchone()
    return dict(row) if row else None


def update_user(user_id: object, name: object, email: object, phone: object) -> tuple[Optional[dict], Optional[str]]:
    if not isinstance(user_id, int):
        return None, 'Please sign in again.'
    if not isinstance(name, str) or not name.strip():
        return None, 'Please enter your name or preferred alias.'
    if not isinstance(email, str) or not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email.strip()):
        return None, 'Please provide a valid email address.'
    if not isinstance(phone, str):
        return None, 'Please enter a valid phone number.'
    phone_digits = re.sub(r'\D', '', phone)
    if not re.fullmatch(r'\+?[0-9\s().-]+', phone.strip()) or not 7 <= len(phone_digits) <= 15:
        return None, 'Please enter a valid phone number.'

    try:
        with _connection() as connection:
            connection.execute(
                'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
                (name.strip(), email.strip().lower(), phone.strip(), user_id)
            )
            row = connection.execute(
                'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
                (user_id,)
            ).fetchone()
    except sqlite3.IntegrityError:
        return None, 'That email address or phone number is already registered.'
    return (dict(row), None) if row else (None, 'Account not found.')
