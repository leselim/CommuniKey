from rest_framework import serializers
from .models import Event, EventRSVP

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class EventRSVPSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRSVP
        fields = '__all__'
