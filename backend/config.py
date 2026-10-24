import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    PORT = int(os.environ.get('PORT', 5000))
    # Loopback by default so a development instance is not exposed to the local
    # network. Set NIRBHAYA_HOST=0.0.0.0 only when you intend LAN access.
    HOST = os.environ.get('NIRBHAYA_HOST', '127.0.0.1')
    DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1')
    SECRET_KEY = os.environ.get('SECRET_KEY') or ''
    AUTH_DATABASE = os.environ.get(
        'AUTH_DATABASE',
        os.path.join(os.path.dirname(__file__), 'nirbhaya_accounts.sqlite3')
    )
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() in ('true', '1')
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.environ.get(
            'CORS_ORIGINS',
            'http://localhost:3000,http://127.0.0.1:3000'
        ).split(',')
        if origin.strip()
    ]

    # Password reset. Email delivery is NOT configured by default. When
    # EXPOSE_DEV_RESET_TOKEN is true the token is returned in the API response
    # so a local developer can complete the flow. Set it to false and connect
    # an email provider before any public deployment.
    RESET_TOKEN_TTL_MINUTES = int(os.environ.get('RESET_TOKEN_TTL_MINUTES', '30'))
    EXPOSE_DEV_RESET_TOKEN = os.environ.get('EXPOSE_DEV_RESET_TOKEN', 'False').lower() in ('true', '1')

    # External AI Credentials (Optional; rule-based fallback is the default)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

    # Optional external deepfake detector. No detector is bundled.
    DEEPFAKE_DETECTOR_URL = os.environ.get('DEEPFAKE_DETECTOR_URL', '')

    # Security, media, and location-sharing limits
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'temp_uploads')
    LOCATION_SHARE_MAX_MINUTES = 24 * 60
    LOCATION_SHARE_MIN_MINUTES = 5
    RATE_LIMIT_ENABLED = os.environ.get('RATE_LIMIT_ENABLED', 'True').lower() in ('true', '1')
