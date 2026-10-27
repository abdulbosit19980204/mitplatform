"""
Models for the audit app.
"""
from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    """Immutable audit trail for sensitive actions."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    action = models.CharField(
        max_length=100,
        help_text="'document_viewed', 'application_approved', etc."
    )
    target_type = models.CharField(max_length=100, blank=True)
    target_id = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Audit yozuvi'
        verbose_name_plural = 'Audit yozuvlari'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.created_at} - {self.user} - {self.action}'

    @classmethod
    def log(cls, user, action, target=None, description='', request=None):
        """Convenience class method to create audit log entries."""
        ip = None
        agent = ''
        if request:
            ip = cls._get_client_ip(request)
            agent = request.META.get('HTTP_USER_AGENT', '')[:500]

        target_type = ''
        target_id = ''
        if target:
            target_type = target.__class__.__name__
            target_id = str(target.pk)

        return cls.objects.create(
            user=user if user and user.is_authenticated else None,
            action=action,
            target_type=target_type,
            target_id=target_id,
            description=description,
            ip_address=ip,
            user_agent=agent,
        )

    @staticmethod
    def _get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
