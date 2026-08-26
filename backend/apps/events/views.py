from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Event, EventRSVP
from .serializers import EventSerializer, EventRSVPSerializer

class EventListCreateView(APIView):
    def get(self, request):
        events = Event.objects.all().order_by('event_date')
        serializer = EventSerializer(events, many=True)
        return Response({
            'success': True,
            'message': 'Events retrieved.',
            'data': serializer.data
        })

    def post(self, request):
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.save()
            return Response({
                'success': True,
                'message': 'Event created successfully.',
                'data': EventSerializer(event).data
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=400)

class EventDetailView(APIView):
    def get(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
            return Response({
                'success': True,
                'message': 'Event detail.',
                'data': EventSerializer(event).data
            })
        except Event.DoesNotExist:
            return Response({'success': False, 'message': 'Event not found.'}, status=404)

class EventRSVPView(APIView):
    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
            attending = request.data.get('attending', True)
            if attending:
                event.attendees_count += 1
            else:
                event.attendees_count = max(0, event.attendees_count - 1)
            event.save()

            return Response({
                'success': True,
                'message': f'RSVP status updated to {"attending" if attending else "not attending"}.',
                'data': EventSerializer(event).data
            })
        except Event.DoesNotExist:
            return Response({'success': False, 'message': 'Event not found.'}, status=404)
