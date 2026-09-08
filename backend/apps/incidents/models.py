from django.db import models
from django.conf import settings
from apps.communities.models import Community

class IncidentReport(models.Model):
    STATUS_CHOICES = (
        ('Reported', 'Reported'),
        ('Under review', 'Under review'),
        ('Resolved', 'Resolved'),
    )

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='incidents', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    incident_type = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=255, default='Riverside Drive')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Reported')
    date_reported = models.DateTimeField(auto_now_add=True)
    # Set when the status moves to Resolved. Time to close is derived from
    # this and date_reported, so it must be a real column rather than a
    # value computed in the view.
    date_resolved = models.DateTimeField(blank=True, null=True)
    reported_by = models.CharField(max_length=100, default='Resident Member')
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Stamp the closing time once, the first time it is marked resolved.
        if self.status == 'Resolved' and self.date_resolved is None:
            from django.utils import timezone
            self.date_resolved = timezone.now()
        if self.status != 'Resolved':
            self.date_resolved = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.incident_type} at {self.location} ({self.status})"
