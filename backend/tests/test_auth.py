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
        Config.AUTH_DATABASE = os.path.join(self.temp_directory.name, 'test_accounts.sqlite3')
        app.config['TESTING'] = True
        self.client = app.test_client()

    def tearDown(self):
        Config.AUTH_DATABASE = self.original_database
        self.temp_directory.cleanup()

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


if __name__ == '__main__':
    unittest.main()
