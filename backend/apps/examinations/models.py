"""
Models for the examinations app.
Includes Examination, RequiredDocumentType, ExaminationRequiredDocument,
UzbekistanOTM, and UzbekistanSpecialty.
"""
from django.db import models
from django.utils import timezone
from django.conf import settings


EXAM_STATUS = [
    ('draft', 'Qoralama'),
    ('published', 'Nashr etilgan'),
    ('registration_closed', "Ro'yxatdan o'tish yopilgan"),
    ('archived', 'Arxivlangan'),
]

EXAM_LANGUAGE = [
    ('uz', "O'zbek"),
    ('en', 'Ingliz'),
    ('de', 'Nemis'),
    ('ru', 'Rus'),
]


class Examination(models.Model):
    """Represents an examination event that applicants can register for."""

    title = models.CharField(max_length=500)
    title_uz = models.CharField(max_length=500, blank=True, verbose_name='Nomi (lotin)')
    title_oz = models.CharField(max_length=500, blank=True, verbose_name='Nomi (kirill)')
    title_ru = models.CharField(max_length=500, blank=True, verbose_name='Nomi (rus)')
    description = models.TextField(blank=True)
    category = models.CharField(max_length=200, blank=True)
    language = models.CharField(max_length=10, choices=EXAM_LANGUAGE, default='uz')
    registration_start = models.DateTimeField()
    registration_end = models.DateTimeField()
    exam_date = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=500, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    eligibility_rules = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=EXAM_STATUS, default='draft')
    is_foreign_language = models.BooleanField(
        default=False, help_text='Chet tili imtihoni (6 ta hujjat talab qilinadi)'
    )
    require_liaison_letter = models.BooleanField(
        default=False, help_text="Bog'liqlik maktubini talab qilish"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_examinations',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Imtihon'
        verbose_name_plural = 'Imtihonlar'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def is_registration_open(self):
        now = timezone.now()
        return (
            self.status == 'published'
            and self.registration_start <= now <= self.registration_end
        )

    @property
    def registered_count(self):
        return self.applications.exclude(status='draft').count()


class RequiredDocumentType(models.Model):
    """Global document type definitions (rector letter, diploma, etc.)."""

    code = models.CharField(max_length=50, unique=True)
    name_uz = models.CharField(max_length=500)
    name_oz = models.CharField(max_length=500, blank=True)
    name_ru = models.CharField(max_length=500, blank=True)
    description_uz = models.TextField(blank=True)
    accepted_formats = models.CharField(max_length=200, default='pdf')
    max_size_mb = models.PositiveIntegerField(default=10)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Hujjat turi'
        verbose_name_plural = 'Hujjat turlari'
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.code}: {self.name_uz}'


class ExaminationRequiredDocument(models.Model):
    """Links required document types to a specific examination."""

    examination = models.ForeignKey(
        Examination, on_delete=models.CASCADE, related_name='required_documents'
    )
    document_type = models.ForeignKey(
        RequiredDocumentType, on_delete=models.PROTECT
    )
    is_conditional = models.BooleanField(
        default=False, help_text='Shartli ravishda talab qilinadi'
    )
    condition_field = models.CharField(
        max_length=100,
        blank=True,
        help_text="Profildagi maydon nomi, masalan 'is_from_another_institution'",
    )
    is_required = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Imtihon uchun talab qilinadigan hujjat"
        verbose_name_plural = "Imtihon uchun talab qilinadigan hujjatlar"
        unique_together = ['examination', 'document_type']
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.examination} - {self.document_type}'


class UzbekistanOTM(models.Model):
    """Uzbekistan Higher Education Institutions - for autocomplete dropdowns."""

    code = models.CharField(max_length=20, unique=True)
    name_uz = models.CharField(max_length=500)
    name_oz = models.CharField(max_length=500, blank=True)
    name_ru = models.CharField(max_length=500, blank=True)
    region = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "O'quv yurt"
        verbose_name_plural = "O'quv yurtlar"
        ordering = ['name_uz']

    def __str__(self):
        return f'{self.code} - {self.name_uz}'


class UzbekistanSpecialty(models.Model):
    """OAK PhD/DSc specialty codes for academic degrees."""

    code = models.CharField(max_length=20, unique=True)
    name_uz = models.CharField(max_length=500)
    name_oz = models.CharField(max_length=500, blank=True)
    name_ru = models.CharField(max_length=500, blank=True)
    field = models.CharField(max_length=200, blank=True, verbose_name="Ilmiy daraja fan tarmog'i")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Mutaxassislik'
        verbose_name_plural = 'Mutaxassisliklar'
        ordering = ['code']

    def __str__(self):
        return f'{self.code} - {self.name_uz}'
