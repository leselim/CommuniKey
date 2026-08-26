from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='Password123!',
            first_name='Test',
            last_name='User',
            role='Resident'
        )

    def test_register_user(self):
        response = self.client.post(reverse('register'), {
            'email': 'new@example.com',
            'password': 'Password123!',
            'first_name': 'New',
            'last_name': 'Resident',
            'role': 'Resident'
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])

    def test_login_user(self):
        response = self.client.post(reverse('login'), {
            'email': 'test@example.com',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

    def test_profile_retrieval(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
