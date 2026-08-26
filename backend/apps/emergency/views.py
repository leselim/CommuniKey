from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import SOSAlert
from .serializers import SOSAlertSerializer

class SOSListCreateView(APIView):
    def get(self, request):
        alerts = SOSAlert.objects.filter(status='Active').order_by('-time_activated')
        serializer = SOSAlertSerializer(alerts, many=True)
        return Response({
            'success': True,
            'message': 'Active SOS alerts retrieved.',
            'data': serializer.data
        })

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        lat = request.data.get('latitude', -25.7461)
        lng = request.data.get('longitude', 28.1881)

        alert = SOSAlert.objects.create(
            user=user,
            latitude=lat,
            longitude=lng,
            status='Active'
        )

        return Response({
            'success': True,
            'message': 'Emergency SOS Alert triggered and dispatched to Neighbourhood Watch & Patrol.',
            'data': SOSAlertSerializer(alert).data
        }, status=status.HTTP_201_CREATED)

class SOSResolveView(APIView):
    def put(self, request, pk):
        try:
            alert = SOSAlert.objects.get(pk=pk)
            alert.status = 'Resolved'
            alert.time_resolved = timezone.now()
            alert.save()
            return Response({
                'success': True,
                'message': f'SOS Alert #{pk} resolved.',
                'data': SOSAlertSerializer(alert).data
            })
        except SOSAlert.DoesNotExist:
            return Response({'success': False, 'message': 'SOS alert not found.'}, status=404)
