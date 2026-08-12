from django.urls import path
from .views import AnnouncementListCreateView, AnnouncementDetailView

urlpatterns = [
    path('', AnnouncementListCreateView.as_view(), name='announcement_list_create'),
    path('<int:pk>/', AnnouncementDetailView.as_view(), name='announcement_detail'),
]
