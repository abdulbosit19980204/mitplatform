"""
Content Management Models for mitplatform.
Supports dynamic institutional branding, homepage sections, navigation menus,
announcements, FAQs, editable informational pages, and site-wide settings.
"""
from django.db import models
from django.utils import timezone


class SiteSettings(models.Model):
    """
    Singleton model storing institutional identity, contact info,
    upload limits, and localization defaults.
    """
    site_name_uz = models.CharField(
        max_length=255, default="Andijon qishloq xo'jaligi va agrotexnologiyalar instituti"
    )
    site_name_oz = models.CharField(
        max_length=255, default="Андижон қишлоқ хўжалиги ва агротехнологиялар институти"
    )
    site_name_ru = models.CharField(
        max_length=255, default="Андижанский институт сельского хозяйства и агротехнологий"
    )
    motto_uz = models.CharField(
        max_length=500, default="Oliy attestatsiya va malakaviy imtihonlar portali", blank=True
    )
    motto_oz = models.CharField(
        max_length=500, default="Олий аттестация ва малакавий имтиҳонлар портали", blank=True
    )
    motto_ru = models.CharField(
        max_length=500, default="Портал высшей аттестации и квалификационных экзаменов", blank=True
    )
    logo_url = models.CharField(max_length=500, blank=True)
    contact_email = models.EmailField(default="ilm@aqxi.uz")
    contact_phone = models.CharField(max_length=50, default="+998 (74) 223-45-67")
    contact_phone_secondary = models.CharField(max_length=50, blank=True, default="+998 (74) 223-45-68")
    contact_address_uz = models.TextField(
        default="Andijon viloyati, Andijon tumani, Kuyganyor qo'rg'oni, Oliygoh ko'chasi 1-uy"
    )
    contact_address_oz = models.TextField(
        default="Андижон вилояти, Андижон tumani, Куйганёр қўрғони, Олийгоҳ кўчаси 1-уй", blank=True
    )
    contact_address_ru = models.TextField(
        default="Андижанская область, Андижанский район, поселок Куйганёр, ул. Олийгох 1", blank=True
    )
    work_hours = models.CharField(max_length=200, default="Dushanba - Shanba: 09:00 - 18:00")
    telegram_channel = models.CharField(max_length=255, default="https://t.me/aqxi_rasmiy", blank=True)
    youtube_channel = models.CharField(max_length=255, blank=True)
    official_website = models.CharField(max_length=255, default="https://aqxi.uz", blank=True)
    application_reference_prefix = models.CharField(max_length=20, default="AQXI")
    max_upload_size_mb = models.PositiveIntegerField(default=10)
    allowed_upload_formats = models.CharField(max_length=200, default="pdf,jpg,jpeg,png")
    enabled_languages = models.CharField(max_length=50, default="uz,oz,ru")
    default_language = models.CharField(max_length=10, default="uz")
    footer_copyright_uz = models.CharField(
        max_length=500,
        default="© 2026 Andijon qishloq xo'jaligi va agrotexnologiyalar instituti. Barcha huquqlar himoyalangan."
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Institut sozlamalari"
        verbose_name_plural = "Institut sozlamalari"

    def __str__(self):
        return self.site_name_uz

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class NavigationItem(models.Model):
    """Configurable navigation links for header and footer."""

    LOCATION_CHOICES = [
        ('header', 'Asosiy menyu (Header)'),
        ('footer_quick', 'Futer tezkor havolalar'),
        ('footer_legal', "Futer me'yoriy havolalar"),
    ]

    title_uz = models.CharField(max_length=200)
    title_oz = models.CharField(max_length=200, blank=True)
    title_ru = models.CharField(max_length=200, blank=True)
    url = models.CharField(max_length=500)
    location = models.CharField(max_length=30, choices=LOCATION_CHOICES, default='header')
    sort_order = models.PositiveIntegerField(default=0)
    is_external = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Navigatsiya elementi"
        verbose_name_plural = "Navigatsiya elementlari"
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"[{self.location}] {self.title_uz} -> {self.url}"


class HomepageSection(models.Model):
    """
    Configurable homepage sections: hero, workflow, announcements banner,
    documents banner, support, etc.
    """
    section_key = models.CharField(max_length=100, unique=True, db_index=True)
    title_uz = models.CharField(max_length=500)
    title_oz = models.CharField(max_length=500, blank=True)
    title_ru = models.CharField(max_length=500, blank=True)
    subtitle_uz = models.TextField(blank=True)
    subtitle_oz = models.TextField(blank=True)
    subtitle_ru = models.TextField(blank=True)
    content_uz = models.TextField(blank=True)
    content_oz = models.TextField(blank=True)
    content_ru = models.TextField(blank=True)
    button_text_uz = models.CharField(max_length=150, blank=True)
    button_text_oz = models.CharField(max_length=150, blank=True)
    button_text_ru = models.CharField(max_length=150, blank=True)
    button_url = models.CharField(max_length=500, blank=True)
    secondary_button_text_uz = models.CharField(max_length=150, blank=True)
    secondary_button_text_oz = models.CharField(max_length=150, blank=True)
    secondary_button_text_ru = models.CharField(max_length=150, blank=True)
    secondary_button_url = models.CharField(max_length=500, blank=True)
    badge_text_uz = models.CharField(max_length=200, blank=True)
    badge_text_oz = models.CharField(max_length=200, blank=True)
    badge_text_ru = models.CharField(max_length=200, blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    icon_name = models.CharField(max_length=50, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bosh sahifa bo'limi"
        verbose_name_plural = "Bosh sahifa bo'limlari"
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"{self.section_key}: {self.title_uz}"


class FAQItem(models.Model):
    """Frequently Asked Questions."""

    CATEGORY_CHOICES = [
        ('registration', "Ro'yxatdan o'tish"),
        ('documents', 'Hujjatlar'),
        ('exams', 'Imtihon qoidalari'),
        ('results', 'Natijalar va ruxsatnomalar'),
        ('general', 'Umumiy savollar'),
    ]

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    question_uz = models.CharField(max_length=500)
    question_oz = models.CharField(max_length=500, blank=True)
    question_ru = models.CharField(max_length=500, blank=True)
    answer_uz = models.TextField()
    answer_oz = models.TextField(blank=True)
    answer_ru = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ko'p so'raladigan savol"
        verbose_name_plural = "Ko'p so'raladigan savollar (FAQ)"
        ordering = ['sort_order', 'id']

    def __str__(self):
        return self.question_uz


class Announcement(models.Model):
    """Official institutional announcements and alerts."""

    CATEGORY_CHOICES = [
        ('important', 'Muhim xabar'),
        ('deadline', 'Muddatlar'),
        ('exam_schedule', 'Imtihon jadvali'),
        ('general', 'Umumiy'),
    ]

    BADGE_CHOICES = [
        ('info', "Ma'lumot (Moviy)"),
        ('warning', 'Ogohlantirish (Sariq)'),
        ('success', 'Muvaffaqiyat (Yashil)'),
        ('danger', 'Shoshilinch (Qizil)'),
    ]

    title_uz = models.CharField(max_length=500)
    title_oz = models.CharField(max_length=500, blank=True)
    title_ru = models.CharField(max_length=500, blank=True)
    content_uz = models.TextField()
    content_oz = models.TextField(blank=True)
    content_ru = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    badge_type = models.CharField(max_length=20, choices=BADGE_CHOICES, default='info')
    is_pinned = models.BooleanField(default=False, help_text="Bosh sahifada yuqoriga qadash")
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "E'lon"
        verbose_name_plural = "E'lonlar"
        ordering = ['-is_pinned', '-published_at']

    def __str__(self):
        return self.title_uz

    @property
    def is_active(self):
        if not self.is_published:
            return False
        now = timezone.now()
        if self.expires_at and now > self.expires_at:
            return False
        return self.published_at <= now


class ContentPage(models.Model):
    """Custom editable institutional pages (e.g. Instructions, Rules, Privacy)."""

    slug = models.SlugField(max_length=100, unique=True)
    title_uz = models.CharField(max_length=500)
    title_oz = models.CharField(max_length=500, blank=True)
    title_ru = models.CharField(max_length=500, blank=True)
    lead_uz = models.TextField(blank=True)
    lead_oz = models.TextField(blank=True)
    lead_ru = models.TextField(blank=True)
    body_html_uz = models.TextField()
    body_html_oz = models.TextField(blank=True)
    body_html_ru = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Statik sahifa matni"
        verbose_name_plural = "Statik sahifalar matnlari"
        ordering = ['title_uz']

    def __str__(self):
        return f"{self.slug}: {self.title_uz}"
