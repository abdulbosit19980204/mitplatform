"""
Models for the notifications app.
"""
from django.db import models
from django.conf import settings


class Notification(models.Model):
    """In-app notification for a user."""

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    title = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    related_application = models.ForeignKey(
        'applications.Application',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Bildirishnoma'
        verbose_name_plural = 'Bildirishnomalar'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.recipient} - {self.title}'


class InstitutionSettings(models.Model):
    """Singleton model for institution-wide configuration."""

    site_name_uz = models.CharField(
        max_length=255, default="Andijon qishloq xo'jaligi instituti"
    )
    site_name_ru = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    contact_address = models.TextField(blank=True)
    faq_content_uz = models.TextField(blank=True)
    documents_page_content_uz = models.TextField(blank=True)
    max_upload_size_mb = models.PositiveIntegerField(default=10)
    allow_pdf = models.BooleanField(default=True)
    allow_images = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Institut sozlamalari'
        verbose_name_plural = 'Institut sozlamalari'

    def __str__(self):
        return self.site_name_uz

    def save(self, *args, **kwargs):
        # Enforce singleton
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
