"""
Views for audit app and admin reports/dashboard.
"""
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.accounts.permissions import IsAdministrator, IsReviewer
from apps.applications.models import Application
from apps.examinations.models import Examination


class AuditLogListView(generics.ListAPIView):
    permission_classes = [IsAdministrator]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.select_related('user').all().order_by('-created_at')
    filterset_fields = ['action', 'target_type']
    search_fields = ['action', 'description', 'user__email', 'user__full_name']


class AdminDashboardStatsView(APIView):
    """
    Returns real database statistics for the Administrator Overview Dashboard.
    """
    permission_classes = [IsReviewer]

    def get(self, request):
        now = timezone.now()

        # Application counts by status
        total_apps = Application.objects.count()
        submitted_apps = Application.objects.filter(status='submitted').count()
        under_review_apps = Application.objects.filter(status='under_review').count()
        correction_apps = Application.objects.filter(status='correction_required').count()
        approved_apps = Application.objects.filter(status='approved').count()
        rejected_apps = Application.objects.filter(status='rejected').count()
        completed_apps = Application.objects.filter(status='completed').count()

        # Upcoming examinations
        upcoming_exams = Examination.objects.filter(
            status__in=['published', 'draft']
        ).order_by('registration_start')[:5].values(
            'id', 'title', 'language', 'status', 'registration_start', 'registration_end', 'capacity'
        )

        # Applications by examination
        by_exam = list(
            Application.objects.values('examination__title')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        # Applications by language
        by_language = list(
            Application.objects.values('examination__language')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Recent activities
        recent_audit = AuditLogSerializer(
            AuditLog.objects.select_related('user').all()[:10], many=True
        ).data

        return Response({
            'overview': {
                'total_applications': total_apps,
                'awaiting_review': submitted_apps + under_review_apps,
                'correction_required': correction_apps,
                'approved': approved_apps,
                'rejected': rejected_apps,
                'completed': completed_apps,
            },
            'upcoming_examinations': list(upcoming_exams),
            'by_examination': by_exam,
            'by_language': by_language,
            'recent_activity': recent_audit,
        })
