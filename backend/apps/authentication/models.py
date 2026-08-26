from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Resident', 'Resident'),
        ('Estate Administrator', 'Estate Administrator'),
        ('Safety Volunteer', 'Safety Volunteer'),
        ('System Administrator', 'System Administrator'),
    )

    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Resident')
    phone_number = models.CharField(max_length=30, blank=True, null=True, default='+27 82 000 0000')
    address = models.CharField(max_length=255, blank=True, null=True, default='14 Riverside Drive')
    status = models.CharField(max_length=50, default='Verified')
    notify_emergency = models.BooleanField(default=True)
    notify_events = models.BooleanField(default=True)
    notify_announcements = models.BooleanField(default=True)
    share_location = models.BooleanField(default=True)
    gate_access_code = models.CharField(max_length=50, blank=True, null=True, default='GATE-KEY-8841')
    emergency_notes = models.TextField(blank=True, null=True)
    household_vehicle = models.CharField(max_length=100, blank=True, null=True)
    emergency_role = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
