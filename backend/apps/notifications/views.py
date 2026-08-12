from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class MarkNotificationReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.read_status = True
        notification.save()
        return Response({
            "success": True,
            "message": "Notification marked as read.",
            "data": NotificationSerializer(notification).data
        })

class MarkAllNotificationsReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request):
        Notification.objects.filter(user=request.user, read_status=False).update(read_status=True)
        return Response({
            "success": True,
            "message": "All notifications marked as read."
        })
