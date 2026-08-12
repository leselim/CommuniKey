from django.db import models
from django.conf import settings
from apps.communities.models import Community

class Announcement(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='announcements')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=200)
    content = models.TextField()
    is_pinned = models.BooleanField(default=False)
    date_published = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-date_published']

    def __str__(self):
        return f"{self.title} ({self.community.name})"
