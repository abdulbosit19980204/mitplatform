"""
URLs for notifications app.
"""
from django.urls import path
from .views import (
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    InstitutionSettingsView,
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification_read'),
    path('read-all/', NotificationMarkAllReadView.as_view(), name='notification_read_all'),
    path('settings/', InstitutionSettingsView.as_view(), name='institution_settings'),
]
