from rest_framework import serializers
from .models import SOSAlert

class SOSAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSAlert
        fields = '__all__'
