from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Event, EventRSVP
from .serializers import EventSerializer, EventRSVPSerializer

class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        queryset = Event.objects.all()
        community_id = self.request.query_params.get('community')
        query = self.request.query_params.get('search')

        if community_id:
            queryset = queryset.filter(community_id=community_id)
        if query:
            queryset = queryset.filter(
                Q(event_name__icontains=query) | Q(description__icontains=query) | Q(event_location__icontains=query)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

class EventRSVPView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        rsvp_status = request.data.get('status', 'ATTENDING')
        rsvp, created = EventRSVP.objects.update_or_create(
            event=event,
            user=request.user,
            defaults={'status': rsvp_status}
        )
        return Response({
            "success": True,
            "message": f"RSVP updated to {rsvp_status}.",
            "data": EventRSVPSerializer(rsvp).data
        }, status=status.HTTP_200_OK)
