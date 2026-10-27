"""
Views for documents app.
"""
import mimetypes
from django.http import FileResponse, Http404
from django.db import transaction
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import ApplicationDocument, DocumentReview
from .serializers import (
    ApplicationDocumentSerializer,
    DocumentUploadSerializer,
    DocumentReviewActionSerializer,
)
from .validators import validate_document_file
from apps.applications.models import Application
from apps.accounts.permissions import IsReviewer
from apps.audit.models import AuditLog


class ApplicationDocumentUploadView(APIView):
    """Upload or replace a document for an application."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, application_id):
        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            raise Http404("Ariza topilmadi")

        # Permission check
        if application.applicant != request.user and request.user.role != 'admin':
            raise PermissionDenied("Faqat o'z arizangizga hujjat yuklay olasiz.")

        if application.status not in ['draft', 'correction_required']:
            raise ValidationError(
                f"'{application.status}' holatidagi arizaga hujjat yuklash yoki o'zgartirish mumkin emas."
            )

        serializer = DocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        doc_type = serializer.validated_data['document_type']
        uploaded_file = serializer.validated_data['file']

        # Validate file size, extension, and magic bytes
        validate_document_file(
            uploaded_file,
            allowed_formats=doc_type.accepted_formats,
            max_size_mb=doc_type.max_size_mb,
        )

        with transaction.atomic():
            # If document already exists for this type, replace it
            doc, created = ApplicationDocument.objects.get_or_create(
                application=application,
                document_type=doc_type,
                defaults={
                    'file': uploaded_file,
                    'original_filename': uploaded_file.name,
                    'file_size': uploaded_file.size,
                    'mime_type': uploaded_file.content_type or 'application/octet-stream',
                    'status': 'pending',
                }
            )

            if not created:
                # Replace file
                if doc.file:
                    try:
                        doc.file.delete(save=False)
                    except Exception:
                        pass
                doc.file = uploaded_file
                doc.original_filename = uploaded_file.name
                doc.file_size = uploaded_file.size
                doc.mime_type = uploaded_file.content_type or 'application/octet-stream'
                doc.status = 'pending'
                doc.save()

            AuditLog.log(
                user=request.user,
                action='document_uploaded',
                target=doc,
                description=f"Hujjat yuklandi: {doc_type.name_uz} ({uploaded_file.name})",
                request=request,
            )

        return Response(
            ApplicationDocumentSerializer(doc, context={'request': request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ApplicationDocumentDeleteView(APIView):
    """Delete an uploaded document."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            doc = ApplicationDocument.objects.select_related('application').get(id=pk)
        except ApplicationDocument.DoesNotExist:
            raise Http404("Hujjat topilmadi")

        if doc.application.applicant != request.user and request.user.role != 'admin':
            raise PermissionDenied("Faqat o'z hujjatingizni o'chira olasiz.")

        if doc.application.status not in ['draft', 'correction_required']:
            raise ValidationError("Topshirilgan yoki tasdiqlangan arizadan hujjatni o'chirish mumkin emas.")

        # Delete physical file
        if doc.file:
            try:
                doc.file.delete(save=False)
            except Exception:
                pass
        doc.delete()

        AuditLog.log(
            user=request.user,
            action='document_deleted',
            description=f"Hujjat o'chirildi: {doc.original_filename}",
            request=request,
        )
        return Response({'message': "Hujjat o'chirildi"}, status=status.HTTP_204_NO_CONTENT)


class ApplicationDocumentDownloadView(APIView):
    """Secure document download endpoint with strict authorization."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            doc = ApplicationDocument.objects.select_related('application', 'application__applicant').get(id=pk)
        except ApplicationDocument.DoesNotExist:
            raise Http404("Hujjat topilmadi")

        # Authorization: owner, reviewer, or admin
        user = request.user
        is_owner = (doc.application.applicant == user)
        is_staff_member = (user.role in ['reviewer', 'admin'])

        if not (is_owner or is_staff_member):
            raise PermissionDenied("Ushbu hujjatni ko'rish yoki yuklab olish huquqingiz yo'q.")

        if not doc.file or not doc.file.storage.exists(doc.file.name):
            raise Http404("Fayl serverda topilmadi")

        AuditLog.log(
            user=user,
            action='document_downloaded',
            target=doc,
            description=f"Hujjat yuklab olindi: {doc.original_filename}",
            request=request,
        )

        content_type, _ = mimetypes.guess_type(doc.original_filename)
        content_type = content_type or doc.mime_type or 'application/octet-stream'

        response = FileResponse(doc.file.open('rb'), content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{doc.original_filename}"'
        return response


class DocumentReviewView(APIView):
    """Admin / Reviewer review decision on individual document."""
    permission_classes = [IsReviewer]

    def post(self, request, pk):
        try:
            doc = ApplicationDocument.objects.select_related('application', 'document_type').get(id=pk)
        except ApplicationDocument.DoesNotExist:
            raise Http404("Hujjat topilmadi")

        serializer = DocumentReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        decision = serializer.validated_data['decision']
        comments = serializer.validated_data.get('comments', '')

        with transaction.atomic():
            doc.status = decision
            doc.save(update_fields=['status', 'updated_at'])

            DocumentReview.objects.create(
                document=doc,
                reviewed_by=request.user,
                decision=decision,
                comments=comments,
            )

            AuditLog.log(
                user=request.user,
                action='document_reviewed',
                target=doc,
                description=f"Hujjat tekshirildi: {doc.document_type.name_uz} -> {decision}. {comments}",
                request=request,
            )

        return Response({
            'message': f"Hujjat '{decision}' deb belgilandi.",
            'document': ApplicationDocumentSerializer(doc, context={'request': request}).data,
        })
