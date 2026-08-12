from rest_framework import generics, permissions
from django.db.models import Q
from .models import Announcement
from .serializers import AnnouncementSerializer

class AnnouncementListCreateView(generics.ListCreateAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        queryset = Announcement.objects.all()
        community_id = self.request.query_params.get('community')
        is_pinned = self.request.query_params.get('pinned')
        query = self.request.query_params.get('search')

        if community_id:
            queryset = queryset.filter(community_id=community_id)
        if is_pinned is not None:
            queryset = queryset.filter(is_pinned=is_pinned.lower() in ['true', '1'])
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | Q(content__icontains=query)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
