from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from .models import Community

class CommunitiesTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.community = Community.objects.create(
            community_name='Riverside Estate',
            suburb='Riverside',
            city='Pretoria',
            province='Gauteng'
        )

    def test_list_communities(self):
        response = self.client.get(reverse('community_list_create'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(len(response.data['data']), 1)

    def test_create_community(self):
        response = self.client.post(reverse('community_list_create'), {
            'community_name': 'Hillcrest Estate',
            'suburb': 'Hillcrest',
            'city': 'Pretoria',
            'province': 'Gauteng'
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])
