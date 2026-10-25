import io
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from config import Config


class TestAccountEndpoints(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        self.original_database = Config.AUTH_DATABASE
        self.original_rate_limit = Config.RATE_LIMIT_ENABLED
        self.original_reset_token_exposure = Config.EXPOSE_DEV_RESET_TOKEN
        Config.AUTH_DATABASE = os.path.join(self.temp_directory.name, 'test_accounts.sqlite3')
        Config.RATE_LIMIT_ENABLED = False
        app.config['TESTING'] = True
        self.client = app.test_client()

    def tearDown(self):
        Config.AUTH_DATABASE = self.original_database
        Config.RATE_LIMIT_ENABLED = self.original_rate_limit
        Config.EXPOSE_DEV_RESET_TOKEN = self.original_reset_token_exposure
        self.temp_directory.cleanup()

    def register(self, email='asha@example.com', password='SafePass123', phone='+91 98765 43210'):
        return self.client.post('/api/auth/register', json={
            'name': 'Asha Rao',
            'email': email,
            'phone': phone,
            'password': password
        })

    def test_registration_persists_account_and_starts_session(self):
        response = self.client.post('/api/auth/register', json={
            'name': 'Asha Rao',
            'email': 'asha@example.com',
            'phone': '+91 98765 43210',
            'password': 'SafePass123'
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['user']['name'], 'Asha Rao')
        self.assertEqual(self.client.get('/api/auth/me').status_code, 200)

    def test_password_is_required_and_short_password_is_rejected(self):
        response = self.client.post('/api/auth/register', json={
            'name': 'Asha Rao',
            'email': 'asha@example.com',
            'phone': '+91 98765 43210',
            'password': 'short'
        })

        self.assertEqual(response.status_code, 400)

    def test_local_vite_fallback_origin_is_allowed_but_unknown_origin_is_rejected(self):
        payload = {
            'name': 'Asha Rao',
            'email': 'asha@example.com',
            'phone': '+91 98765 43210',
            'password': 'SafePass123'
        }
        allowed = self.client.post(
            '/api/auth/register',
            json=payload,
            headers={'Origin': 'http://127.0.0.1:3001'}
        )
        self.assertEqual(allowed.status_code, 201)
        self.assertEqual(
            allowed.headers.get('Access-Control-Allow-Origin'),
            'http://127.0.0.1:3001'
        )

        rejected = self.client.post(
            '/api/auth/register',
            json={**payload, 'email': 'other@example.com'},
            headers={'Origin': 'http://127.0.0.1:3002'}
        )
        self.assertEqual(rejected.status_code, 403)

    def test_login_rejects_wrong_password_and_accepts_correct_password(self):
        self.client.post('/api/auth/register', json={
            'name': 'Asha Rao',
            'email': 'asha@example.com',
            'phone': '+91 98765 43210',
            'password': 'SafePass123'
        })
        self.client.post('/api/auth/logout')

        wrong_password = self.client.post('/api/auth/login', json={
            'email': 'asha@example.com',
            'password': 'WrongPass123'
        })
        self.assertEqual(wrong_password.status_code, 401)

        login = self.client.post('/api/auth/login', json={
            'email': 'asha@example.com',
            'password': 'SafePass123'
        })
        self.assertEqual(login.status_code, 200)
        self.assertEqual(login.json['user']['email'], 'asha@example.com')

    def test_profile_bio_and_preferences_are_persisted(self):
        self.register()
        response = self.client.put('/api/auth/profile', json={
            'name': 'Asha Rao',
            'email': 'asha@example.com',
            'phone': '+91 98765 43210',
            'bio': 'My private note',
            'preferences': {
                'quickExitUrl': 'https://example.org',
                'preferredLanguage': 'Hindi',
                'aiProcessingConsent': True,
                'locationConsent': True,
                'discreetMode': True
            }
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['user']['bio'], 'My private note')
        self.assertTrue(response.json['user']['aiProcessingConsent'])
        self.assertTrue(response.json['user']['locationConsent'])

        me = self.client.get('/api/auth/me')
        self.assertEqual(me.json['user']['bio'], 'My private note')
        self.assertEqual(me.json['user']['preferredLanguage'], 'Hindi')
        self.assertEqual(me.json['user']['quickExitUrl'], 'https://example.org')

    def test_password_change_requires_current_password_and_invalidates_old_one(self):
        self.register()

        wrong = self.client.put('/api/auth/password', json={
            'currentPassword': 'WrongPass123',
            'newPassword': 'NewSafePass456'
        })
        self.assertEqual(wrong.status_code, 400)

        changed = self.client.put('/api/auth/password', json={
            'currentPassword': 'SafePass123',
            'newPassword': 'NewSafePass456'
        })
        self.assertEqual(changed.status_code, 200)

        self.client.post('/api/auth/logout')
        old_login = self.client.post('/api/auth/login', json={
            'email': 'asha@example.com',
            'password': 'SafePass123'
        })
        self.assertEqual(old_login.status_code, 401)

        new_login = self.client.post('/api/auth/login', json={
            'email': 'asha@example.com',
            'password': 'NewSafePass456'
        })
        self.assertEqual(new_login.status_code, 200)

    def test_ai_chat_requires_account_consent(self):
        self.register()

        blocked = self.client.post('/api/ai/chat', json={'message': 'I need help'})
        self.assertEqual(blocked.status_code, 403)

        consent = self.client.patch('/api/auth/preferences', json={'aiProcessingConsent': True})
        self.assertEqual(consent.status_code, 200)

        allowed = self.client.post('/api/ai/chat', json={'message': 'I need help'})
        self.assertEqual(allowed.status_code, 200)
        self.assertIn('reply', allowed.json)
        self.assertIn('provider', allowed.json)

    def test_location_share_is_token_protected_and_can_be_stopped(self):
        self.register()
        self.client.patch('/api/auth/preferences', json={'locationConsent': True})

        created = self.client.post('/api/location-shares', json={
            'minutes': 30,
            'recipientLabel': 'Trusted friend',
            'message': 'Walking home',
            'location': {'lat': 28.6139, 'lng': 77.2090, 'accuracyMeters': 25}
        })
        self.assertEqual(created.status_code, 201)
        share = created.json['share']
        self.assertIn('token', share)
        self.assertIn('ownerToken', share)
        self.assertEqual(share['location']['lat'], 28.6139)

        public = self.client.get(f"/api/location-shares/{share['token']}/public")
        self.assertEqual(public.status_code, 200)
        self.assertTrue(public.json['share']['active'])
        self.assertNotIn('ownerToken', public.json['share'])

        stopped = self.client.post(
            f"/api/location-shares/{share['token']}/stop",
            json={'ownerToken': share['ownerToken']}
        )
        self.assertEqual(stopped.status_code, 200)

        after_stop = self.client.get(f"/api/location-shares/{share['token']}/public")
        self.assertFalse(after_stop.json['share']['active'])
        self.assertIsNone(after_stop.json['share']['location'])

    def test_location_share_requires_authentication_and_consent(self):
        anonymous = self.client.post('/api/location-shares', json={'minutes': 30})
        self.assertEqual(anonymous.status_code, 401)

        self.register()
        without_consent = self.client.post('/api/location-shares', json={'minutes': 30})
        self.assertEqual(without_consent.status_code, 403)

    def test_location_share_cannot_be_updated_by_another_account(self):
        self.register()
        self.client.patch('/api/auth/preferences', json={'locationConsent': True})
        created = self.client.post('/api/location-shares', json={
            'minutes': 30,
            'location': {'lat': 28.6139, 'lng': 77.2090}
        })
        share = created.json['share']
        self.client.post('/api/auth/logout')

        self.register(email='mira@example.com', password='OtherPass123', phone='+91 98765 43211')
        self.client.patch('/api/auth/preferences', json={'locationConsent': True})
        hijack = self.client.patch(
            f"/api/location-shares/{share['token']}",
            json={
                'ownerToken': share['ownerToken'],
                'location': {'lat': 0.0, 'lng': 0.0}
            }
        )
        self.assertEqual(hijack.status_code, 404)

        public = self.client.get(f"/api/location-shares/{share['token']}/public")
        self.assertEqual(public.json['share']['location']['lat'], 28.6139)

    def test_forgot_password_token_is_hidden_unless_explicitly_exposed(self):
        self.register()
        Config.EXPOSE_DEV_RESET_TOKEN = False

        hidden = self.client.post('/api/auth/forgot-password', json={'email': 'asha@example.com'})
        self.assertEqual(hidden.status_code, 200)
        self.assertNotIn('devResetToken', hidden.json)
        self.assertFalse(hidden.json['emailDeliveryConfigured'])

        Config.EXPOSE_DEV_RESET_TOKEN = True
        exposed = self.client.post('/api/auth/forgot-password', json={'email': 'asha@example.com'})
        self.assertEqual(exposed.status_code, 200)
        token = exposed.json['devResetToken']
        self.assertTrue(token)

        reset = self.client.post('/api/auth/reset-password', json={
            'token': token,
            'newPassword': 'ResetPass456'
        })
        self.assertEqual(reset.status_code, 200)

        login = self.client.post('/api/auth/login', json={
            'email': 'asha@example.com',
            'password': 'ResetPass456'
        })
        self.assertEqual(login.status_code, 200)

    def test_account_deletion_purges_shares_and_session(self):
        self.register()
        self.client.patch('/api/auth/preferences', json={'locationConsent': True})
        created = self.client.post('/api/location-shares', json={
            'minutes': 30,
            'location': {'lat': 19.0760, 'lng': 72.8777}
        })
        token = created.json['share']['token']

        wrong = self.client.delete('/api/auth/account', json={'password': 'WrongPass123'})
        self.assertEqual(wrong.status_code, 400)

        deleted = self.client.delete('/api/auth/account', json={'password': 'SafePass123'})
        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(self.client.get('/api/auth/me').status_code, 401)
        self.assertEqual(
            self.client.get(f'/api/location-shares/{token}/public').status_code,
            404
        )

    def test_deepfake_inspection_reports_not_determined_and_retains_no_file(self):
        self.register()
        # A valid 1x1 PNG, used only to exercise the inspection path.
        png_bytes = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
            b'\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01'
            b'\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        )

        response = self.client.post(
            '/api/deepfake/analyze',
            data={'file': (io.BytesIO(png_bytes), 'sample.png')},
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['authenticityStatus'], 'not_determined')
        self.assertFalse(response.json['detectorConfigured'])
        self.assertFalse(response.json['mediaRetained'])
        self.assertEqual(response.json['metadata']['signature'], 'png')


if __name__ == '__main__':
    unittest.main()
