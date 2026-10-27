"""
Views for applications app.
"""
import csv
from django.http import HttpResponse
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied

from .models import Application, ApplicationStatusHistory
from .serializers import (
    ApplicationListSerializer,
    ApplicationDetailSerializer,
    ApplicationCreateSerializer,
    ApplicationReviewActionSerializer,
)
from apps.accounts.permissions import IsApplicant, IsReviewer, IsAdministrator
from apps.audit.models import AuditLog
from apps.notifications.models import Notification
from apps.examinations.models import RequiredDocumentType


def validate_application_documents(application):
    """
    Validates that all mandatory documents for this examination are uploaded.
    Implements the conditional 6th document requirement:
    Document 6 ('liaison_letter') is mandatory ONLY if the applicant is
    from another institution (is_from_another_institution == True).
    """
    exam = application.examination
    uploaded_doc_type_ids = set(application.documents.values_list('document_type_id', flat=True))
    
    # Check applicant's snapshot or profile
    snapshot = application.applicant_snapshot or {}
    is_from_another = snapshot.get('is_from_another_institution', False)
    if not is_from_another and hasattr(application.applicant, 'profile'):
        is_from_another = application.applicant.profile.is_from_another_institution

    missing_docs = []
    required_docs = exam.required_documents.select_related('document_type').all()

    # If exam has explicitly configured required documents
    if required_docs.exists():
        for req_doc in required_docs:
            dt = req_doc.document_type
            # Conditional check for liaison letter (doc 6)
            if req_doc.is_conditional and req_doc.condition_field == 'is_from_another_institution':
                if not is_from_another and not exam.require_liaison_letter:
                    continue  # Not required for home institution applicant

            if dt.id not in uploaded_doc_type_ids:
                missing_docs.append(f"{dt.sort_order}. {dt.name_uz}")
    elif exam.is_foreign_language:
        # Fallback to standard 6 required documents
        all_doc_types = RequiredDocumentType.objects.all().order_by('sort_order')
        for dt in all_doc_types:
            if dt.code == 'liaison_letter':
                if not is_from_another and not exam.require_liaison_letter:
                    continue  # Not required if home institution
            if dt.id not in uploaded_doc_type_ids:
                missing_docs.append(f"{dt.sort_order}. {dt.name_uz}")

    if missing_docs:
        raise ValidationError({
            'missing_documents': missing_docs,
            'message': f"Ariza topshirish uchun quyidagi hujjatlarni yuklash shart: {', '.join(missing_docs)}"
        })


class ApplicationViewSet(viewsets.ModelViewSet):
    """Applicant-facing application endpoints."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'reviewer']:
            return Application.objects.all()
        return Application.objects.filter(applicant=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        if self.action in ['retrieve', 'update', 'partial_update']:
            return ApplicationDetailSerializer
        return ApplicationListSerializer

    def perform_create(self, serializer):
        application = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='application_created',
            target=application,
            description=f"Yangi ariza yaratildi: {application.reference_number}",
            request=self.request,
        )

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit application for review."""
        application = self.get_object()

        if application.applicant != request.user and request.user.role != 'admin':
            raise PermissionDenied("Faqat o'z arizangizni topshira olasiz.")

        if application.status not in ['draft', 'correction_required']:
            raise ValidationError(f"Arizani '{application.status}' holatida topshirish mumkin emas.")

        # Check deadline
        if not application.examination.is_registration_open:
            raise ValidationError("Ushbu imtihonga ro'yxatdan o'tish muddati tugagan.")

        # Validate mandatory documents including conditional doc 6
        validate_application_documents(application)

        # Preserve existing snapshot data and complement with profile if missing
        current_snap = application.applicant_snapshot or {}
        profile = getattr(request.user, 'profile', None)
        if profile:
            for field in [
                'full_name', 'email', 'phone', 'jshr', 'gender', 'birth_date',
                'passport_series', 'passport_number', 'current_institution',
                'current_institution_code', 'education_form', 'specialty_code',
                'specialty_name', 'scientific_field', 'scientific_supervisor',
                'workplace', 'dissertation_topic', 'is_from_another_institution'
            ]:
                if field not in current_snap or current_snap[field] in [None, '']:
                    val = getattr(profile, field, None) or getattr(request.user, field, None)
                    if val is not None:
                        current_snap[field] = val
            application.applicant_snapshot = current_snap

        with transaction.atomic():
            old_status = application.status
            application.status = 'submitted'
            application.submitted_at = timezone.now()
            application.save()

            ApplicationStatusHistory.objects.create(
                application=application,
                from_status=old_status,
                to_status='submitted',
                changed_by=request.user,
                reason="Abituriyent tomonidan topshirildi",
            )

            # Notification for applicant
            Notification.objects.create(
                recipient=request.user,
                title="Arizangiz muvaffaqiyatli topshirildi",
                body=f"Sizning {application.reference_number} raqamli arizangiz qabul qilindi va ko'rib chiqilmoqda.",
                related_application=application,
            )

            AuditLog.log(
                user=request.user,
                action='application_submitted',
                target=application,
                description=f"Ariza topshirildi: {application.reference_number}",
                request=request,
            )

        return Response({
            'message': "Arizangiz muvaffaqiyatli topshirildi!",
            'reference_number': application.reference_number,
            'status': application.status,
            'application': ApplicationDetailSerializer(application, context={'request': request}).data,
        })

    @action(detail=True, methods=['post'])
    def resubmit(self, request, pk=None):
        """Resubmit application after corrections."""
        application = self.get_object()
        if application.status != 'correction_required':
            raise ValidationError("Faqat tuzatish talab qilingan arizalarni qayta topshirish mumkin.")

        validate_application_documents(application)

        with transaction.atomic():
            application.status = 'submitted'
            application.correction_notes = ''
            application.save(update_fields=['status', 'correction_notes', 'updated_at'])

            ApplicationStatusHistory.objects.create(
                application=application,
                from_status='correction_required',
                to_status='submitted',
                changed_by=request.user,
                reason="Tuzatishlar kiritilib, qayta topshirildi",
            )

            AuditLog.log(
                user=request.user,
                action='application_resubmitted',
                target=application,
                description=f"Ariza qayta topshirildi: {application.reference_number}",
                request=request,
            )

        return Response({
            'message': "Arizangiz qayta topshirildi va tekshiruvga yuborildi.",
            'application': ApplicationDetailSerializer(application, context={'request': request}).data,
        })


# Admin / Reviewer Application ViewSet
class AdminApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsReviewer]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'reference_number',
        'applicant__full_name',
        'applicant__email',
        'applicant__phone',
        'applicant_snapshot__jshr',
    ]
    ordering_fields = ['created_at', 'submitted_at', 'status']

    def get_queryset(self):
        qs = Application.objects.select_related('applicant', 'examination', 'assigned_reviewer').all()
        user = self.request.user
        if user.role == 'reviewer':
            # Reviewer can see assigned or unassigned applications
            qs = qs.filter(Q(assigned_reviewer=user) | Q(assigned_reviewer__isnull=True))

        exam_id = self.request.query_params.get('examination')
        if exam_id:
            qs = qs.filter(examination_id=exam_id)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        language = self.request.query_params.get('language')
        if language:
            qs = qs.filter(examination__language=language)

        return qs.order_by('-submitted_at', '-created_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ApplicationDetailSerializer
        return ApplicationListSerializer

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Admin/Reviewer reviews the overall application."""
        application = self.get_object()
        serializer = ApplicationReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_type = serializer.validated_data['action']
        notes = serializer.validated_data.get('notes', '')
        internal_notes = serializer.validated_data.get('internal_notes', '')

        with transaction.atomic():
            old_status = application.status

            if action_type == 'under_review':
                application.status = 'under_review'
            elif action_type == 'approve':
                # All documents should preferably be approved
                application.status = 'approved'
                Notification.objects.create(
                    recipient=application.applicant,
                    title="Arizangiz tasdiqlandi!",
                    body=f"Sizning {application.reference_number} raqamli arizangiz tasdiqlandi.",
                    related_application=application,
                )
            elif action_type == 'request_corrections':
                if not notes:
                    raise ValidationError({'notes': "Tuzatish talab qilinganda izoh kiritish majburiydir."})
                application.status = 'correction_required'
                application.correction_notes = notes
                Notification.objects.create(
                    recipient=application.applicant,
                    title="Arizangiz bo'yicha tuzatish talab qilinadi",
                    body=f"Izoh: {notes}",
                    related_application=application,
                )
            elif action_type == 'reject':
                if not notes:
                    raise ValidationError({'notes': "Rad etishda sabab kiritish majburiydir."})
                application.status = 'rejected'
                application.rejection_reason = notes
                Notification.objects.create(
                    recipient=application.applicant,
                    title="Arizangiz rad etildi",
                    body=f"Sabab: {notes}",
                    related_application=application,
                )

            if internal_notes:
                application.internal_notes = (
                    f"{application.internal_notes}\n[{timezone.now().strftime('%Y-%m-%d %H:%M')}] {internal_notes}".strip()
                )

            application.save()

            ApplicationStatusHistory.objects.create(
                application=application,
                from_status=old_status,
                to_status=application.status,
                changed_by=request.user,
                reason=notes or f"{action_type} holatiga o'tkazildi",
            )

            AuditLog.log(
                user=request.user,
                action=f'application_{action_type}',
                target=application,
                description=f"Ariza holati o'zgartirildi: {old_status} -> {application.status}. {notes}",
                request=request,
            )

        return Response({
            'message': f"Ariza holati '{application.status}' ga o'zgartirildi.",
            'application': ApplicationDetailSerializer(application, context={'request': request}).data,
        })

    @action(detail=True, methods=['post'])
    def assign_reviewer(self, request, pk=None):
        application = self.get_object()
        reviewer_id = request.data.get('reviewer_id')
        if not reviewer_id:
            application.assigned_reviewer = None
        else:
            from apps.accounts.models import User
            reviewer = User.objects.get(id=reviewer_id, role__in=['reviewer', 'admin'])
            application.assigned_reviewer = reviewer

        application.save(update_fields=['assigned_reviewer', 'updated_at'])
        return Response({'message': "Ko'rib chiquvchi biriktirildi."})

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export applications list to CSV."""
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="arizalar.csv"'
        response.write('\ufeff'.encode('utf8'))  # BOM for Excel utf-8

        writer = csv.writer(response)
        writer.writerow([
            'Ariza raqami',
            'F.I.SH',
            'Email',
            'Telefon',
            'Imtihon',
            'Til',
            'Holati',
            'Topshirilgan sana',
        ])

        for app in queryset:
            writer.writerow([
                app.reference_number,
                app.applicant.full_name,
                app.applicant.email,
                app.applicant.phone,
                app.examination.title,
                app.examination.get_language_display(),
                app.get_status_display(),
                app.submitted_at.strftime('%Y-%m-%d %H:%M') if app.submitted_at else '-',
            ])

        return response
