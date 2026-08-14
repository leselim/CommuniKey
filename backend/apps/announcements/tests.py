from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.communities.models import Community
from .models import Announcement

User = get_user_model()

class AnnouncementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='admin@example.com',
            username='admin1',
            password='Password123!',
            role='COMMUNITY_ADMIN'
        )
        self.community = Community.objects.create(
            name='Greenwood Village',
            description='Safe and quiet neighborhood',
            city='Johannesburg',
            created_by=self.user
        )
        self.client.force_authenticate(user=self.user)

    def test_create_announcement_success(self):
        url = '/api/v1/announcements/'
        data = {
            'community': self.community.id,
            'title': 'Annual General Meeting',
            'content': 'AGM will be held on Friday at the community hall.',
            'is_pinned': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Announcement.objects.count(), 1)
        self.assertTrue(Announcement.objects.first().is_pinned)

    def test_list_announcements_filtered_by_community(self):
        Announcement.objects.create(
            community=self.community,
            created_by=self.user,
            title='Water Supply Interruption',
            content='Maintenance planned for tomorrow.'
        )
        url = f'/api/v1/announcements/?community={self.community.id}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
