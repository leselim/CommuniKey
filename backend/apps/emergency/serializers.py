from rest_framework import serializers
from .models import SOSAlert
from apps.authentication.serializers import UserSerializer

class SOSAlertSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    resolved_by_detail = UserSerializer(source='resolved_by', read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)

    class Meta:
        model = SOSAlert
        fields = (
            'id', 'user', 'user_detail', 'community', 'community_name',
            'alert_type', 'status', 'latitude', 'longitude', 'note',
            'time_activated', 'time_resolved', 'resolved_by', 'resolved_by_detail'
        )
        read_only_fields = ('id', 'user', 'time_activated', 'time_resolved', 'resolved_by')
