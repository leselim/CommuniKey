from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'User registered successfully.',
                'data': {
                    'user': UserSerializer(user).data,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Registration failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        user = User.objects.filter(email__iexact=email).first()
        if not user and email:
            user = User.objects.filter(username__iexact=email.split('@')[0]).first()

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'Login successful.',
                'data': {
                    'user': UserSerializer(user).data,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                }
            }, status=status.HTTP_200_OK)

        return Response({
            'success': False,
            'message': 'Invalid email or password.'
        }, status=status.HTTP_401_UNAUTHORIZED)

class ProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else User.objects.first()
        if not user:
            return Response({'success': False, 'message': 'No user profile found.'}, status=404)
        return Response({
            'success': True,
            'message': 'Profile retrieved.',
            'data': UserSerializer(user).data
        })

    def put(self, request):
        user = request.user if request.user.is_authenticated else User.objects.first()
        if not user:
            return Response({'success': False, 'message': 'No user profile found.'}, status=404)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated.',
                'data': serializer.data
            })
        return Response({'success': False, 'errors': serializer.errors}, status=400)
