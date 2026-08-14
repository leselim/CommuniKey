from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from apps.communities.models import Community
from .models import Event, EventRSVP

User = get_user_model()

class EventTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='organizer@example.com',
            username='organizer1',
            password='Password123!'
        )
        self.community = Community.objects.create(
            name='Ocean View Estate',
            description='Coastal residential estate',
            city='Durban',
            created_by=self.user
        )
        self.client.force_authenticate(user=self.user)

    def test_create_and_list_event(self):
        url = '/api/v1/events/'
        event_time = (timezone.now() + timedelta(days=7)).isoformat()
        data = {
            'community': self.community.id,
            'event_name': 'Community Clean-Up Day',
            'description': 'Help clean up our local beach and park.',
            'event_date': event_time,
            'event_location': 'Main Park Pavilion',
            'max_attendees': 50
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Event.objects.count(), 1)

    def test_rsvp_to_event(self):
        event = Event.objects.create(
            community=self.community,
            created_by=self.user,
            event_name='Neighborhood Braai',
            description='Social gathering for residents',
            event_date=timezone.now() + timedelta(days=3),
            event_location='Clubhouse'
        )
        url = f'/api/v1/events/{event.id}/rsvp/'
        data = {'status': 'ATTENDING'}
        response = self.client.post(url, data, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertEqual(EventRSVP.objects.filter(event=event, user=self.user).count(), 1)
