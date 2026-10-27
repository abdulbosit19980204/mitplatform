"""
Views for scheduling app.
"""
from rest_framework import viewsets, permissions
from .models import ExaminationSession
from .serializers import ExaminationSessionSerializer
from apps.accounts.permissions import IsAdministrator


class ExaminationSessionViewSet(viewsets.ModelViewSet):
    """Admin CRUD for examination sessions."""
    serializer_class = ExaminationSessionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdministrator()]

    def get_queryset(self):
        qs = ExaminationSession.objects.select_related('examination').all()
        exam_id = self.request.query_params.get('examination')
        if exam_id:
            qs = qs.filter(examination_id=exam_id)
        if not self.request.user.is_authenticated or self.request.user.role not in ['admin', 'reviewer']:
            qs = qs.filter(is_published=True)
        return qs.order_by('exam_date', 'start_time')
