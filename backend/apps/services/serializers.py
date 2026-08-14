from rest_framework import serializers
from .models import LostAndFoundItem, ServiceProvider

class LostAndFoundItemSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)

    class Meta:
        model = LostAndFoundItem
        fields = [
            'id', 'community', 'community_name', 'reporter', 'reporter_name',
            'item_type', 'category', 'title', 'description', 'location_description',
            'contact_info', 'image_url', 'status', 'date_reported', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'date_reported', 'updated_at']

class ServiceProviderSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)

    class Meta:
        model = ServiceProvider
        fields = [
            'id', 'community', 'community_name', 'created_by', 'created_by_name',
            'service_type', 'business_name', 'contact_person', 'phone_number',
            'email', 'description', 'verified', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']
