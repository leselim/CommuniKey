from django.urls import path
from .views import (
    CommunityListCreateView,
    CommunityDetailView,
    JoinCommunityView,
    LeaveCommunityView,
    CommunityMembersListView,
    ApproveMemberView,
    FeedPostListCreateView,
    FeedPostDetailView,
    CommentListCreateView
)

urlpatterns = [
    path('', CommunityListCreateView.as_view(), name='community_list_create'),
    path('<int:pk>/', CommunityDetailView.as_view(), name='community_detail'),
    path('<int:pk>/join/', JoinCommunityView.as_view(), name='community_join'),
    path('<int:pk>/leave/', LeaveCommunityView.as_view(), name='community_leave'),
    path('<int:pk>/members/', CommunityMembersListView.as_view(), name='community_members'),
    path('<int:pk>/members/<int:membership_id>/approve/', ApproveMemberView.as_view(), name='community_member_approve'),
    path('feed/', FeedPostListCreateView.as_view(), name='feed_list_create'),
    path('feed/<int:pk>/', FeedPostDetailView.as_view(), name='feed_detail'),
    path('feed/<int:post_id>/comments/', CommentListCreateView.as_view(), name='feed_comments'),
]
