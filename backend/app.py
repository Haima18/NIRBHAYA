import os
import uuid
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import Config
from services.auth_service import (
    authenticate_user,
    create_user,
    get_user,
    update_user,
    validate_registration
)
from services.text_analyzer import analyze_message_text
from services.deepfake_inspector import inspect_media_file, is_allowed_file
from services.ai_provider import get_ai_guidance

app = Flask(__name__)
app.config.from_object(Config)

CORS(
    app,
    resources={r"/api/*": {"origins": Config.CORS_ORIGINS}},
    supports_credentials=True
)

# Ensure upload directory exists
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)


def auth_user_payload(user: dict) -> dict:
    return {
        'id': f"usr_{user['id']}",
        'name': user['name'],
        'email': user['email'],
        'phone': user['phone'],
        'quickExitUrl': 'https://www.accuweather.com',
        'aiProcessingConsent': False,
        'locationConsent': False,
        'discreetMode': False,
        'preferredLanguage': 'English',
        'joinedDate': user['created_at'][:7]
    }


@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
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
    return jsonify({'user': auth_user_payload(user)}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    user = authenticate_user(data.get('email'), data.get('password'))
    if user is None:
        return jsonify({'error': 'Email or password is incorrect.'}), 401

    session.clear()
    session['user_id'] = user['id']
    session.permanent = bool(data.get('rememberMe', True))
    return jsonify({'user': auth_user_payload(user)})


@app.route('/api/auth/me', methods=['GET'])
def current_user():
    user = get_user(session.get('user_id'))
    if user is None:
        session.clear()
        return jsonify({'error': 'Authentication required.'}), 401
    return jsonify({'user': auth_user_payload(user)})


@app.route('/api/auth/profile', methods=['PUT'])
def save_account_profile():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    user, error = update_user(
        session.get('user_id'),
        data.get('name'),
        data.get('email'),
        data.get('phone')
    )
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'user': auth_user_payload(user)})


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'platform': 'NIRBHAYA Complete Women Safety Backend',
        'version': '1.0.0'
    })

@app.route('/api/digital-guardian/analyze', methods=['POST'])
def analyze_text():
    data = request.get_json() or {}
    text = data.get('text', '')
    if not text.strip():
        return jsonify({'error': 'No text provided for analysis'}), 400

    result = analyze_message_text(text)
    return jsonify(result)

@app.route('/api/deepfake/analyze', methods=['POST'])
def analyze_media():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    if not is_allowed_file(file.filename):
        return jsonify({'error': 'Unsupported file format. Please upload an image, video, or audio file.'}), 400

    # Save to secure temporary path
    safe_name = secure_filename(file.filename)
    unique_temp_name = f"{uuid.uuid4().hex}_{safe_name}"
    temp_path = os.path.join(Config.UPLOAD_FOLDER, unique_temp_name)

    try:
        file.save(temp_path)
        report = inspect_media_file(temp_path, safe_name)
        return jsonify(report)
    finally:
        # Guarantee non-retention of intimate/sensitive media
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.get_json() or {}
    message = data.get('message', '')
    history = data.get('history', [])

    if not message.strip():
        return jsonify({'error': 'Message cannot be empty'}), 400

    result = get_ai_guidance(message, history)
    return jsonify(result)

if __name__ == '__main__':
    port = Config.PORT
    print(f"NIRBHAYA Backend running on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
