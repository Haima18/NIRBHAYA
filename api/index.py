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

from app import app  # noqa: F401  – `app` is the WSGI callable Vercel uses
