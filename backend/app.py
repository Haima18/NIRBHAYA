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
import math
import json
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from collections import defaultdict, deque
from urllib.error import URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

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
from services.sms_service import SmsDeliveryError, is_sms_configured, send_sms

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
    'public_data': (20, 60),
    'sms': (5, 60),
}
_PUBLIC_DATA_CACHE = {}
_PUBLIC_DATA_CACHE_LOCK = threading.Lock()


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
# Public safety information (authenticated, bounded third-party lookups)
# ---------------------------------------------------------------------------
def _valid_http_url(value):
    if not isinstance(value, str) or len(value) > 2000:
        return False
    parsed = urlparse(value)
    return parsed.scheme in {'http', 'https'} and bool(parsed.netloc)


def _external_article(url, title, publisher, date):
    if not _valid_http_url(url) or not isinstance(title, str) or not title.strip():
        return None
    return {
        'url': url,
        'title': title.strip()[:500],
        'domain': publisher[:200] if isinstance(publisher, str) and publisher else urlparse(url).hostname,
        'seendate': date[:100] if isinstance(date, str) else '',
    }


def _fetch_gdelt_articles():
    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    params = urlencode({
        'query': '("violence against women" OR "gender-based violence" OR "women safety")',
        'mode': 'ArtList',
        'format': 'json',
        'maxrecords': 10,
        'sort': 'DateDesc',
        'startdatetime': start.strftime('%Y%m%d%H%M%S'),
        'enddatetime': now.strftime('%Y%m%d%H%M%S'),
    })
    request = Request(
        f'https://api.gdeltproject.org/api/v2/doc/doc?{params}',
        headers={'User-Agent': 'NIRBHAYA/1.0 (global safety news feed)', 'Accept': 'application/json'},
    )
    with urlopen(request, timeout=6) as response:
        payload = json.loads(response.read())
    raw_articles = payload.get('articles', []) if isinstance(payload, dict) else []
    if not isinstance(raw_articles, list):
        raise ValueError('GDELT returned an unexpected response.')
    articles = []
    for item in raw_articles[:10]:
        if not isinstance(item, dict):
            continue
        article = _external_article(item.get('url'), item.get('title'), item.get('domain', ''), item.get('seendate', ''))
        if article:
            articles.append(article)
    return articles


def _fetch_un_women_articles():
    return _fetch_rss_articles('https://www.unwomen.org/en/rss.xml', 'UN Women')


def _fetch_rss_articles(feed_url, publisher):
    external_request = Request(
        feed_url,
        headers={'User-Agent': 'NIRBHAYA/1.0 (recent women-focused news feed)', 'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'},
    )
    with urlopen(external_request, timeout=6) as response:
        root = ET.fromstring(response.read())
    articles = []
    for item in root.findall('./channel/item')[:30]:
        article = _external_article(
            item.findtext('link', default='').strip(),
            item.findtext('title', default='').strip(),
            publisher,
            item.findtext('pubDate', default='').strip(),
        )
        if article:
            articles.append(article)
    return articles


def _fetch_the_19th_articles():
    return _fetch_rss_articles('https://19thnews.org/feed/', 'The 19th')


def _fetch_fuller_articles():
    return _fetch_rss_articles('https://fullerproject.org/feed/', 'The Fuller Project')


def _fetch_un_news_articles():
    articles = _fetch_rss_articles(
        'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
        'UN News',
    )
    women_topics = (
        'women', 'woman', 'girl', 'girls', 'gender', 'maternal', 'feminist',
        'sexual violence', 'gender-based', 'child marriage', 'female',
    )
    return [
        article for article in articles
        if any(topic in article['title'].lower() for topic in women_topics)
    ]


def _get_cached_news():
    with _PUBLIC_DATA_CACHE_LOCK:
        cached = _PUBLIC_DATA_CACHE.get('news')
        if cached:
            ttl = 120 if cached[1].get('articles') else 15
            if time.monotonic() - cached[0] < ttl:
                return cached[1]
    return None


def _is_news_from_today_or_yesterday(value):
    if not isinstance(value, str) or not value.strip():
        return False
    try:
        if len(value) == 15 and value[8] == 'T':
            published = datetime.strptime(value.rstrip('Z'), '%Y%m%dT%H%M%S').replace(tzinfo=timezone.utc)
        else:
            published = parsedate_to_datetime(value)
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
        published_date = published.astimezone(timezone.utc).date()
    except (TypeError, ValueError, OverflowError):
        try:
            published_date = datetime.fromisoformat(value.replace('Z', '+00:00')).date()
        except ValueError:
            return False
    today = datetime.now(timezone.utc).date()
    return published_date in {today, today - timedelta(days=1)}


def _store_cached_news(payload):
    with _PUBLIC_DATA_CACHE_LOCK:
        _PUBLIC_DATA_CACHE['news'] = (time.monotonic(), payload)


@app.route('/api/news/headlines', methods=['GET'])
def news_headlines():
    user, error_response = _require_user()
    if error_response:
        return error_response
    limited = _rate_limit('public_data')
    if limited:
        return limited

    cached = _get_cached_news()
    if cached:
        return jsonify(cached)

    articles = []
    warnings = []
    successful_sources = 0
    feed_sources = (
        ('GDELT', _fetch_gdelt_articles),
        ('UN Women', _fetch_un_women_articles),
        ('The 19th', _fetch_the_19th_articles),
        ('The Fuller Project', _fetch_fuller_articles),
        ('UN News', _fetch_un_news_articles),
    )
    with ThreadPoolExecutor(max_workers=len(feed_sources)) as executor:
        pending = {
            executor.submit(fetcher): source_name
            for source_name, fetcher in feed_sources
        }
        for future in as_completed(pending):
            source_name = pending[future]
            try:
                articles.extend(future.result())
                successful_sources += 1
            except (URLError, TimeoutError, ValueError, ET.ParseError):
                warnings.append(f'{source_name} headlines are temporarily unavailable.')

    if successful_sources == 0:
        return jsonify({'error': 'Live news sources are temporarily unavailable. Please try again later.'}), 503

    deduplicated = {}
    for article in articles:
        if not isinstance(article, dict):
            continue
        if not _is_news_from_today_or_yesterday(article.get('seendate')):
            continue
        safe_article = _external_article(
            article.get('url'),
            article.get('title'),
            article.get('domain', ''),
            article.get('seendate', ''),
        )
        if safe_article:
            deduplicated.setdefault(safe_article['url'], safe_article)
    result = {'articles': list(deduplicated.values())[:15], 'warnings': warnings}
    _store_cached_news(result)
    return jsonify(result)


def _nearby_place_category(tags):
    if tags.get('railway') in {'station', 'halt'} or tags.get('public_transport') == 'station' and tags.get('station') == 'train':
        return 'railway_station'
    if tags.get('highway') == 'bus_stop' or tags.get('amenity') == 'bus_station':
        return 'bus_stop'
    if tags.get('amenity') == 'taxi':
        return 'taxi'
    if tags.get('tourism') in {'hotel', 'hostel', 'guest_house'}:
        return 'hotel'
    amenity = tags.get('amenity')
    if amenity == 'police':
        return 'police'
    if amenity == 'hospital':
        return 'hospital'
    if amenity in {'clinic', 'doctors'}:
        return 'clinic'
    if tags.get('social_facility') == 'shelter' or amenity == 'shelter':
        return 'shelter'
    if tags.get('office') == 'lawyer':
        return 'legal'
    return None


@app.route('/api/location/nearby', methods=['GET'])
def nearby_places():
    user, error_response = _require_user()
    if error_response:
        return error_response
    limited = _rate_limit('public_data')
    if limited:
        return limited

    try:
        lat = float(request.args.get('lat', ''))
        lng = float(request.args.get('lng', ''))
        radius = int(request.args.get('radius', '5000'))
    except (TypeError, ValueError):
        return jsonify({'error': 'Latitude, longitude, and radius must be numeric.'}), 400
    if not math.isfinite(lat) or not -90 <= lat <= 90 or not math.isfinite(lng) or not -180 <= lng <= 180:
        return jsonify({'error': 'A valid latitude and longitude are required.'}), 400
    radius = min(10000, max(1000, radius))

    query = (
        '[out:json][timeout:20];('
        f'nwr(around:{radius},{lat},{lng})["amenity"~"^(police|hospital|clinic|doctors|shelter)$"];'
        f'nwr(around:{radius},{lat},{lng})["social_facility"="shelter"];'
        f'nwr(around:{radius},{lat},{lng})["office"="lawyer"];'
        f'nwr(around:{radius},{lat},{lng})["railway"~"^(station|halt)$"];'
        f'nwr(around:{radius},{lat},{lng})["public_transport"="station"]["station"="train"];'
        f'nwr(around:{radius},{lat},{lng})["highway"="bus_stop"];'
        f'nwr(around:{radius},{lat},{lng})["amenity"="bus_station"];'
        f'nwr(around:{radius},{lat},{lng})["amenity"="taxi"];'
        f'nwr(around:{radius},{lat},{lng})["tourism"~"^(hotel|hostel|guest_house)$"];'
        ');out center tags;'
    )
    try:
        overpass_url = 'https://overpass-api.de/api/interpreter?' + urlencode({'data': query})
        external_request = Request(
            overpass_url,
            headers={'User-Agent': 'NIRBHAYA/1.0 (consented nearby service lookup)', 'Accept': 'application/json'},
        )
        with urlopen(external_request, timeout=25) as response:
            payload = json.loads(response.read())
    except (URLError, TimeoutError, ValueError):
        return jsonify({'error': 'OpenStreetMap nearby services are temporarily unavailable. Your map is still available; try again later.'}), 503

    elements = payload.get('elements', []) if isinstance(payload, dict) else []
    if not isinstance(elements, list):
        return jsonify({'error': 'OpenStreetMap returned an unexpected response.'}), 502

    places = []
    for element in elements:
        if not isinstance(element, dict):
            continue
        tags = element.get('tags')
        if not isinstance(tags, dict):
            continue
        category = _nearby_place_category(tags)
        center = element.get('center', {})
        place_lat = element.get('lat', center.get('lat') if isinstance(center, dict) else None)
        place_lng = element.get('lon', center.get('lon') if isinstance(center, dict) else None)
        if (
            category is None
            or not isinstance(place_lat, (int, float))
            or not isinstance(place_lng, (int, float))
            or not -90 <= place_lat <= 90
            or not -180 <= place_lng <= 180
        ):
            continue
        if not math.isfinite(place_lat) or not math.isfinite(place_lng):
            continue
        distance_lat = math.radians(place_lat - lat)
        distance_lng = math.radians(place_lng - lng)
        haversine = (
            math.sin(distance_lat / 2) ** 2
            + math.cos(math.radians(lat)) * math.cos(math.radians(place_lat)) * math.sin(distance_lng / 2) ** 2
        )
        haversine = min(1, max(0, haversine))
        distance_km = round(6371 * 2 * math.atan2(math.sqrt(haversine), math.sqrt(1 - haversine)), 2)
        street = ' '.join(str(tags[key]) for key in ('addr:housenumber', 'addr:street') if isinstance(tags.get(key), str))
        locality = ', '.join(str(tags[key]) for key in ('addr:city', 'addr:state') if isinstance(tags.get(key), str))
        address = ', '.join(part for part in (street, locality) if part) or 'Address not listed'
        name = tags.get('name')
        places.append({
            'id': f"{element.get('type', 'place')}_{element.get('id', '')}",
            'name': name.strip() if isinstance(name, str) and name.strip() else f'{category.title()} service',
            'category': category,
            'address': address,
            'phone': tags.get('phone') or tags.get('contact:phone'),
            'distanceKm': distance_km,
            'coords': {'lat': place_lat, 'lng': place_lng},
            'mapUrl': f'https://www.google.com/maps?q={place_lat},{place_lng}',
        })

    places.sort(key=lambda place: place['distanceKm'])
    return jsonify({'places': places[:50]})


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
@app.route('/api/alerts/sms', methods=['POST'])
def send_sms_alert():
    user, error_response = _require_user()
    if error_response:
        return error_response
    limited = _rate_limit('sms')
    if limited:
        return limited
    if not is_sms_configured():
        return jsonify({'error': 'SMS delivery is not configured. Use the manual SMS draft instead.'}), 503

    data = _json_object()
    if data is None:
        return jsonify({'error': 'Request body must be a JSON object.'}), 400
    recipients = data.get('recipients')
    message = data.get('message')
    if not isinstance(recipients, list) or not recipients or len(recipients) > 5:
        return jsonify({'error': 'Choose between 1 and 5 trusted contacts.'}), 400
    if any(not isinstance(number, str) or not number.startswith('+') or not number[1:].isdigit() or not 8 <= len(number[1:]) <= 15 for number in recipients):
        return jsonify({'error': 'Each trusted contact number must use international format, such as +919876543210.'}), 400
    if len(set(recipients)) != len(recipients):
        return jsonify({'error': 'Duplicate recipient numbers are not allowed.'}), 400
    if not isinstance(message, str) or not message.strip() or len(message) > 1000:
        return jsonify({'error': 'Alert text must contain 1 to 1,000 characters.'}), 400

    accepted = 0
    failures = 0
    for number in recipients:
        try:
            send_sms(number, message.strip())
            accepted += 1
        except SmsDeliveryError:
            failures += 1

    if accepted == 0:
        return jsonify({'error': 'The SMS provider did not accept any alert messages.', 'acceptedCount': 0, 'failedCount': failures}), 502
    return jsonify({
        'acceptedCount': accepted,
        'failedCount': failures,
        'deliveryConfirmed': False,
        'message': 'Accepted by the SMS provider; final delivery is not confirmed.' if failures == 0 else 'Some messages were accepted; others failed. Final delivery is not confirmed.'
    })


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
