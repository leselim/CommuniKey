from django.db import models
from django.conf import settings
from apps.communities.models import Community

class Event(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='events')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_events')
    event_name = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateTimeField()
    event_location = models.CharField(max_length=255)
    max_attendees = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['event_date']

    def __str__(self):
        return f"{self.event_name} ({self.event_date.strftime('%Y-%m-%d %H:%M')})"

class EventRSVP(models.Model):
    STATUS_CHOICES = (
        ('ATTENDING', 'Attending'),
        ('MAYBE', 'Maybe'),
        ('DECLINED', 'Declined'),
    )

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='rsvps')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_rsvps')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ATTENDING')
    rsvp_date = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('event', 'user')

    def __str__(self):
        return f"{self.user.email} - {self.event.event_name} ({self.status})"
