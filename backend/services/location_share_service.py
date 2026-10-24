"""Token-protected, expiring location-sharing sessions.

Recipients receive an unguessable public token. There is no endpoint that lists
or searches locations. The owner keeps a separate secret used only to update or
revoke the share. Expired or revoked sessions never return coordinates.
"""
import hashlib
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional

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


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _hash(value: str) -> str:
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def initialize_location_database() -> None:
    with _connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS location_shares (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token TEXT NOT NULL UNIQUE,
                owner_hash TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                recipient_label TEXT NOT NULL DEFAULT '',
                message TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                last_lat REAL,
                last_lng REAL,
                accuracy_m REAL,
                updated_at TEXT,
                revoked INTEGER NOT NULL DEFAULT 0
            )
            """
        )


def _validate_coords(lat: object, lng: object) -> Optional[str]:
    try:
        lat_value = float(lat)
        lng_value = float(lng)
    except (TypeError, ValueError):
        return 'Valid latitude and longitude are required.'
    if not -90 <= lat_value <= 90 or not -180 <= lng_value <= 180:
        return 'Coordinates are outside the valid range.'
    return None


def _public_payload(row: sqlite3.Row, include_owner: bool = False) -> dict:
    now = _utcnow()
    expires_at = datetime.fromisoformat(row['expires_at'])
    active = not row['revoked'] and expires_at > now
    payload = {
        'id': row['id'],
        'token': row['token'],
        'recipientLabel': row['recipient_label'],
        'message': row['message'],
        'createdAt': row['created_at'],
        'expiresAt': row['expires_at'],
        'updatedAt': row['updated_at'],
        'revoked': bool(row['revoked']),
        'active': active,
        'location': None,
    }
    if active and row['last_lat'] is not None and row['last_lng'] is not None:
        payload['location'] = {
            'lat': row['last_lat'],
            'lng': row['last_lng'],
            'accuracyMeters': row['accuracy_m'],
            'recordedAt': row['updated_at'],
        }
    if include_owner:
        payload['ownerTokenIssued'] = True
    return payload


def create_share(user_id: int, recipient_label: str, message: str, minutes: int,
                 lat: object = None, lng: object = None, accuracy: object = None) -> dict:
    initialize_location_database()
    minutes = max(Config.LOCATION_SHARE_MIN_MINUTES, min(Config.LOCATION_SHARE_MAX_MINUTES, int(minutes)))
    error = _validate_coords(lat, lng) if lat is not None or lng is not None else None
    if error:
        raise ValueError(error)
    now = _utcnow()
    token = secrets.token_urlsafe(24)
    owner_token = secrets.token_urlsafe(32)
    accuracy_value = None
    if accuracy is not None:
        try:
            accuracy_value = max(0.0, float(accuracy))
        except (TypeError, ValueError):
            accuracy_value = None
    with _connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO location_shares
                (token, owner_hash, user_id, recipient_label, message, created_at,
                 expires_at, last_lat, last_lng, accuracy_m, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                token,
                _hash(owner_token),
                user_id,
                str(recipient_label or '')[:120],
                str(message or '')[:400],
                now.isoformat(),
                (now + timedelta(minutes=minutes)).isoformat(),
                float(lat) if lat is not None else None,
                float(lng) if lng is not None else None,
                accuracy_value,
                now.isoformat() if lat is not None and lng is not None else None,
            )
        )
        row = connection.execute(
            'SELECT * FROM location_shares WHERE id = ?', (cursor.lastrowid,)
        ).fetchone()
    payload = _public_payload(row, include_owner=True)
    payload['ownerToken'] = owner_token
    return payload


def update_share(token: str, owner_token: str, lat: object, lng: object,
                 accuracy: object = None, user_id: Optional[int] = None) -> tuple[Optional[dict], Optional[str]]:
    if not isinstance(token, str) or not isinstance(owner_token, str):
        return None, 'This sharing session could not be found.'
    error = _validate_coords(lat, lng)
    if error:
        return None, error
    initialize_location_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT * FROM location_shares WHERE token = ?', (token,)
        ).fetchone()
        if row is None or row['owner_hash'] != _hash(owner_token):
            return None, 'This sharing session could not be found.'
        if user_id is not None and row['user_id'] != user_id:
            return None, 'This sharing session could not be found.'
        if row['revoked']:
            return None, 'This sharing session has been stopped.'
        if datetime.fromisoformat(row['expires_at']) <= _utcnow():
            return None, 'This sharing session has expired.'
        accuracy_value = None
        if accuracy is not None:
            try:
                accuracy_value = max(0.0, float(accuracy))
            except (TypeError, ValueError):
                accuracy_value = None
        now = _utcnow().isoformat()
        connection.execute(
            'UPDATE location_shares SET last_lat = ?, last_lng = ?, accuracy_m = ?, updated_at = ? WHERE id = ?',
            (float(lat), float(lng), accuracy_value, now, row['id'])
        )
        updated = connection.execute(
            'SELECT * FROM location_shares WHERE id = ?', (row['id'],)
        ).fetchone()
    return _public_payload(updated), None


def get_public_share(token: str) -> Optional[dict]:
    if not isinstance(token, str) or len(token) < 16:
        return None
    initialize_location_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT * FROM location_shares WHERE token = ?', (token,)
        ).fetchone()
    return _public_payload(row) if row else None


def stop_share(token: str, owner_token: str, user_id: Optional[int] = None) -> tuple[bool, Optional[str]]:
    if not isinstance(token, str) or not isinstance(owner_token, str):
        return False, 'This sharing session could not be found.'
    initialize_location_database()
    with _connection() as connection:
        row = connection.execute(
            'SELECT id, owner_hash, user_id FROM location_shares WHERE token = ?', (token,)
        ).fetchone()
        if row is None or row['owner_hash'] != _hash(owner_token):
            return False, 'This sharing session could not be found.'
        if user_id is not None and row['user_id'] != user_id:
            return False, 'This sharing session could not be found.'
        connection.execute(
            'UPDATE location_shares SET revoked = 1, last_lat = NULL, last_lng = NULL, updated_at = ? WHERE id = ?',
            (_utcnow().isoformat(), row['id'])
        )
    return True, None


def list_user_shares(user_id: int) -> list:
    initialize_location_database()
    with _connection() as connection:
        rows = connection.execute(
            'SELECT * FROM location_shares WHERE user_id = ? ORDER BY id DESC LIMIT 20',
            (user_id,)
        ).fetchall()
    return [_public_payload(row) for row in rows]


def delete_user_shares(user_id: int) -> None:
    """Remove every sharing session and coordinate when an account is deleted."""
    if not isinstance(user_id, int):
        return
    initialize_location_database()
    with _connection() as connection:
        connection.execute('DELETE FROM location_shares WHERE user_id = ?', (user_id,))
