"""
URLs for scheduling app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExaminationSessionViewSet

router = DefaultRouter()
router.register(r'', ExaminationSessionViewSet, basename='session')

urlpatterns = [
    path('', include(router.urls)),
]
