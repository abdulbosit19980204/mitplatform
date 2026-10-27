"""
Models for the applications app.
"""
import random
import string
import uuid

from django.db import models
from django.utils import timezone
from django.conf import settings


APP_STATUS = [
    ('draft', 'Qoralama'),
    ('submitted', 'Yuborilgan'),
    ('under_review', "Ko'rib chiqilmoqda"),
    ('correction_required', 'Tuzatish talab qilinadi'),
    ('approved', 'Tasdiqlangan'),
    ('rejected', 'Rad etilgan'),
    ('completed', 'Yakunlangan'),
]

VALID_TRANSITIONS = {
    'draft': ['submitted'],
    'submitted': ['under_review'],
    'under_review': ['correction_required', 'approved', 'rejected'],
    'correction_required': ['submitted'],
    'approved': ['completed'],
    'rejected': [],
    'completed': [],
}


class Application(models.Model):
    """An applicant's registration application for an examination."""

    reference_number = models.CharField(max_length=20, unique=True, editable=False)
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='applications',
    )
    examination = models.ForeignKey(
        'examinations.Examination',
        on_delete=models.PROTECT,
        related_name='applications',
    )
    session = models.ForeignKey(
        'scheduling.ExaminationSession',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications',
    )
    status = models.CharField(max_length=30, choices=APP_STATUS, default='draft')

    # Snapshot of applicant data at submission time
    applicant_snapshot = models.JSONField(null=True, blank=True)

    # Admin fields
    assigned_reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_applications',
    )
    internal_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    correction_notes = models.TextField(blank=True, help_text='Abituriyentga ko\'rinadigan eslatmalar')

    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Ariza'
        verbose_name_plural = 'Arizalar'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['applicant', 'examination'],
                name='unique_applicant_examination',
            )
        ]

    def __str__(self):
        return f'{self.reference_number} - {self.applicant}'

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = self._generate_reference()
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_reference():
        prefix = 'AQXI'
        year = timezone.now().year
        random_part = ''.join(random.choices(string.digits, k=6))
        return f'{prefix}-{year}-{random_part}'

    def can_transition_to(self, new_status):
        """Check if the status transition is valid."""
        return new_status in VALID_TRANSITIONS.get(self.status, [])

    def transition_to(self, new_status, changed_by=None, reason=''):
        """Perform a status transition and record history."""
        if not self.can_transition_to(new_status):
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                f"'{self.status}' holatidan '{new_status}' holatiga o'tish mumkin emas"
            )
        old_status = self.status
        self.status = new_status
        if new_status == 'submitted' and not self.submitted_at:
            self.submitted_at = timezone.now()
        self.save(update_fields=['status', 'submitted_at', 'updated_at'])

        ApplicationStatusHistory.objects.create(
            application=self,
            from_status=old_status,
            to_status=new_status,
            changed_by=changed_by,
            reason=reason,
        )
        return self


class ApplicationStatusHistory(models.Model):
    """Tracks the history of status changes for an application."""

    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name='status_history'
    )
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Ariza holati tarixi'
        verbose_name_plural = 'Ariza holati tarixlari'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.application.reference_number}: {self.from_status} → {self.to_status}'
