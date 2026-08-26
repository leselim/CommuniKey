from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import AuditLog

User = get_user_model()

class AnalyticsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password='Password123!',
            first_name='Marcus',
            last_name='Vance',
            role='Estate Administrator'
        )
        self.resident_user = User.objects.create_user(
            username='residentuser',
            email='resident@example.com',
            password='Password123!',
            first_name='Thabo',
            last_name='Mokoena',
            role='Resident'
        )

        AuditLog.objects.create(
            user=self.admin_user,
            user_name='Marcus Vance',
            role='Estate Administrator',
            action='ANNOUNCEMENT_PUBLISHED',
            details='Published water outage notice',
            status='Success'
        )

    def test_admin_access_analytics_overview(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(reverse('analytics_overview'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertIn('metrics', response.data['data'])
        self.assertIn('telemetry', response.data['data'])

    def test_resident_forbidden_analytics_overview(self):
        self.client.force_authenticate(user=self.resident_user)
        response = self.client.get(reverse('analytics_overview'))
        self.assertEqual(response.status_code, 403)
        self.assertFalse(response.data['success'])

    def test_activity_logs_retrieval(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(reverse('analytics_activity_logs'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(len(response.data['data']), 1)
