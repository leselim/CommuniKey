from rest_framework import serializers
from .models import LostAndFoundItem, ServiceProvider
from apps.authentication.serializers import UserSerializer

class LostAndFoundItemSerializer(serializers.ModelSerializer):
    reporter_detail = UserSerializer(source='reporter', read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)

    class Meta:
        model = LostAndFoundItem
        fields = [
            'id', 'community', 'community_name', 'reporter', 'reporter_detail',
            'item_type', 'category', 'title', 'description', 'location_description',
            'contact_info', 'image_url', 'status', 'date_reported', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'date_reported', 'updated_at']

class ServiceProviderSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)

    class Meta:
        model = ServiceProvider
        fields = [
            'id', 'community', 'community_name', 'created_by', 'created_by_detail',
            'service_type', 'business_name', 'contact_person', 'phone_number',
            'email', 'description', 'verified', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']
