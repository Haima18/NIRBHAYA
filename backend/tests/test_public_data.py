import os
import sys
import tempfile
import unittest
import json
from datetime import datetime, timedelta, timezone
from email.utils import format_datetime
from urllib.parse import parse_qs, urlparse
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import app as app_module
from app import app
from config import Config


class TestPublicDataEndpoints(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        self.original_database = Config.AUTH_DATABASE
        self.original_rate_limit = Config.RATE_LIMIT_ENABLED
        Config.AUTH_DATABASE = os.path.join(self.temp_directory.name, 'test_public_data.sqlite3')
        Config.RATE_LIMIT_ENABLED = False
        app.config['TESTING'] = True
        self.client = app.test_client()
        with app_module._PUBLIC_DATA_CACHE_LOCK:
            app_module._PUBLIC_DATA_CACHE.clear()

    def tearDown(self):
        Config.AUTH_DATABASE = self.original_database
        Config.RATE_LIMIT_ENABLED = self.original_rate_limit
        self.temp_directory.cleanup()

    def sign_in(self):
        return self.client.post('/api/auth/register', json={
            'name': 'Asha Rao',
            'email': 'asha@example.com',
            'phone': '+91 98765 43210',
            'password': 'SafePass123'
        })

    def test_live_news_requires_an_authenticated_account(self):
        with patch.object(app_module, '_rate_limit') as rate_limit:
            response = self.client.get('/api/news/headlines')
        self.assertEqual(response.status_code, 401)
        rate_limit.assert_not_called()

    def test_news_merges_sources_and_deduplicates_urls(self):
        self.sign_in()
        now = datetime.now(timezone.utc)
        gdelt = [{
            'url': 'https://news.example.org/story',
            'title': 'Safety report',
            'domain': 'news.example.org',
            'seendate': now.strftime('%Y%m%dT%H%M%SZ'),
        }, {
            'url': 'https://news.example.org/old-story',
            'title': 'Old report',
            'domain': 'news.example.org',
            'seendate': '20200101T030107Z',
        }]
        un_women = [
            {
                'url': 'https://news.example.org/story',
                'title': 'Duplicate',
                'domain': 'UN Women',
                'seendate': '',
            },
            {
                'url': 'https://www.unwomen.org/en/news/example',
                'title': 'UN report',
                'domain': 'UN Women',
                'seendate': format_datetime(now - timedelta(days=1)),
            },
            {'url': 'javascript:alert(1)', 'title': 'Unsafe link', 'domain': 'bad', 'seendate': ''},
        ]
        with patch.object(app_module, '_fetch_gdelt_articles', return_value=gdelt), patch.object(
            app_module, '_fetch_un_women_articles', return_value=un_women
        ), patch.object(app_module, '_fetch_the_19th_articles', return_value=[]), patch.object(
            app_module, '_fetch_fuller_articles', return_value=[]
        ), patch.object(app_module, '_fetch_un_news_articles', return_value=[]):
            response = self.client.get('/api/news/headlines')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['url'] for item in response.json['articles']], [
            'https://news.example.org/story',
            'https://www.unwomen.org/en/news/example',
        ])
        self.assertEqual(response.json['articles'][0]['title'], 'Safety report')

    def test_news_reports_unavailable_when_all_sources_fail(self):
        self.sign_in()
        with patch.object(app_module, '_fetch_gdelt_articles', side_effect=ValueError), patch.object(
            app_module, '_fetch_un_women_articles', side_effect=ValueError
        ), patch.object(app_module, '_fetch_the_19th_articles', side_effect=ValueError), patch.object(
            app_module, '_fetch_fuller_articles', side_effect=ValueError
        ), patch.object(app_module, '_fetch_un_news_articles', side_effect=ValueError):
            response = self.client.get('/api/news/headlines')
        self.assertEqual(response.status_code, 503)
        self.assertIn('temporarily unavailable', response.json['error'])

    def test_news_merges_recent_women_focused_publisher_feeds(self):
        self.sign_in()
        now = datetime.now(timezone.utc)
        recent_article = {
            'url': 'https://19thnews.org/recent-story',
            'title': 'Women voters shape today’s election coverage',
            'domain': 'The 19th',
            'seendate': format_datetime(now),
        }
        with patch.object(app_module, '_fetch_gdelt_articles', return_value=[]), patch.object(
            app_module, '_fetch_un_women_articles', return_value=[]
        ), patch.object(app_module, '_fetch_the_19th_articles', return_value=[recent_article]), patch.object(
            app_module, '_fetch_fuller_articles', return_value=[]
        ), patch.object(app_module, '_fetch_un_news_articles', return_value=[]):
            response = self.client.get('/api/news/headlines')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json['articles']), 1)
        self.assertEqual(response.json['articles'][0]['domain'], 'The 19th')

    def test_empty_news_cache_expires_quickly(self):
        with patch.object(app_module.time, 'monotonic', side_effect=[100, 110, 116]):
            app_module._store_cached_news({'articles': []})
            self.assertEqual(app_module._get_cached_news(), {'articles': []})
            self.assertIsNone(app_module._get_cached_news())

    def test_nearby_lookup_requires_authentication_and_valid_coordinates(self):
        with patch.object(app_module, '_rate_limit') as rate_limit:
            unauthenticated = self.client.get('/api/location/nearby?lat=0&lng=0')
        self.assertEqual(unauthenticated.status_code, 401)
        rate_limit.assert_not_called()
        self.sign_in()
        invalid = self.client.get('/api/location/nearby?lat=91&lng=0')
        self.assertEqual(invalid.status_code, 400)

    @patch('app.urlopen')
    def test_nearby_lookup_bounds_radius_and_returns_mapped_places(self, urlopen):
        self.sign_in()
        response_data = {
            'elements': [
                {
                    'type': 'node',
                    'id': 12,
                    'lat': 28.632,
                    'lon': 77.217,
                    'tags': {'amenity': 'police', 'name': 'Central Police Station', 'phone': '+911234'},
                },
                {
                    'type': 'way',
                    'id': 13,
                    'center': {'lat': 28.64, 'lon': 77.22},
                    'tags': {'amenity': 'hospital', 'name': 'City Hospital', 'addr:city': 'Delhi'},
                },
                {
                    'type': 'node',
                    'id': 15,
                    'lat': 28.63,
                    'lon': 77.21,
                    'tags': {'railway': 'station', 'name': 'Central Rail Station'},
                },
                {
                    'type': 'node',
                    'id': 16,
                    'lat': 28.63,
                    'lon': 77.21,
                    'tags': {'highway': 'bus_stop', 'name': 'Central Bus Stop'},
                },
                {
                    'type': 'node',
                    'id': 17,
                    'lat': 28.63,
                    'lon': 77.21,
                    'tags': {'tourism': 'hotel', 'name': 'Central Hotel'},
                },
                {
                    'type': 'node',
                    'id': 18,
                    'lat': 28.63,
                    'lon': 77.21,
                    'tags': {'amenity': 'taxi', 'name': 'Central Taxi Stand'},
                },
                {'type': 'node', 'id': 14, 'tags': {'amenity': 'clinic'}},
            ]
        }
        upstream_response = MagicMock()
        upstream_response.read.return_value = json.dumps(response_data).encode('utf-8')
        urlopen.return_value.__enter__.return_value = upstream_response

        response = self.client.get('/api/location/nearby?lat=28.6315&lng=77.2167&radius=50000')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json['places']), 6)
        self.assertEqual(response.json['places'][0]['name'], 'Central Police Station')
        self.assertEqual(response.json['places'][0]['phone'], '+911234')
        hospital = next(place for place in response.json['places'] if place['name'] == 'City Hospital')
        self.assertEqual(hospital['address'], 'Delhi')
        self.assertEqual({place['category'] for place in response.json['places']}, {
            'police', 'hospital', 'railway_station', 'bus_stop', 'hotel', 'taxi'
        })
        upstream_request = urlopen.call_args.args[0]
        query = parse_qs(urlparse(upstream_request.full_url).query)['data'][0]
        self.assertIn('around:10000,28.6315,77.2167', query)
        self.assertIn('NIRBHAYA/1.0', upstream_request.get_header('User-agent'))
        self.assertEqual(urlopen.call_args.kwargs['timeout'], 25)

    def test_nearby_place_categories_cover_requested_transport_and_stays(self):
        self.assertEqual(app_module._nearby_place_category({'railway': 'station'}), 'railway_station')
        self.assertEqual(app_module._nearby_place_category({'highway': 'bus_stop'}), 'bus_stop')
        self.assertEqual(app_module._nearby_place_category({'amenity': 'taxi'}), 'taxi')
        self.assertEqual(app_module._nearby_place_category({'tourism': 'hotel'}), 'hotel')


if __name__ == '__main__':
    unittest.main()
