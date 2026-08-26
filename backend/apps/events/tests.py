from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.utils import timezone
from .models import Event

class EventsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.event = Event.objects.create(
            title='Park Clean Up',
            description='Community clean up event.',
            event_date=timezone.now(),
            venue='Main Park'
        )

    def test_list_events(self):
        response = self.client.get(reverse('event_list_create'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

    def test_event_rsvp(self):
        response = self.client.post(reverse('event_rsvp', kwargs={'pk': self.event.pk}), {
            'attending': True
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
