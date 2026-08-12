from rest_framework import serializers
from .models import Event, EventRSVP
from apps.authentication.serializers import UserSerializer

class EventRSVPSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = EventRSVP
        fields = ('id', 'event', 'user', 'user_detail', 'status', 'rsvp_date')
        read_only_fields = ('id', 'user', 'rsvp_date')

class EventSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)
    attendee_count = serializers.SerializerMethodField()
    user_rsvp = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = (
            'id', 'community', 'community_name', 'created_by', 'created_by_detail',
            'event_name', 'description', 'event_date', 'event_location',
            'max_attendees', 'created_at', 'attendee_count', 'user_rsvp'
        )
        read_only_fields = ('id', 'created_by', 'created_at')

    def get_attendee_count(self, obj):
        return obj.rsvps.filter(status='ATTENDING').count()

    def get_user_rsvp(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rsvp = obj.rsvps.filter(user=request.user).first()
            return rsvp.status if rsvp else None
        return None
