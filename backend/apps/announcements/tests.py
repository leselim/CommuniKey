from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from .models import Announcement

class AnnouncementsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.announcement = Announcement.objects.create(
            title='Test Announcement',
            content='Testing community announcements functionality.',
            priority='normal'
        )

    def test_list_announcements(self):
        response = self.client.get(reverse('announcement_list_create'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

    def test_create_announcement(self):
        response = self.client.post(reverse('announcement_list_create'), {
            'title': 'New Alert',
            'content': 'Emergency watch alert.',
            'priority': 'high'
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])
