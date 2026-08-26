from django.urls import path
from .views import CommunityListCreateView, CommunityDetailView, CommunityMembersView

urlpatterns = [
    path('', CommunityListCreateView.as_view(), name='community_list_create'),
    path('<int:pk>', CommunityDetailView.as_view(), name='community_detail'),
    path('<int:pk>/members', CommunityMembersView.as_view(), name='community_members_id'),
    path('members', CommunityMembersView.as_view(), name='community_members'),
]
