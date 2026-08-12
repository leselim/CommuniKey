from django.urls import path
from .views import SOSAlertListCreateView, SOSResolveView

urlpatterns = [
    path('sos/', SOSAlertListCreateView.as_view(), name='sos_list_create'),
    path('sos/<int:pk>/resolve/', SOSResolveView.as_view(), name='sos_resolve'),
]
