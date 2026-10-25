import unittest
import sys
import os
from unittest.mock import patch

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.text_analyzer import analyze_message_text
from services.ai_provider import get_ai_guidance
from config import Config

class TestBackendServices(unittest.TestCase):
    def test_text_analyzer_extortion(self):
        res = analyze_message_text("Pay me 50000 in bitcoin or else I leak your photos")
        self.assertEqual(res['overallRisk'], 'critical')
        self.assertTrue(len(res['detectedPatterns']) > 0)

    def test_text_analyzer_benign(self):
        res = analyze_message_text("Hello, let us meet for lunch")
        self.assertEqual(res['overallRisk'], 'low')

    def test_text_analyzer_handles_empty_input(self):
        res = analyze_message_text(None)
        self.assertEqual(res['overallRisk'], 'low')
        self.assertEqual(res['detectedPatterns'], [])

    def test_ai_guidance_fallback(self):
        res = get_ai_guidance("I am in danger right now help")
        self.assertIn("112", res['reply'])
        self.assertTrue(len(res['suggestedActions']) > 0)

    def test_ai_guidance_handles_empty_input(self):
        res = get_ai_guidance("")
        self.assertEqual(res['provider'], 'NIRBHAYA Local Safety Engine')
        self.assertTrue(len(res['suggestedActions']) > 0)

    def test_ai_guidance_does_not_treat_ordinary_help_as_emergency(self):
        with patch.multiple(Config, ANTHROPIC_API_KEY='', OPENAI_API_KEY='', GEMINI_API_KEY=''):
            result = get_ai_guidance('Can you help me understand what to do if police refuse my FIR?')

        self.assertIn('Zero FIR', result['reply'])
        self.assertNotIn('Call 112 now', result['reply'])

    def test_ai_guidance_keeps_explicit_emergency_routing(self):
        with patch.multiple(Config, ANTHROPIC_API_KEY='', OPENAI_API_KEY='', GEMINI_API_KEY=''):
            result = get_ai_guidance('I am in immediate danger right now')

        self.assertIn('Call 112 now', result['reply'])

    def test_ai_guidance_routes_domestic_abuse_to_safety_planning(self):
        with patch.multiple(Config, ANTHROPIC_API_KEY='', OPENAI_API_KEY='', GEMINI_API_KEY=''):
            result = get_ai_guidance('My husband controls my phone; how can I plan safely?')

        self.assertIn('Safety planning for abuse or control', result['reply'])
        self.assertNotIn('Call 112 now', result['reply'])

    @patch('services.ai_provider.requests.post')
    def test_gemini_uses_configured_stable_model_and_separate_system_prompt(self, post):
        response = post.return_value
        response.status_code = 200
        response.json.return_value = {
            'candidates': [{'content': {'parts': [{'text': 'A safety-first answer.'}]}}]
        }
        with patch.multiple(
            Config,
            ANTHROPIC_API_KEY='',
            OPENAI_API_KEY='',
            GEMINI_API_KEY='test-key',
            GEMINI_MODEL='gemini-test-model',
        ):
            result = get_ai_guidance('How can I preserve a message?', [])

        self.assertEqual(result['provider'], 'Google Gemini')
        self.assertIn('/models/gemini-test-model:generateContent', post.call_args.args[0])
        payload = post.call_args.kwargs['json']
        self.assertIn('systemInstruction', payload)
        self.assertEqual(payload['contents'][-1]['parts'][0]['text'], 'How can I preserve a message?')

if __name__ == '__main__':
    unittest.main()
