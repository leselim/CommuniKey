from django.db import models
from django.conf import settings

class Community(models.Model):
    community_name = models.CharField(max_length=200)
    suburb = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    community_type = models.CharField(max_length=100, default='Residential Estate')
    member_count = models.IntegerField(default=1)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.community_name

class CommunityMembership(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='memberships')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Approved')
    join_date = models.DateTimeField(auto_now_add=True)
    approval_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.email} -> {self.community.community_name} ({self.status})"
