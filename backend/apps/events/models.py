from django.db import models
from django.conf import settings
from apps.communities.models import Community

class Event(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    created_by = models.CharField(max_length=100, default='Community Administrator')
    title = models.CharField(max_length=255)
    event_name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    event_date = models.DateTimeField()
    venue = models.CharField(max_length=255, default='Estate Clubhouse')
    location = models.CharField(max_length=255, default='Estate Clubhouse')
    organiser = models.CharField(max_length=100, default='Safety Committee')
    time = models.CharField(max_length=100, default='18:30 to 19:30')
    max_attendees = models.IntegerField(default=80)
    attendees_count = models.IntegerField(default=0)

    def __str__(self):
        return self.title

class EventRSVP(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='rsvps')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_rsvps')
    attending = models.BooleanField(default=True)
    date_rsvp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('event', 'user')
