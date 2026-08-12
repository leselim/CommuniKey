from django.urls import path
from .views import EventListCreateView, EventDetailView, EventRSVPView

urlpatterns = [
    path('', EventListCreateView.as_view(), name='event_list_create'),
    path('<int:pk>/', EventDetailView.as_view(), name='event_detail'),
    path('<int:pk>/rsvp/', EventRSVPView.as_view(), name='event_rsvp'),
]
