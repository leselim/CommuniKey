from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Incident
from .serializers import IncidentSerializer

class IncidentListCreateView(generics.ListCreateAPIView):
    serializer_class = IncidentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        queryset = Incident.objects.all()
        community_id = self.request.query_params.get('community')
        incident_type = self.request.query_params.get('type')
        status_filter = self.request.query_params.get('status')
        query = self.request.query_params.get('search')

        if community_id:
            queryset = queryset.filter(community_id=community_id)
        if incident_type:
            queryset = queryset.filter(incident_type=incident_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

class IncidentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
