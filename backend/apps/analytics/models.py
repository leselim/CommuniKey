from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    ACTION_TYPES = (
        ('USER_REGISTRATION', 'User Registration'),
        ('ROLE_CHANGE', 'Role Change'),
        ('INCIDENT_REPORTED', 'Incident Reported'),
        ('INCIDENT_RESOLVED', 'Incident Resolved'),
        ('SOS_TRIGGERED', 'SOS Alert Triggered'),
        ('ANNOUNCEMENT_PUBLISHED', 'Announcement Published'),
        ('EVENT_CREATED', 'Event Created'),
        ('VERIFICATION_APPROVED', 'Verification Approved'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    user_name = models.CharField(max_length=150, default='System')
    role = models.CharField(max_length=50, default='Resident')
    action = models.CharField(max_length=100, choices=ACTION_TYPES)
    category = models.CharField(max_length=100, default='General')
    details = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Success')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.timestamp} - {self.action} by {self.user_name} ({self.status})"
