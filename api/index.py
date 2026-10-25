# Vercel serverless entrypoint for the NIRBHAYA Flask backend.
# Vercel's Python runtime looks for a WSGI callable named `app` in this file.
# We simply re-export the Flask `app` object from backend/app.py.

import sys
import os

# Add the backend directory to the Python path so all existing imports work
# (config, services.*, etc.) without any modifications to backend/app.py.
_backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, os.path.abspath(_backend_dir))

# Vercel sets environment variables from the project dashboard; python-dotenv
# will load backend/.env locally but env vars from the dashboard take priority.
from app import app  # noqa: F401  – `app` is the WSGI callable Vercel uses
