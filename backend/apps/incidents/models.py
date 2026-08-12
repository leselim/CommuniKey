from django.db import models
from django.conf import settings
from apps.communities.models import Community

class Incident(models.Model):
    INCIDENT_TYPES = (
        ('CRIME', 'Crime & Theft'),
        ('FIRE', 'Fire Emergency'),
        ('MEDICAL', 'Medical Emergency'),
        ('INFRASTRUCTURE', 'Infrastructure Damage'),
        ('WATER', 'Water Service Outage / Leak'),
        ('ELECTRICITY', 'Electricity Outage / Fault'),
        ('DUMPING', 'Illegal Dumping'),
        ('NOISE', 'Noise Complaint'),
        ('SUSPICIOUS', 'Suspicious Activity'),
        ('OTHER', 'Other Incident'),
    )

    STATUS_CHOICES = (
        ('REPORTED', 'Reported'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('DISMISSED', 'Dismissed'),
    )

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='incidents')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reported_incidents')
    incident_type = models.CharField(max_length=30, choices=INCIDENT_TYPES, default='SUSPICIOUS')
    title = models.CharField(max_length=200)
    description = models.TextField()
    image_url = models.CharField(max_length=500, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REPORTED')
    date_reported = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_reported']

    def __str__(self):
        return f"{self.get_incident_type_display()} - {self.title} ({self.status})"
