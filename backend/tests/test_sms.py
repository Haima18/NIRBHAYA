import os
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from config import Config


class TestSmsEndpoint(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        self.original_database = Config.AUTH_DATABASE
        self.original_rate_limit = Config.RATE_LIMIT_ENABLED
        self.original_twilio_values = (
            Config.TWILIO_ACCOUNT_SID,
            Config.TWILIO_AUTH_TOKEN,
            Config.TWILIO_FROM_NUMBER,
        )
        Config.AUTH_DATABASE = os.path.join(self.temp_directory.name, 'test_accounts.sqlite3')
        Config.RATE_LIMIT_ENABLED = False
        app.config['TESTING'] = True
        self.client = app.test_client()

    def tearDown(self):
        Config.AUTH_DATABASE = self.original_database
        Config.RATE_LIMIT_ENABLED = self.original_rate_limit
        (
            Config.TWILIO_ACCOUNT_SID,
            Config.TWILIO_AUTH_TOKEN,
            Config.TWILIO_FROM_NUMBER,
        ) = self.original_twilio_values
        self.temp_directory.cleanup()

    def register(self):
        return self.client.post('/api/auth/register', json={
            'name': 'Asha Rao',
            'email': 'asha@example.com',
            'phone': '+919876543210',
            'password': 'SafePass123',
        })

    def test_sms_alert_requires_authentication(self):
        response = self.client.post('/api/alerts/sms', json={
            'recipients': ['+919876543210'],
            'message': 'Please check on me.',
        })
        self.assertEqual(response.status_code, 401)

    def test_sms_alert_requires_provider_configuration(self):
        self.register()
        with patch('app.is_sms_configured', return_value=False):
            response = self.client.post('/api/alerts/sms', json={
                'recipients': ['+919876543210'],
                'message': 'Please check on me.',
            })
        self.assertEqual(response.status_code, 503)

    def test_sms_alert_rejects_invalid_recipients(self):
        self.register()
        with patch('app.is_sms_configured', return_value=True):
            response = self.client.post('/api/alerts/sms', json={
                'recipients': ['9876543210'],
                'message': 'Please check on me.',
            })
        self.assertEqual(response.status_code, 400)

    def test_sms_alert_sends_only_to_explicit_recipients(self):
        self.register()
        recipients = ['+919876543210', '+919876543211']
        with patch('app.is_sms_configured', return_value=True), patch('app.send_sms') as send_sms:
            response = self.client.post('/api/alerts/sms', json={
                'recipients': recipients,
                'message': 'Please check on me.',
            })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['acceptedCount'], 2)
        self.assertFalse(response.json['deliveryConfirmed'])
        self.assertEqual(
            [call.args for call in send_sms.call_args_list],
            [(recipients[0], 'Please check on me.'), (recipients[1], 'Please check on me.')],
        )


if __name__ == '__main__':
    unittest.main()