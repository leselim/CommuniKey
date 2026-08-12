from rest_framework import serializers
from .models import Community, CommunityMembership, FeedPost, Comment
from apps.authentication.serializers import UserSerializer

class CommunitySerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    membership_status = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = (
            'id', 'name', 'description', 'province', 'city', 'suburb',
            'postal_code', 'community_type', 'created_at', 'created_by',
            'created_by_detail', 'member_count', 'is_member', 'membership_status'
        )
        read_only_fields = ('id', 'created_at', 'created_by')

    def get_member_count(self, obj):
        return obj.memberships.filter(status='APPROVED').count()

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.memberships.filter(user=request.user, status='APPROVED').exists()
        return False

    def get_membership_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            return membership.status if membership else None
        return None

class CommunityMembershipSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    community_name = serializers.CharField(source='community.name', read_only=True)

    class Meta:
        model = CommunityMembership
        fields = ('id', 'community', 'community_name', 'user', 'user_detail', 'status', 'role', 'join_date', 'approval_date')
        read_only_fields = ('id', 'join_date', 'user')

class CommentSerializer(serializers.ModelSerializer):
    author_detail = UserSerializer(source='author', read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'author_detail', 'comment', 'created_at')
        read_only_fields = ('id', 'post', 'author', 'created_at')

class FeedPostSerializer(serializers.ModelSerializer):
    author_detail = UserSerializer(source='author', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = FeedPost
        fields = ('id', 'community', 'author', 'author_detail', 'content', 'image_url', 'created_at', 'updated_at', 'comments', 'comments_count')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def get_comments_count(self, obj):
        return obj.comments.count()
