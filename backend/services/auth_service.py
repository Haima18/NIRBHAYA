"""SQLite-backed account storage, password recovery, and validation."""
import hashlib
import re
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional

from werkzeug.security import check_password_hash, generate_password_hash

from config import Config

EMAIL_PATTERN = re.compile(r'[^@\s]+@[^@\s]+\.[^@\s]+')
PHONE_PATTERN = re.compile(r'\+?[0-9\s().-]+')


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


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


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
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                bio TEXT NOT NULL DEFAULT '',
                preferred_language TEXT NOT NULL DEFAULT 'English',
                ai_processing_consent INTEGER NOT NULL DEFAULT 0,
                location_consent INTEGER NOT NULL DEFAULT 0,
                discreet_mode INTEGER NOT NULL DEFAULT 0,
                quick_exit_url TEXT NOT NULL DEFAULT 'https://www.accuweather.com'
            )
            """
        )
        # Migrate databases created by earlier versions of NIRBHAYA.
        existing = {
            row['name'] for row in connection.execute('PRAGMA table_info(users)').fetchall()
        }
        migrations = {
            'bio': "ALTER TABLE users ADD COLUMN bio TEXT NOT NULL DEFAULT ''",
            'preferred_language': "ALTER TABLE users ADD COLUMN preferred_language TEXT NOT NULL DEFAULT 'English'",
            'ai_processing_consent': 'ALTER TABLE users ADD COLUMN ai_processing_consent INTEGER NOT NULL DEFAULT 0',
            'location_consent': 'ALTER TABLE users ADD COLUMN location_consent INTEGER NOT NULL DEFAULT 0',
            'discreet_mode': 'ALTER TABLE users ADD COLUMN discreet_mode INTEGER NOT NULL DEFAULT 0',
            'quick_exit_url': "ALTER TABLE users ADD COLUMN quick_exit_url TEXT NOT NULL DEFAULT 'https://www.accuweather.com'",
        }
        for column, statement in migrations.items():
            if column not in existing:
                connection.execute(statement)

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                used INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )


def validate_registration(name: object, email: object, phone: object, password: object) -> Optional[str]:
    if not isinstance(name, str) or not name.strip():
        return 'Please enter your name or preferred alias.'
    if not isinstance(email, str) or not EMAIL_PATTERN.fullmatch(email.strip()):
        return 'Please provide a valid email address.'
    if not isinstance(phone, str):
        return 'Please enter a valid phone number.'
    phone_digits = re.sub(r'\D', '', phone)
    if not PHONE_PATTERN.fullmatch(phone.strip()) or not 7 <= len(phone_digits) <= 15:
        return 'Please enter a valid phone number.'
    if not isinstance(password, str) or len(password) < 8:
        return 'Password must contain at least 8 characters.'
    if len(password) > 200:
        return 'Password is too long.'
    return None


def validate_password(password: object) -> Optional[str]:
    if not isinstance(password, str) or len(password) < 8:
        return 'Password must contain at least 8 characters.'
    if len(password) > 200:
        return 'Password is too long.'
    return None


def _row_to_user(row: sqlite3.Row) -> dict:
    return {
        'id': row['id'],
        'name': row['name'],
        'email': row['email'],
        'phone': row['phone'],
        'bio': row['bio'] or '',
        'created_at': row['created_at'],
        'preferred_language': row['preferred_language'] or 'English',
        'ai_processing_consent': bool(row['ai_processing_consent']),
        'location_consent': bool(row['location_consent']),
        'discreet_mode': bool(row['discreet_mode']),
        'quick_exit_url': row['quick_exit_url'] or 'https://www.accuweather.com',
    }


def create_user(name: str, email: str, phone: str, password: str) -> tuple[Optional[dict], Optional[str]]:
    initialize_auth_database()
    try:
        with _connection() as connection:
            cursor = connection.execute(
                'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
                (name.strip(), email.strip().lower(), phone.strip(), generate_password_hash(password))
            )
            row = connection.execute(
                'SELECT * FROM users WHERE id = ?',
                (cursor.lastrowid,)
            ).fetchone()
    except sqlite3.IntegrityError:
        return None, 'An account with this email address or phone number already exists.'
    return _row_to_user(row), None


def authenticate_user(email: object, password: object) -> Optional[dict]:
    if not isinstance(email, str) or not isinstance(password, str):
        return None
    initialize_auth_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT * FROM users WHERE email = ? COLLATE NOCASE',
            (email.strip(),)
        ).fetchone()
    if row is None or not check_password_hash(row['password_hash'], password):
        return None
    return _row_to_user(row)


def get_user(user_id: object) -> Optional[dict]:
    if not isinstance(user_id, int):
        return None
    initialize_auth_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT * FROM users WHERE id = ?',
            (user_id,)
        ).fetchone()
    return _row_to_user(row) if row else None


def update_user(
    user_id: object,
    name: object,
    email: object,
    phone: object,
    preferences: Optional[dict] = None,
) -> tuple[Optional[dict], Optional[str]]:
    if not isinstance(user_id, int):
        return None, 'Please sign in again.'
    if not isinstance(name, str) or not name.strip():
        return None, 'Please enter your name or preferred alias.'
    if not isinstance(email, str) or not EMAIL_PATTERN.fullmatch(email.strip()):
        return None, 'Please provide a valid email address.'
    if not isinstance(phone, str):
        return None, 'Please enter a valid phone number.'
    phone_digits = re.sub(r'\D', '', phone)
    if not PHONE_PATTERN.fullmatch(phone.strip()) or not 7 <= len(phone_digits) <= 15:
        return None, 'Please enter a valid phone number.'

    preferences = preferences or {}
    bio = preferences.get('bio', '')
    if not isinstance(bio, str):
        bio = ''
    bio = bio.strip()[:500]
    language = preferences.get('preferredLanguage', 'English')
    if not isinstance(language, str) or len(language.strip()) > 60:
        language = 'English'
    quick_exit = preferences.get('quickExitUrl', 'https://www.accuweather.com')
    if not isinstance(quick_exit, str) or not quick_exit.startswith(('https://', 'http://')):
        quick_exit = 'https://www.accuweather.com'

    try:
        with _connection() as connection:
            connection.execute(
                """
                UPDATE users
                SET name = ?, email = ?, phone = ?, bio = ?, preferred_language = ?,
                    ai_processing_consent = ?, location_consent = ?, discreet_mode = ?,
                    quick_exit_url = ?
                WHERE id = ?
                """,
                (
                    name.strip(),
                    email.strip().lower(),
                    phone.strip(),
                    bio,
                    language.strip() or 'English',
                    1 if preferences.get('aiProcessingConsent') else 0,
                    1 if preferences.get('locationConsent') else 0,
                    1 if preferences.get('discreetMode') else 0,
                    quick_exit.strip(),
                    user_id,
                )
            )
            row = connection.execute(
                'SELECT * FROM users WHERE id = ?',
                (user_id,)
            ).fetchone()
    except sqlite3.IntegrityError:
        return None, 'That email address or phone number is already registered.'
    return (_row_to_user(row), None) if row else (None, 'Account not found.')


def create_password_reset(email: object) -> Optional[str]:
    """Create a single-use reset token. Returns None for unknown accounts."""
    if not isinstance(email, str) or not EMAIL_PATTERN.fullmatch(email.strip()):
        return None
    initialize_auth_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT id FROM users WHERE email = ? COLLATE NOCASE',
            (email.strip().lower(),)
        ).fetchone()
        if row is None:
            return None
        # Invalidate earlier unused tokens for this account.
        connection.execute(
            'UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0',
            (row['id'],)
        )
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        connection.execute(
            'INSERT INTO password_resets (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)',
            (
                row['id'],
                token_hash,
                _iso(_utcnow() + timedelta(minutes=Config.RESET_TOKEN_TTL_MINUTES)),
                _iso(_utcnow()),
            )
        )
    return token


def reset_password(token: object, new_password: object) -> Optional[str]:
    if not isinstance(token, str) or not token:
        return 'This reset link is invalid or has expired.'
    error = validate_password(new_password)
    if error:
        return error
    token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
    initialize_auth_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT id, user_id, expires_at, used FROM password_resets WHERE token_hash = ?',
            (token_hash,)
        ).fetchone()
        if row is None or row['used']:
            return 'This reset link is invalid or has expired.'
        try:
            expires_at = datetime.fromisoformat(row['expires_at'])
        except ValueError:
            return 'This reset link is invalid or has expired.'
        if expires_at <= _utcnow():
            return 'This reset link is invalid or has expired.'
        connection.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            (generate_password_hash(new_password), row['user_id'])
        )
        connection.execute(
            'UPDATE password_resets SET used = 1 WHERE id = ?',
            (row['id'],)
        )
    return None


def change_password(user_id: object, current_password: object, new_password: object) -> Optional[str]:
    if not isinstance(user_id, int):
        return 'Please sign in again.'
    if not isinstance(current_password, str):
        return 'Current password is required.'
    error = validate_password(new_password)
    if error:
        return error
    initialize_auth_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            (user_id,)
        ).fetchone()
        if row is None or not check_password_hash(row['password_hash'], current_password):
            return 'Current password is incorrect.'
        connection.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            (generate_password_hash(new_password), user_id)
        )
    return None


def delete_user(user_id: object, password: object) -> Optional[str]:
    if not isinstance(user_id, int):
        return 'Please sign in again.'
    if not isinstance(password, str):
        return 'Password is required to delete the account.'
    initialize_auth_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            (user_id,)
        ).fetchone()
        if row is None:
            return 'Account not found.'
        if not check_password_hash(row['password_hash'], password):
            return 'Password is incorrect.'
        connection.execute('DELETE FROM password_resets WHERE user_id = ?', (user_id,))
        connection.execute('DELETE FROM users WHERE id = ?', (user_id,))
    return None
