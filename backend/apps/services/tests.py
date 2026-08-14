from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.communities.models import Community
from .models import LostAndFoundItem, ServiceProvider

User = get_user_model()

class ServicesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='resident@example.com',
            username='resident1',
            password='Password123!'
        )
        self.community = Community.objects.create(
            name='Sunset Heights',
            description='A vibrant community',
            city='Cape Town',
            created_by=self.user
        )
        self.client.force_authenticate(user=self.user)

    def test_create_and_list_lost_and_found_item(self):
        url = '/api/v1/services/lost-and-found/'
        data = {
            'community': self.community.id,
            'item_type': 'LOST',
            'category': 'KEYS',
            'title': 'Lost Car Key Ring',
            'description': 'Silver keychain with 3 keys lost near main gate.',
            'contact_info': '082 123 4567'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LostAndFoundItem.objects.count(), 1)

        list_res = self.client.get(f"{url}?community={self.community.id}")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)

    def test_create_and_list_service_provider(self):
        url = '/api/v1/services/providers/'
        data = {
            'community': self.community.id,
            'service_type': 'PLUMBING',
            'business_name': 'Quick Fix Plumbers',
            'contact_person': 'John Fixer',
            'phone_number': '083 999 8888',
            'description': 'Fast local plumbing repairs.'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ServiceProvider.objects.count(), 1)

        list_res = self.client.get(f"{url}?community={self.community.id}")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
