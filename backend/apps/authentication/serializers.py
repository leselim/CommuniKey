from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelResourceSerializer if hasattr(serializers, 'ModelResourceSerializer') else serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'phone_number', 'address', 'status', 'notify_emergency',
            'notify_events', 'notify_announcements', 'share_location',
            'gate_access_code', 'emergency_notes', 'household_vehicle', 'emergency_role'
        ]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number', 'address', 'role']

    def create(self, validated_data):
        email = validated_data.get('email', '')
        password = validated_data.pop('password')
        username = email.split('@')[0] if email else f"user_{User.objects.count()+1}"
        user = User.objects.create_user(username=username, **validated_data)
        user.set_password(password)
        user.save()
        return user
