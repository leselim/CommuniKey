from rest_framework import viewsets, permissions, filters
from .models import LostAndFoundItem, ServiceProvider
from .serializers import LostAndFoundItemSerializer, ServiceProviderSerializer

class LostAndFoundViewSet(viewsets.ModelViewSet):
    queryset = LostAndFoundItem.objects.all()
    serializer_class = LostAndFoundItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'location_description']

    def get_queryset(self):
        queryset = super().get_queryset()
        community_id = self.request.query_params.get('community')
        item_type = self.request.query_params.get('item_type')
        status = self.request.query_params.get('status')
        if community_id:
            queryset = queryset.filter(community_id=community_id)
        if item_type:
            queryset = queryset.filter(item_type=item_type)
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class ServiceProviderViewSet(viewsets.ModelViewSet):
    queryset = ServiceProvider.objects.all()
    serializer_class = ServiceProviderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['business_name', 'description', 'contact_person']

    def get_queryset(self):
        queryset = super().get_queryset()
        community_id = self.request.query_params.get('community')
        service_type = self.request.query_params.get('service_type')
        if community_id:
            queryset = queryset.filter(community_id=community_id)
        if service_type:
            queryset = queryset.filter(service_type=service_type)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
