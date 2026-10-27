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

    code = models.CharField(max_length=20, unique=True, db_index=True)
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

    code = models.CharField(max_length=20, unique=True, db_index=True)
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


# ============================================================================
# ARCHITECTURAL ENTERPRISE MODELS (OAK & INSTITUTIONS REGISTRY)
# ============================================================================

class EducationType(models.TextChoices):
    """Ta'lim va ilmiy muassasa turlari klassifikatori."""
    OTM = 'otm', "Oliy ta'lim muassasasi (OTM)"
    ITM = 'itm', "Ilmiy-tadqiqot muassasasi (ITM)"
    CENTER = 'center', "Ilmiy markaz / Texnopark"
    OTHER = 'other', "Boshqa tashkilot"


class Institution(models.Model):
    """
    Respublikadagi barcha OTM, ITM va ilmiy markazlar reestri.
    HEMIS va data.egov.uz orqali avtomatik sinxronizatsiya qilinadi.
    """
    institution_type = models.CharField(
        max_length=20,
        choices=EducationType.choices,
        default=EducationType.OTM,
        db_index=True,
        verbose_name="Muassasa turi",
    )
    code = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        verbose_name="Muassasa kodi (HEMIS/Reyestr)",
    )
    stir = models.CharField(
        max_length=20,
        blank=True,
        db_index=True,
        verbose_name="STIR / TIN soliq to'lovchi kodi",
    )
    name_uz = models.CharField(
        max_length=500,
        verbose_name="Muassasa nomi (O'zbekcha)",
    )
    name_ru = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Muassasa nomi (Ruscha)",
    )
    name_en = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Muassasa nomi (Inglizcha)",
    )
    region = models.CharField(
        max_length=150,
        blank=True,
        db_index=True,
        verbose_name="Viloyat / Hudud",
    )
    website = models.URLField(
        max_length=300,
        blank=True,
        verbose_name="Rasmiy veb-sayti",
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Faol holatda",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ta'lim muassasasi"
        verbose_name_plural = "Ta'lim muassasalari"
        ordering = ['name_uz']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['institution_type', 'is_active']),
            models.Index(fields=['region', 'is_active']),
        ]

    def __str__(self) -> str:
        return f"{self.code} - {self.name_uz} ({self.get_institution_type_display()})"


class ScienceBranch(models.Model):
    """
    OAK tomonidan tasdiqlangan Fan tarmoqlari klassifikatori.
    Masalan: 05.00.00 - Texnika fanlari, 06.00.00 - Qishloq xo'jaligi fanlari.
    """
    code = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        verbose_name="Fan tarmog'i shifri (masalan: 05.00.00)",
    )
    name_uz = models.CharField(
        max_length=500,
        verbose_name="Fan tarmog'i nomi (O'zbekcha)",
    )
    name_ru = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Fan tarmog'i nomi (Ruscha)",
    )
    name_en = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Fan tarmog'i nomi (Inglizcha)",
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Faol",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Fan tarmog'i"
        verbose_name_plural = "Fan tarmoqlari"
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self) -> str:
        return f"{self.code} - {self.name_uz}"


class Specialty(models.Model):
    """
    OAK Ixtisoslik shifrlari reestri (PhD va DSc ilmiy darajalari uchun).
    Masalan: 05.01.07 - Matematik modellashtirish, sonli usullar va dasturlar majmui.
    """
    code = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        verbose_name="Ixtisoslik shifri (masalan: 05.01.07)",
    )
    name_uz = models.CharField(
        max_length=500,
        verbose_name="Ixtisoslik nomi (O'zbekcha)",
    )
    name_ru = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Ixtisoslik nomi (Ruscha)",
    )
    name_en = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Ixtisoslik nomi (Inglizcha)",
    )
    branch = models.ForeignKey(
        ScienceBranch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='specialties',
        verbose_name="Tegishli fan tarmog'i",
    )
    has_council = models.BooleanField(
        default=False,
        verbose_name="Ixtisoslashgan ilmiy kengash mavjudligi",
        help_text="Ushbu ixtisoslik bo'yicha institutda himoya ilmiy kengashi bormi?",
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Faol",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "OAK Ixtisosligi"
        verbose_name_plural = "OAK Ixtisosliklari"
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['branch', 'is_active']),
            models.Index(fields=['has_council', 'is_active']),
        ]

    def __str__(self) -> str:
        branch_str = f" [{self.branch.code}]" if self.branch else ""
        return f"{self.code} - {self.name_uz}{branch_str}"
