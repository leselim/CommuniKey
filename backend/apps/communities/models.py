from django.db import models
from django.conf import settings

class Community(models.Model):
    COMMUNITY_TYPES = (
        ('RESIDENTIAL', 'Residential Neighborhood'),
        ('APARTMENT', 'Apartment Complex / Estate'),
        ('CAMPUS', 'University / Campus'),
        ('VILLAGE', 'Village / Rural Area'),
        ('BUSINESS', 'Business Park / District'),
    )

    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    province = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100)
    suburb = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    community_type = models.CharField(max_length=30, choices=COMMUNITY_TYPES, default='RESIDENTIAL')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_communities')

    class Meta:
        verbose_name_plural = 'Communities'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class CommunityMembership(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    ROLE_CHOICES = (
        ('RESIDENT', 'Resident'),
        ('COMMUNITY_ADMIN', 'Community Administrator'),
        ('SAFETY_VOLUNTEER', 'Safety Volunteer'),
    )

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='RESIDENT')
    join_date = models.DateTimeField(auto_now_add=True)
    approval_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('community', 'user')
        ordering = ['-join_date']

    def __str__(self):
        return f"{self.user.email} in {self.community.name} ({self.status})"

class FeedPost(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='feed_posts')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feed_posts')
    content = models.TextField()
    image_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Post by {self.author.username} in {self.community.name}"

class Comment(models.Model):
    post = models.ForeignKey(FeedPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on post {self.post.id}"
