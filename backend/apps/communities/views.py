from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

from .models import Community, CommunityMembership, FeedPost, Comment
from .serializers import (
    CommunitySerializer,
    CommunityMembershipSerializer,
    FeedPostSerializer,
    CommentSerializer
)

class CommunityListCreateView(generics.ListCreateAPIView):
    serializer_class = CommunitySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        queryset = Community.objects.all()
        query = self.request.query_params.get('search', None)
        city = self.request.query_params.get('city', None)
        c_type = self.request.query_params.get('type', None)

        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(suburb__icontains=query)
            )
        if city:
            queryset = queryset.filter(city__icontains=city)
        if c_type:
            queryset = queryset.filter(community_type=c_type)
        return queryset

    def perform_create(self, serializer):
        community = serializer.save(created_by=self.request.user)
        # Automatically make creator the approved COMMUNITY_ADMIN
        CommunityMembership.objects.create(
            community=community,
            user=self.request.user,
            status='APPROVED',
            role='COMMUNITY_ADMIN',
            approval_date=timezone.now()
        )

class CommunityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

class JoinCommunityView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        community = get_object_or_404(Community, pk=pk)
        membership, created = CommunityMembership.objects.get_or_create(
            community=community,
            user=request.user,
            defaults={'status': 'APPROVED', 'role': 'RESIDENT', 'approval_date': timezone.now()}
        )
        if not created and membership.status == 'REJECTED':
            membership.status = 'APPROVED'
            membership.approval_date = timezone.now()
            membership.save()

        return Response({
            "success": True,
            "message": f"Joined {community.name} successfully.",
            "data": CommunityMembershipSerializer(membership).data
        }, status=status.HTTP_200_OK)

class LeaveCommunityView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        community = get_object_or_404(Community, pk=pk)
        membership = CommunityMembership.objects.filter(community=community, user=request.user).first()
        if membership:
            membership.delete()
            return Response({
                "success": True,
                "message": f"Left {community.name}."
            }, status=status.HTTP_200_OK)
        return Response({
            "success": False,
            "message": "Not a member of this community."
        }, status=status.HTTP_400_BAD_REQUEST)

class CommunityMembersListView(generics.ListAPIView):
    serializer_class = CommunityMembershipSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        community_id = self.kwargs['pk']
        return CommunityMembership.objects.filter(community_id=community_id)

class ApproveMemberView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk, membership_id):
        membership = get_object_or_404(CommunityMembership, id=membership_id, community_id=pk)
        action = request.data.get('action', 'approve')
        if action == 'approve':
            membership.status = 'APPROVED'
            membership.approval_date = timezone.now()
        elif action == 'reject':
            membership.status = 'REJECTED'
        membership.save()
        return Response({
            "success": True,
            "message": f"Member {action}d successfully.",
            "data": CommunityMembershipSerializer(membership).data
        })

# Feed & Comments Views
class FeedPostListCreateView(generics.ListCreateAPIView):
    serializer_class = FeedPostSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        community_id = self.request.query_params.get('community')
        if community_id:
            return FeedPost.objects.filter(community_id=community_id)
        return FeedPost.objects.all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class FeedPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FeedPost.objects.all()
    serializer_class = FeedPostSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id)

    def perform_create(self, serializer):
        post = get_object_or_404(FeedPost, pk=self.kwargs['post_id'])
        serializer.save(author=self.request.user, post=post)
