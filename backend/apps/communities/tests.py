from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Community, CommunityMembership

User = get_user_model()

class CommunityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='admin@example.com',
            username='admin1',
            password='Password123!',
            role='COMMUNITY_ADMIN'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_community(self):
        data = {
            'name': 'Greenwood Estate',
            'description': 'A safe community',
            'city': 'Cape Town',
            'community_type': 'APARTMENT'
        }
        response = self.client.post('/api/v1/communities/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Community.objects.count(), 1)
        self.assertTrue(CommunityMembership.objects.filter(community__name='Greenwood Estate', user=self.user).exists())

    def test_join_and_leave_community(self):
        community = Community.objects.create(
            name='Sunset Valley',
            city='Johannesburg',
            created_by=self.user
        )
        resident = User.objects.create_user(
            email='res@example.com',
            username='res1',
            password='Password123!'
        )
        self.client.force_authenticate(user=resident)
        join_res = self.client.post(f'/api/v1/communities/{community.id}/join/')
        self.assertEqual(join_res.status_code, status.HTTP_200_OK)

        leave_res = self.client.post(f'/api/v1/communities/{community.id}/leave/')
        self.assertEqual(leave_res.status_code, status.HTTP_200_OK)
