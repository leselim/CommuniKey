from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('RESIDENT', 'Resident'),
        ('COMMUNITY_ADMIN', 'Community Administrator'),
        ('SAFETY_VOLUNTEER', 'Safety Volunteer'),
        ('SYSTEM_ADMIN', 'System Administrator'),
    )

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.CharField(max_length=500, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='RESIDENT')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
