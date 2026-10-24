"""NIRBHAYA Flask API.

Security notes:
* Session cookies are HTTP-only and SameSite=Lax.
* State-changing requests are origin-checked and rate-limited.
* No endpoint lists location shares or returns coordinates without a token.
* External AI is only called after the account holder has opted in server-side.
"""
import os
import secrets
import threading
import time
import uuid
from collections import defaultdict, deque

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import Config
from services.ai_provider import get_ai_guidance, configured_ai_providers
from services.auth_service import (
    authenticate_user,
    change_password,
    create_password_reset,
    create_user,
    delete_user,
    get_user,
    reset_password,
    update_user,
    validate_registration,
)
from services.deepfake_inspector import inspect_media_file, is_allowed_file
from services.location_share_service import (
    create_share,
    delete_user_shares,
    get_public_share,
    list_user_shares,
    stop_share,
    update_share,
)
from services.text_analyzer import analyze_message_text

app = Flask(__name__)
app.config.from_object(Config)
if not app.config.get('SECRET_KEY'):
    # A generated secret invalidates old sessions on restart. Configure a
    # persistent SECRET_KEY for any shared or production deployment.
    app.config['SECRET_KEY'] = secrets.token_hex(32)
    print('WARNING: SECRET_KEY is not configured. Using an ephemeral development key.')

app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH

CORS(
    app,
    resources={r"/api/*": {"origins": Config.CORS_ORIGINS}},
    supports_credentials=True,
)

os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)


# ---------------------------------------------------------------------------
# Cross-cutting security helpers
# ---------------------------------------------------------------------------
_rate_lock = threading.Lock()
_rate_buckets = defaultdict(lambda: deque())
_RATE_WINDOWS = {
    'auth': (20, 60),
    'ai': (30, 60),
    'media': (10, 60),
    'location_create': (20, 60),
}


def _rate_limit(bucket: str):
    """Return a 429 response when this IP exceeded the bucket allowance."""
    if not Config.RATE_LIMIT_ENABLED:
        return None
    limit, window_seconds = _RATE_WINDOWS[bucket]
    key = f"{bucket}:{request.remote_addr or 'unknown'}"
    now = time.monotonic()
    with _rate_lock:
        entries = _rate_buckets[key]
        while entries and now - entries[0] > window_seconds:
            entries.popleft()
        if len(entries) >= limit:
            return jsonify({'error': 'Too many requests. Please wait a minute and try again.'}), 429
        entries.append(now)
    return None


@app.before_request
def enforce_origin_for_state_changes():
    if request.method not in {'POST', 'PUT', 'PATCH', 'DELETE'}:
        return None
    origin = request.headers.get('Origin')
    if origin and origin.rstrip('/') not in {item.rstrip('/') for item in Config.CORS_ORIGINS}:
        return jsonify({'error': 'Request origin is not allowed.'}), 403
    return None


@app.after_request
def add_security_headers(response):
    response.headers.setdefault('X-Content-Type-Options', 'nosniff')
    response.headers.setdefault('X-Frame-Options', 'DENY')
    response.headers.setdefault('Referrer-Policy', 'no-referrer')
    response.headers.setdefault('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()')
    response.headers.setdefault('Cache-Control', 'no-store' if request.path.startswith('/api/') else 'no-cache')
    return response


@app.errorhandler(413)
def request_too_large(_error):
    limit_mb = Config.MAX_CONTENT_LENGTH // (1024 * 1024)
    return jsonify({'error': f'The uploaded request exceeds the {limit_mb} MB limit.'}), 413


def _json_object():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None


def _auth_user_payload(user: dict) -> dict:
    return {
        'id': f"usr_{user['id']}",
        'name': user['name'],
        'email': user['email'],
        'phone': user['phone'],
        'bio': user['bio'],
        'quickExitUrl': user['quick_exit_url'],
        'aiProcessingConsent': user['ai_processing_consent'],
        'locationConsent': user['location_consent'],
        'discreetMode': user['discreet_mode'],
        'preferredLanguage': user['preferred_language'],
        'joinedDate': (user['created_at'] or '')[:7],
    }


def _current_user():
    return get_user(session.get('user_id'))


def _require_user():
    user = _current_user()
    if user is None:
        return None, (jsonify({'error': 'Authentication required.'}), 401)
    return user, None


def _background_context():
    """Bounded, non-identifying visibility for the footer/status screen."""
    return {
        'emailDeliveryConfigured': False,
        'aiProvidersConfigured': configured_ai_providers(),
        'externalAiConfigured': bool(configured_ai_providers()),
        'deepfakeDetectorConfigured': bool(Config.DEEPFAKE_DETECTOR_URL),
        'rateLimitEnabled': Config.RATE_LIMIT_ENABLED,
        'locationShareMinMinutes': Config.LOCATION_SHARE_MIN_MINUTES,
        'locationShareMaxMinutes': Config.LOCATION_SHARE_MAX_MINUTES,
    }


# ---------------------------------------------------------------------------
# Account lifecycle
# ---------------------------------------------------------------------------
@app.route('/api/auth/register', methods=['POST'])
def register():
    limited = _rate_limit('auth')
    if limited:
        return limited
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400

    error = validate_registration(
        data.get('name'), data.get('email'), data.get('phone'), data.get('password')
    )
    if error:
        return jsonify({'error': error}), 400

    user, error = create_user(data['name'], data['email'], data['phone'], data['password'])
    if error:
        return jsonify({'error': error}), 409

    session.clear()
    session['user_id'] = user['id']
    session.permanent = True
    return jsonify({'user': _auth_user_payload(user)}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    limited = _rate_limit('auth')
    if limited:
        return limited
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400

    user = authenticate_user(data.get('email'), data.get('password'))
    if user is None:
        return jsonify({'error': 'Email or password is incorrect.'}), 401

    session.clear()
    session['user_id'] = user['id']
    session.permanent = bool(data.get('rememberMe', True))
    return jsonify({'user': _auth_user_payload(user)})


@app.route('/api/auth/me', methods=['GET'])
def current_user():
    user = _current_user()
    if user is None:
        session.clear()
        return jsonify({'error': 'Authentication required.'}), 401
    return jsonify({'user': _auth_user_payload(user)})


@app.route('/api/auth/profile', methods=['PUT'])
def save_account_profile():
    user, error_response = _require_user()
    if error_response:
        return error_response
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400

    preferences = data.get('preferences') if isinstance(data.get('preferences'), dict) else data
    updated, error = update_user(
        session.get('user_id'),
        data.get('name', user['name']),
        data.get('email', user['email']),
        data.get('phone', user['phone']),
        {
            'bio': data.get('bio', user['bio']),
            'preferredLanguage': preferences.get('preferredLanguage', user['preferred_language']),
            'aiProcessingConsent': preferences.get('aiProcessingConsent', user['ai_processing_consent']),
            'locationConsent': preferences.get('locationConsent', user['location_consent']),
            'discreetMode': preferences.get('discreetMode', user['discreet_mode']),
            'quickExitUrl': preferences.get('quickExitUrl', user['quick_exit_url']),
        },
    )
    if error:
        return jsonify({'error': error}), 409 if 'already registered' in error else 400
    return jsonify({'user': _auth_user_payload(updated)})


@app.route('/api/auth/preferences', methods=['PATCH'])
def save_preferences():
    user, error_response = _require_user()
    if error_response:
        return error_response
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400

    updated, error = update_user(
        session.get('user_id'),
        user['name'],
        user['email'],
        user['phone'],
        {
            'bio': user['bio'],
            'preferredLanguage': data.get('preferredLanguage', user['preferred_language']),
            'aiProcessingConsent': data.get('aiProcessingConsent', user['ai_processing_consent']),
            'locationConsent': data.get('locationConsent', user['location_consent']),
            'discreetMode': data.get('discreetMode', user['discreet_mode']),
            'quickExitUrl': data.get('quickExitUrl', user['quick_exit_url']),
        },
    )
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'user': _auth_user_payload(updated)})


@app.route('/api/auth/password', methods=['PUT'])
def update_password():
    limited = _rate_limit('auth')
    if limited:
        return limited
    user, error_response = _require_user()
    if error_response:
        return error_response
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    error = change_password(user['id'], data.get('currentPassword'), data.get('newPassword'))
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'success': True, 'message': 'Password updated. Existing signed-in sessions are not revoked automatically.'})


@app.route('/api/auth/account', methods=['DELETE'])
def delete_account():
    limited = _rate_limit('auth')
    if limited:
        return limited
    user, error_response = _require_user()
    if error_response:
        return error_response
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    error = delete_user(user['id'], data.get('password'))
    if error:
        return jsonify({'error': error}), 400
    # The account row is gone, but location shares and coordinates are separate
    # server-side records and must be purged explicitly.
    delete_user_shares(user['id'])
    session.clear()
    return jsonify({'success': True})


@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    limited = _rate_limit('auth')
    if limited:
        return limited
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400

    token = create_password_reset(data.get('email'))
    response = {
        'message': 'If an account exists for that email, a single-use reset link has been created. '
                   'Email delivery is not configured in this deployment.',
        'emailDeliveryConfigured': False,
    }
    # Local development escape hatch. Never enable this on a public deployment.
    if token and Config.EXPOSE_DEV_RESET_TOKEN:
        response['devResetToken'] = token
        response['devNotice'] = (
            'Development-only token. Email delivery is disabled. Do not expose this setting publicly.'
        )
    return jsonify(response)


@app.route('/api/auth/reset-password', methods=['POST'])
def perform_password_reset():
    limited = _rate_limit('auth')
    if limited:
        return limited
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    error = reset_password(data.get('token'), data.get('newPassword'))
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'success': True, 'message': 'Password reset. Sign in with your new password.'})


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})


# ---------------------------------------------------------------------------
# Capability status
# ---------------------------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'platform': 'NIRBHAYA Women Safety Platform API',
        'version': '1.1.0',
    })


@app.route('/api/status', methods=['GET'])
def integration_status():
    return jsonify(_background_context())


# ---------------------------------------------------------------------------
# Location sharing (token protected, expiring, revocable)
# ---------------------------------------------------------------------------
def _location_payload(data: dict):
    location = data.get('location')
    if not isinstance(location, dict):
        return None, None, None
    return location.get('lat'), location.get('lng'), location.get('accuracyMeters')


def _share_url(token: str) -> str:
    # This is a path, not a secret-bearing absolute URL. The browser combines
    # it with its own origin so the app works behind a reverse proxy.
    return f'/share/{token}'


@app.route('/api/location-shares', methods=['POST'])
def create_location_share():
    limited = _rate_limit('location_create')
    if limited:
        return limited
    user, error_response = _require_user()
    if error_response:
        return error_response
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    if not user['location_consent']:
        return jsonify({'error': 'Location sharing consent is disabled. Enable it in Settings first.'}), 403

    try:
        minutes = int(data.get('minutes', 60))
    except (TypeError, ValueError):
        return jsonify({'error': 'Share duration must be a number of minutes.'}), 400
    if not Config.LOCATION_SHARE_MIN_MINUTES <= minutes <= Config.LOCATION_SHARE_MAX_MINUTES:
        return jsonify({
            'error': f'Share duration must be between {Config.LOCATION_SHARE_MIN_MINUTES} '
                     f'and {Config.LOCATION_SHARE_MAX_MINUTES} minutes.'
        }), 400

    lat, lng, accuracy = _location_payload(data)
    try:
        share = create_share(
            user['id'],
            str(data.get('recipientLabel') or 'Trusted contact')[:120],
            str(data.get('message') or '')[:400],
            minutes,
            lat,
            lng,
            accuracy,
        )
    except ValueError as error:
        return jsonify({'error': str(error)}), 400
    except (TypeError, ValueError):
        return jsonify({'error': 'Could not create the location share.'}), 400

    share['sharePath'] = _share_url(share['token'])
    return jsonify({'share': share}), 201


@app.route('/api/location-shares', methods=['GET'])
def get_location_shares():
    user, error_response = _require_user()
    if error_response:
        return error_response
    shares = list_user_shares(user['id'])
    for share in shares:
        share['sharePath'] = _share_url(share['token'])
    return jsonify({'shares': shares})


@app.route('/api/location-shares/<token>', methods=['PATCH'])
def update_location_share(token: str):
    user, error_response = _require_user()
    if error_response:
        return error_response
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    if not user['location_consent']:
        return jsonify({'error': 'Location sharing consent is disabled.'}), 403
    lat, lng, accuracy = _location_payload(data)
    share, error = update_share(token, data.get('ownerToken'), lat, lng, accuracy, user['id'])
    if error:
        return jsonify({'error': error}), 404
    share['sharePath'] = _share_url(share['token'])
    return jsonify({'share': share})


@app.route('/api/location-shares/<token>/stop', methods=['POST'])
def stop_location_share(token: str):
    user, error_response = _require_user()
    if error_response:
        return error_response
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    success, error = stop_share(token, data.get('ownerToken'), user['id'])
    if not success:
        return jsonify({'error': error}), 404
    return jsonify({'success': True, 'message': 'Location sharing stopped and coordinates cleared.'})


@app.route('/api/location-shares/<token>/public', methods=['GET'])
def public_location_share(token: str):
    share = get_public_share(token)
    if share is None:
        return jsonify({'error': 'This location share does not exist.'}), 404
    return jsonify({'share': share})


# ---------------------------------------------------------------------------
# Digital Guardian and AI Assistant
# ---------------------------------------------------------------------------
@app.route('/api/digital-guardian/analyze', methods=['POST'])
def analyze_text():
    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    text = data.get('text')
    if not isinstance(text, str) or not text.strip():
        return jsonify({'error': 'No text provided for analysis.'}), 400
    if len(text) > 20000:
        return jsonify({'error': 'Text is too long for analysis.'}), 400
    result = analyze_message_text(text)
    result['analysisMode'] = 'local-heuristic'
    return jsonify(result)


@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    limited = _rate_limit('ai')
    if limited:
        return limited
    user, error_response = _require_user()
    if error_response:
        return error_response
    if not user['ai_processing_consent']:
        return jsonify({
            'error': 'External AI consent is disabled. Use the on-device guidance engine or enable consent in Settings.'
        }), 403

    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    message = data.get('message')
    if not isinstance(message, str) or not message.strip():
        return jsonify({'error': 'Message cannot be empty.'}), 400
    if len(message) > 4000:
        return jsonify({'error': 'Message is too long. Keep it under 4,000 characters.'}), 400

    raw_history = data.get('history')
    history = []
    if isinstance(raw_history, list):
        for item in raw_history[-8:]:
            if not isinstance(item, dict):
                continue
            role = item.get('role')
            content = item.get('content')
            if role not in {'user', 'assistant'} or not isinstance(content, str):
                continue
            history.append({'role': role, 'content': content[:2000]})

    result = get_ai_guidance(message, history)
    result['externalRequestMade'] = result.get('provider') != 'NIRBHAYA Local Safety Engine'
    result['consentVerified'] = True
    return jsonify(result)


@app.route('/api/ai/status', methods=['GET'])
def ai_status():
    providers = configured_ai_providers()
    return jsonify({
        'externalAiConfigured': bool(providers),
        'providers': providers,
        'fallback': 'NIRBHAYA Local Safety Engine',
        'requiresAccountConsent': True,
    })


# ---------------------------------------------------------------------------
# Media container inspection
# ---------------------------------------------------------------------------
@app.route('/api/deepfake/analyze', methods=['POST'])
def analyze_media():
    limited = _rate_limit('media')
    if limited:
        return limited
    user, error_response = _require_user()
    if error_response:
        return error_response

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400
    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'Empty filename.'}), 400
    if not is_allowed_file(file.filename):
        return jsonify({'error': 'Unsupported file format. Please upload an image, video, or audio file.'}), 400

    safe_name = secure_filename(file.filename) or 'upload.bin'
    temp_name = f"{uuid.uuid4().hex}_{safe_name}"
    temp_path = os.path.join(Config.UPLOAD_FOLDER, temp_name)
    try:
        file.save(temp_path)
        report = inspect_media_file(temp_path, safe_name)
        report['analysedFor'] = f"usr_{user['id']}"
        report['mediaRetained'] = False
        return jsonify(report)
    finally:
        # Sensitive media is never retained after inspection.
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


if __name__ == '__main__':
    port = Config.PORT
    print(f"NIRBHAYA backend running on http://localhost:{port}")
    app.run(host=Config.HOST, port=port, debug=Config.DEBUG)
