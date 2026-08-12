from rest_framework import serializers
from .models import Incident
from apps.authentication.serializers import UserSerializer
from apps.communities.serializers import CommunitySerializer

class IncidentSerializer(serializers.ModelSerializer):
    reporter_detail = UserSerializer(source='reporter', read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)

    class Meta:
        model = Incident
        fields = (
            'id', 'community', 'community_name', 'reporter', 'reporter_detail',
            'incident_type', 'title', 'description', 'image_url', 'latitude',
            'longitude', 'status', 'date_reported', 'updated_at'
        )
        read_only_fields = ('id', 'reporter', 'date_reported', 'updated_at')
