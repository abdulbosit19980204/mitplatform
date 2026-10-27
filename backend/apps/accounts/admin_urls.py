"""
Centralized URLs for Admin Panel (/api/v1/admin/...).
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.examinations.views import AdminExaminationViewSet
from apps.applications.views import AdminApplicationViewSet
from apps.documents.views import DocumentReviewView
from apps.scheduling.views import ExaminationSessionViewSet
from apps.accounts.views import AdminUserListView, AdminUserDetailView
from apps.audit.views import AuditLogListView, AdminDashboardStatsView
from apps.notifications.views import InstitutionSettingsView

router = DefaultRouter()
router.register(r'examinations', AdminExaminationViewSet, basename='admin-examinations')
router.register(r'applications', AdminApplicationViewSet, basename='admin-applications')
router.register(r'sessions', ExaminationSessionViewSet, basename='admin-sessions')

urlpatterns = [
    # Dashboard & Stats
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('audit-logs/', AuditLogListView.as_view(), name='admin_audit_logs'),
    path('settings/', InstitutionSettingsView.as_view(), name='admin_settings'),

    # Document Review
    path('documents/<int:pk>/review/', DocumentReviewView.as_view(), name='admin_document_review'),

    # Users
    path('users/', AdminUserListView.as_view(), name='admin_users_list'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_users_detail'),

    # Routers (examinations, applications, sessions)
    path('', include(router.urls)),
]
