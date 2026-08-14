from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('EMERGENCY', 'Emergency SOS Alert'),
        ('ANNOUNCEMENT', 'Community Announcement'),
        ('INCIDENT', 'Incident Report Update'),
        ('EVENT', 'Community Event Update'),
        ('MEMBERSHIP', 'Membership Request'),
        ('SYSTEM', 'System Notification'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, default='SYSTEM')
    title = models.CharField(max_length=200)
    message = models.TextField()
    read_status = models.BooleanField(default=False)
    date_sent = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_sent']

    def __str__(self):
        notif_label = dict(self.NOTIFICATION_TYPES).get(self.notification_type, self.notification_type)
        return f"{notif_label} for {self.user.email}: {self.title}"
