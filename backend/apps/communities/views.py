from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Community, CommunityMembership
from .serializers import CommunitySerializer
from apps.authentication.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class CommunityListCreateView(APIView):
    def get(self, request):
        communities = Community.objects.all()
        serializer = CommunitySerializer(communities, many=True)
        return Response({
            'success': True,
            'message': 'Communities retrieved successfully.',
            'data': serializer.data
        })

    def post(self, request):
        serializer = CommunitySerializer(data=request.data)
        if serializer.is_valid():
            community = serializer.save()
            return Response({
                'success': True,
                'message': 'Community created successfully.',
                'data': CommunitySerializer(community).data
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=400)

class CommunityDetailView(APIView):
    def get(self, request, pk):
        try:
            community = Community.objects.get(pk=pk)
            return Response({
                'success': True,
                'message': 'Community details retrieved.',
                'data': CommunitySerializer(community).data
            })
        except Community.DoesNotExist:
            return Response({'success': False, 'message': 'Community not found.'}, status=404)

class CommunityMembersView(APIView):
    def get(self, request, pk=None):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response({
            'success': True,
            'message': 'Community members retrieved.',
            'data': serializer.data
        })
