from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'user', 'notification_type', 'title', 'message', 'read_status', 'date_sent')
        read_only_fields = ('id', 'user', 'date_sent')
