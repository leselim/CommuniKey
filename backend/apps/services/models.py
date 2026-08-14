from django.db import models
from django.conf import settings
from apps.communities.models import Community

class LostAndFoundItem(models.Model):
    ITEM_TYPES = (
        ('LOST', 'Lost Item'),
        ('FOUND', 'Found Item'),
    )

    CATEGORY_CHOICES = (
        ('PETS', 'Pets & Animals'),
        ('ELECTRONICS', 'Electronics & Gadgets'),
        ('KEYS', 'Keys & Cards'),
        ('DOCUMENTS', 'Documents & Wallets'),
        ('CLOTHING', 'Clothing & Accessories'),
        ('OTHER', 'Other Items'),
    )

    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('RESOLVED', 'Resolved'),
    )

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='lost_and_found_items')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reported_items')
    item_type = models.CharField(max_length=10, choices=ITEM_TYPES, default='LOST')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='OTHER')
    title = models.CharField(max_length=200)
    description = models.TextField()
    location_description = models.CharField(max_length=255, blank=True, null=True)
    contact_info = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    date_reported = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_reported']

    def __str__(self):
        return f"[{self.item_type}] {self.title} ({self.status})"


class ServiceProvider(models.Model):
    SERVICE_TYPES = (
        ('PLUMBING', 'Plumbing'),
        ('ELECTRICAL', 'Electrical Services'),
        ('GARDENING', 'Gardening & Landscaping'),
        ('SECURITY', 'Private Security / Patrol'),
        ('CLEANING', 'Home & Office Cleaning'),
        ('HANDYMAN', 'Handyman & Repairs'),
        ('TUTORING', 'Educational Tutoring'),
        ('OTHER', 'Other Local Services'),
    )

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='service_providers')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listed_services')
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES, default='OTHER')
    business_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['business_name']

    def __str__(self):
        return f"{self.business_name} ({self.get_service_type_display()})"
