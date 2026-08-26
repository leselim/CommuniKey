from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from .models import SOSAlert

class EmergencyTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_trigger_sos(self):
        response = self.client.post(reverse('sos_list_create'), {
            'latitude': -25.7461,
            'longitude': 28.1881
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])

    def test_resolve_sos(self):
        alert = SOSAlert.objects.create(latitude=-25.7461, longitude=28.1881)
        response = self.client.put(reverse('sos_resolve', kwargs={'pk': alert.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
