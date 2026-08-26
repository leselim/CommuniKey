from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import IncidentReport
from .serializers import IncidentReportSerializer

class IncidentListCreateView(APIView):
    def get(self, request):
        incidents = IncidentReport.objects.all().order_by('-date_reported')
        serializer = IncidentReportSerializer(incidents, many=True)
        return Response({
            'success': True,
            'message': 'Incidents retrieved.',
            'data': serializer.data
        })

    def post(self, request):
        serializer = IncidentReportSerializer(data=request.data)
        if serializer.is_valid():
            incident = serializer.save()
            return Response({
                'success': True,
                'message': 'Incident reported successfully.',
                'data': IncidentReportSerializer(incident).data
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=400)

class IncidentDetailView(APIView):
    def get(self, request, pk):
        try:
            incident = IncidentReport.objects.get(pk=pk)
            return Response({
                'success': True,
                'message': 'Incident detail.',
                'data': IncidentReportSerializer(incident).data
            })
        except IncidentReport.DoesNotExist:
            return Response({'success': False, 'message': 'Incident not found.'}, status=404)

    def put(self, request, pk):
        try:
            incident = IncidentReport.objects.get(pk=pk)
            serializer = IncidentReportSerializer(incident, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Incident updated.',
                    'data': serializer.data
                })
            return Response({'success': False, 'errors': serializer.errors}, status=400)
        except IncidentReport.DoesNotExist:
            return Response({'success': False, 'message': 'Incident not found.'}, status=404)
