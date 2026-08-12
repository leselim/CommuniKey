from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import SOSAlert
from .serializers import SOSAlertSerializer

class SOSAlertListCreateView(generics.ListCreateAPIView):
    serializer_class = SOSAlertSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = SOSAlert.objects.all()
        community_id = self.request.query_params.get('community')
        status_filter = self.request.query_params.get('status')

        if community_id:
            queryset = queryset.filter(community_id=community_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SOSResolveView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, pk):
        sos_alert = get_object_or_404(SOSAlert, pk=pk)
        action_status = request.data.get('status', 'RESOLVED')
        sos_alert.status = action_status
        sos_alert.time_resolved = timezone.now()
        sos_alert.resolved_by = request.user
        sos_alert.save()
        return Response({
            "success": True,
            "message": f"SOS Alert status updated to {action_status}.",
            "data": SOSAlertSerializer(sos_alert).data
        })
