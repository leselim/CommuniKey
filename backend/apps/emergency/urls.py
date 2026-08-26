from django.urls import path
from .views import SOSListCreateView, SOSResolveView

urlpatterns = [
    path('', SOSListCreateView.as_view(), name='sos_list_create'),
    path('<int:pk>/resolve', SOSResolveView.as_view(), name='sos_resolve'),
]
