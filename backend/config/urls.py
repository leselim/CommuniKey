from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/communities/', include('apps.communities.urls')),
    path('api/v1/incidents/', include('apps.incidents.urls')),
    path('api/v1/announcements/', include('apps.announcements.urls')),
    path('api/v1/events/', include('apps.events.urls')),
    path('api/v1/emergency/', include('apps.emergency.urls')),
]
