from rest_framework import serializers
from .models import Community, CommunityMembership
from apps.authentication.serializers import UserSerializer

class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = '__all__'

class CommunityMembershipSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    community_details = CommunitySerializer(source='community', read_only=True)

    class Meta:
        model = CommunityMembership
        fields = '__all__'
