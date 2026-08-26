from django.db import models
from django.conf import settings
from apps.communities.models import Community

class SOSAlert(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Dispatched', 'Dispatched'),
        ('Resolved', 'Resolved'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='sos_alerts', null=True, blank=True)
    latitude = models.FloatField(default=-25.7461)
    longitude = models.FloatField(default=28.1881)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Active')
    time_activated = models.DateTimeField(auto_now_add=True)
    time_resolved = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"SOS Alert #{self.id} ({self.status})"
