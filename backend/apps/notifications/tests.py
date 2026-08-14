from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Notification

User = get_user_model()

class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='notified@example.com',
            username='notified1',
            password='Password123!'
        )
        self.client.force_authenticate(user=self.user)

    def test_list_notifications_and_mark_read(self):
        notification = Notification.objects.create(
            user=self.user,
            notification_type='EMERGENCY',
            title='SOS Alert Nearby',
            message='Emergency SOS triggered in your block.'
        )

        list_url = '/api/v1/notifications/'
        response = self.client.get(list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        read_url = f'/api/v1/notifications/{notification.id}/read/'
        read_res = self.client.put(read_url)
        self.assertEqual(read_res.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertTrue(notification.read_status)
