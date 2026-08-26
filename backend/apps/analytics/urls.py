from django.urls import path
from .views import AnalyticsOverviewView, ActivityLogListView

urlpatterns = [
    path('overview', AnalyticsOverviewView.as_view(), name='analytics_overview'),
    path('activity-logs', ActivityLogListView.as_view(), name='analytics_activity_logs'),
]
