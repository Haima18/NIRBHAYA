# Vercel serverless entrypoint for the NIRBHAYA Flask backend.
# Vercel's Python runtime looks for a WSGI callable named `app` in this file.

import sys
import os

# Add the backend directory to the Python path so all existing imports work
# (config, services.*, etc.) without any modifications to backend/app.py.
_backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, os.path.abspath(_backend_dir))

# Vercel's filesystem is read-only except for /tmp.
# Set writable paths BEFORE importing the Flask app so Config picks them up.
os.environ.setdefault('AUTH_DATABASE', '/tmp/nirbhaya_accounts.sqlite3')
os.environ.setdefault('UPLOAD_FOLDER', '/tmp/nirbhaya_uploads')
# Cookies must be secure on HTTPS (Vercel always uses HTTPS).
os.environ.setdefault('SESSION_COOKIE_SECURE', 'True')

# Vercel sets VERCEL_URL automatically to the current deployment hostname.
# Inject it into CORS_ORIGINS so the origin-check middleware passes for
# login/register requests made from the same Vercel deployment.
_vercel_host = os.environ.get('VERCEL_URL') or os.environ.get('VERCEL_BRANCH_URL')
if _vercel_host:
    _vercel_origin = f'https://{_vercel_host}'
    _existing_origins = os.environ.get('CORS_ORIGINS', '')
    if _vercel_origin not in _existing_origins:
        os.environ['CORS_ORIGINS'] = f'{_vercel_origin},{_existing_origins}'.strip(',')

from app import app  # noqa: F401  – `app` is the WSGI callable Vercel uses
