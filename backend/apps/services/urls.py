from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LostAndFoundViewSet, ServiceProviderViewSet

router = DefaultRouter()
router.register(r'lost-and-found', LostAndFoundViewSet, basename='lost-and-found')
router.register(r'providers', ServiceProviderViewSet, basename='service-provider')

urlpatterns = [
    path('', include(router.urls)),
]
