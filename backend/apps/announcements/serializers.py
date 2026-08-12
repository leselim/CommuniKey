from rest_framework import serializers
from .models import Announcement
from apps.authentication.serializers import UserSerializer

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)

    class Meta:
        model = Announcement
        fields = (
            'id', 'community', 'community_name', 'created_by', 'created_by_detail',
            'title', 'content', 'is_pinned', 'date_published', 'last_updated'
        )
        read_only_fields = ('id', 'created_by', 'date_published', 'last_updated')
