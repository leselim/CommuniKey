from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from .models import IncidentReport

class IncidentsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.incident = IncidentReport.objects.create(
            incident_type='Suspicious activity',
            description='Test incident description.',
            location='Riverside Drive'
        )

    def test_list_incidents(self):
        response = self.client.get(reverse('incident_list_create'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

    def test_report_incident(self):
        response = self.client.post(reverse('incident_list_create'), {
            'incident_type': 'Streetlight fault',
            'description': 'Light bulb broken.',
            'location': 'Mill Road'
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])
