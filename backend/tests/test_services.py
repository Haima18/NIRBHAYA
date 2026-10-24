import unittest
import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.text_analyzer import analyze_message_text
from services.ai_provider import get_ai_guidance

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

if __name__ == '__main__':
    unittest.main()
