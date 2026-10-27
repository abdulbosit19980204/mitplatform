"""
Models for the documents app.
"""
import uuid
import os

from django.db import models
from django.conf import settings


def private_upload_path(instance, filename):
    """Generate a secure, randomized upload path for documents."""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'bin'
    return f'private/apps/{instance.application.id}/docs/{uuid.uuid4().hex}.{ext}'


DOC_STATUS = [
    ('pending', 'Tekshirilmoqda'),
    ('approved', 'Tasdiqlangan'),
    ('correction_required', 'Tuzatish talab qilinadi'),
]


class ApplicationDocument(models.Model):
    """A document uploaded for a specific application."""

    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.CASCADE,
        related_name='documents',
    )
    document_type = models.ForeignKey(
        'examinations.RequiredDocumentType',
        on_delete=models.PROTECT,
    )
    file = models.FileField(upload_to=private_upload_path)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=100)
    status = models.CharField(max_length=30, choices=DOC_STATUS, default='pending')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Ariza hujjati'
        verbose_name_plural = 'Ariza hujjatlari'
        unique_together = ['application', 'document_type']

    def __str__(self):
        return f'{self.application.reference_number} - {self.document_type.code}'


class DocumentReview(models.Model):
    """Admin review decision for a specific document."""

    DECISION_CHOICES = [
        ('approved', 'Tasdiqlandi'),
        ('correction_required', 'Tuzatish talab qilinadi'),
    ]

    document = models.ForeignKey(
        ApplicationDocument, on_delete=models.CASCADE, related_name='reviews'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    decision = models.CharField(max_length=30, choices=DECISION_CHOICES)
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Hujjat sharhi'
        verbose_name_plural = 'Hujjat sharhlari'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.document} - {self.decision}'
