from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.profile_url = '/api/v1/auth/profile/'
        
        self.user_data = {
            'email': 'resident@example.com',
            'username': 'resident1',
            'first_name': 'Jane',
            'last_name': 'Doe',
            'password': 'Password123!',
            'confirm_password': 'Password123!',
            'role': 'RESIDENT'
        }

    def test_register_user_success(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='resident@example.com').exists())

    def test_login_user_success(self):
        User.objects.create_user(
            email='resident@example.com',
            username='resident1',
            password='Password123!'
        )
        login_data = {
            'email': 'resident@example.com',
            'password': 'Password123!'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_get_user_profile_authenticated(self):
        user = User.objects.create_user(
            email='resident@example.com',
            username='resident1',
            password='Password123!'
        )
        self.client.force_authenticate(user=user)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], 'resident@example.com')
