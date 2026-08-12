from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.communities.models import Community
from .models import SOSAlert

User = get_user_model()

class EmergencyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='sos_user@example.com',
            username='sos_user',
            password='Password123!'
        )
        self.community = Community.objects.create(
            name='Oakridge Suburb',
            city='Pretoria',
            created_by=self.user
        )
        self.client.force_authenticate(user=self.user)

    def test_trigger_and_resolve_sos(self):
        data = {
            'community': self.community.id,
            'alert_type': 'MEDICAL',
            'note': 'Medical assistance needed at Unit 4B'
        }
        response = self.client.post('/api/v1/emergency/sos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        sos_id = response.data['id']

        resolve_res = self.client.put(f'/api/v1/emergency/sos/{sos_id}/resolve/', {'status': 'RESOLVED'}, format='json')
        self.assertEqual(resolve_res.status_code, status.HTTP_200_OK)
        self.assertEqual(SOSAlert.objects.get(id=sos_id).status, 'RESOLVED')
