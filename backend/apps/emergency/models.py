from django.db import models
from django.conf import settings
from apps.communities.models import Community

class SOSAlert(models.Model):
    ALERT_TYPES = (
        ('MEDICAL', 'Medical Emergency'),
        ('CRIME', 'Crime / Intruder'),
        ('FIRE', 'Fire Emergency'),
        ('GENERAL', 'General SOS Panic'),
    )

    STATUS_CHOICES = (
        ('ACTIVE', 'Active SOS'),
        ('RESOLVED', 'Resolved'),
        ('CANCELLED', 'Cancelled'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sos_alerts')
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='sos_alerts')
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPES, default='GENERAL')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    note = models.TextField(blank=True, null=True)
    time_activated = models.DateTimeField(auto_now_add=True)
    time_resolved = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_sos_alerts'
    )

    class Meta:
        ordering = ['-time_activated']

    def __str__(self):
        return f"SOS by {self.user.email} in {self.community.name} ({self.status})"
