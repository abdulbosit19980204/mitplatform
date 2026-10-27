"""
Models for the scheduling app.
"""
from django.db import models


class ExaminationSession(models.Model):
    """A specific time slot session for an examination."""

    examination = models.ForeignKey(
        'examinations.Examination',
        on_delete=models.CASCADE,
        related_name='sessions',
    )
    name = models.CharField(max_length=200)
    exam_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    venue = models.CharField(max_length=500, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Imtihon sessiyasi'
        verbose_name_plural = 'Imtihon sessiyalari'
        ordering = ['exam_date', 'start_time']

    def __str__(self):
        return f'{self.examination} - {self.name} ({self.exam_date})'

    @property
    def registered_count(self):
        return self.applications.exclude(status='draft').count()
