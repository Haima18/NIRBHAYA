import os
import secrets
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.environ.get('PORT', 5000))
    DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1')
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
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
    
    # External AI Credentials (Optional; fallback always operates gracefully)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
    
    # Supabase (Optional; client-side/sqlite fallback exists)
    SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
    SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')
    
    # Security & Media Limits
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'temp_uploads')
