from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Announcement
from .serializers import AnnouncementSerializer

class AnnouncementListCreateView(APIView):
    def get(self, request):
        announcements = Announcement.objects.all().order_by('-date_published')
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response({
            'success': True,
            'message': 'Announcements retrieved.',
            'data': serializer.data
        })

    def post(self, request):
        serializer = AnnouncementSerializer(data=request.data)
        if serializer.is_valid():
            announcement = serializer.save()
            return Response({
                'success': True,
                'message': 'Announcement created.',
                'data': AnnouncementSerializer(announcement).data
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=400)

class AnnouncementDetailView(APIView):
    def get(self, request, pk):
        try:
            announcement = Announcement.objects.get(pk=pk)
            return Response({
                'success': True,
                'message': 'Announcement detail.',
                'data': AnnouncementSerializer(announcement).data
            })
        except Announcement.DoesNotExist:
            return Response({'success': False, 'message': 'Announcement not found.'}, status=404)

    def delete(self, request, pk):
        try:
            announcement = Announcement.objects.get(pk=pk)
            announcement.delete()
            return Response({'success': True, 'message': 'Announcement deleted.'})
        except Announcement.DoesNotExist:
            return Response({'success': False, 'message': 'Announcement not found.'}, status=404)
