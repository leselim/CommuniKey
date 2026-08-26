from django.db import models
from django.conf import settings
from apps.communities.models import Community

class Announcement(models.Model):
    PRIORITY_CHOICES = (
        ('normal', 'Normal'),
        ('high', 'High Priority'),
        ('urgent', 'Urgent Emergency'),
    )

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='announcements', null=True, blank=True)
    created_by = models.CharField(max_length=100, default='Community Administrator')
    title = models.CharField(max_length=255)
    content = models.TextField()
    date_published = models.DateTimeField(auto_now_add=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')

    def __str__(self):
        return f"{self.title} ({self.priority})"
