from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.communities.models import Community
from .models import Incident

User = get_user_model()

class IncidentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='reporter@example.com',
            username='reporter1',
            password='Password123!'
        )
        self.community = Community.objects.create(
            name='Hillside Village',
            city='Durban',
            created_by=self.user
        )
        self.client.force_authenticate(user=self.user)

    def test_report_incident(self):
        data = {
            'community': self.community.id,
            'incident_type': 'CRIME',
            'title': 'Suspicious vehicle',
            'description': 'Unrecognized car idling near gate 2'
        }
        response = self.client.post('/api/v1/incidents/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Incident.objects.count(), 1)
        self.assertEqual(Incident.objects.first().title, 'Suspicious vehicle')
