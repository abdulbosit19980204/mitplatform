"""
Views for content management app.
Provides public read views for applicants and full CRUD viewsets for administrators.
"""
from django.utils import timezone
from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from .models import (
    SiteSettings,
    NavigationItem,
    HomepageSection,
    FAQItem,
    Announcement,
    ContentPage,
)
from .serializers import (
    SiteSettingsSerializer,
    NavigationItemSerializer,
    HomepageSectionSerializer,
    FAQItemSerializer,
    AnnouncementSerializer,
    ContentPageSerializer,
)
from apps.accounts.permissions import IsAdministrator
from apps.audit.models import AuditLog


# -------------------------------------------------------------
# PUBLIC ENDPOINTS (Read-Only)
# -------------------------------------------------------------

class PublicSiteSettingsView(generics.RetrieveAPIView):
    """Returns general institutional settings for the public website."""
    permission_classes = [permissions.AllowAny]
    serializer_class = SiteSettingsSerializer

    def get_object(self):
        return SiteSettings.get_settings()


class PublicNavigationListView(generics.ListAPIView):
    """Returns active navigation items grouped by location (header/footer)."""
    permission_classes = [permissions.AllowAny]
    serializer_class = NavigationItemSerializer

    def get_queryset(self):
        qs = NavigationItem.objects.filter(is_active=True).order_by('sort_order', 'id')
        loc = self.request.query_params.get('location')
        if loc:
            qs = qs.filter(location=loc)
        return qs


class PublicHomepageSectionListView(generics.ListAPIView):
    """Returns published homepage sections."""
    permission_classes = [permissions.AllowAny]
    serializer_class = HomepageSectionSerializer

    def get_queryset(self):
        return HomepageSection.objects.filter(is_active=True).order_by('sort_order', 'id')


class PublicFAQListView(generics.ListAPIView):
    """Returns published FAQ items."""
    permission_classes = [permissions.AllowAny]
    serializer_class = FAQItemSerializer

    def get_queryset(self):
        qs = FAQItem.objects.filter(is_published=True).order_by('sort_order', 'id')
        cat = self.request.query_params.get('category')
        if cat:
            qs = qs.filter(category=cat)
        return qs


class PublicAnnouncementListView(generics.ListAPIView):
    """Returns active published announcements."""
    permission_classes = [permissions.AllowAny]
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        now = timezone.now()
        return Announcement.objects.filter(
            is_published=True,
            published_at__lte=now,
        ).exclude(
            expires_at__isnull=False,
            expires_at__lt=now,
        ).order_by('-is_pinned', '-published_at')


class PublicContentPageDetailView(generics.RetrieveAPIView):
    """Returns a published static/informational page by slug."""
    permission_classes = [permissions.AllowAny]
    serializer_class = ContentPageSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return ContentPage.objects.filter(is_published=True)


# -------------------------------------------------------------
# ADMINISTRATOR CRUD ENDPOINTS (IsAdministrator)
# -------------------------------------------------------------

class AdminSiteSettingsView(generics.RetrieveUpdateAPIView):
    """Admin endpoint to retrieve and update institution settings."""
    permission_classes = [IsAdministrator]
    serializer_class = SiteSettingsSerializer

    def get_object(self):
        return SiteSettings.get_settings()

    def perform_update(self, serializer):
        settings_obj = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='settings_updated',
            target=settings_obj,
            description="Institut umumiy sozlamalari yangilandi",
            request=self.request,
        )


class AdminNavigationViewSet(viewsets.ModelViewSet):
    """Admin CRUD for Navigation Items."""
    permission_classes = [IsAdministrator]
    serializer_class = NavigationItemSerializer
    queryset = NavigationItem.objects.all().order_by('location', 'sort_order', 'id')

    def perform_create(self, serializer):
        item = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='navigation_created',
            target=item,
            description=f"Yangi menyu elementi yaratildi: {item.title_uz}",
            request=self.request,
        )

    def perform_update(self, serializer):
        item = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='navigation_updated',
            target=item,
            description=f"Menyu elementi tahrirlandi: {item.title_uz}",
            request=self.request,
        )

    def perform_destroy(self, instance):
        AuditLog.log(
            user=self.request.user,
            action='navigation_deleted',
            description=f"Menyu elementi o'chirildi: {instance.title_uz}",
            request=self.request,
        )
        instance.delete()


class AdminHomepageSectionViewSet(viewsets.ModelViewSet):
    """Admin CRUD for Homepage Sections."""
    permission_classes = [IsAdministrator]
    serializer_class = HomepageSectionSerializer
    queryset = HomepageSection.objects.all().order_by('sort_order', 'id')

    def perform_create(self, serializer):
        section = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='homepage_section_created',
            target=section,
            description=f"Bosh sahifa bo'limi yaratildi: {section.section_key}",
            request=self.request,
        )

    def perform_update(self, serializer):
        section = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='homepage_section_updated',
            target=section,
            description=f"Bosh sahifa bo'limi yangilandi: {section.section_key}",
            request=self.request,
        )


class AdminFAQViewSet(viewsets.ModelViewSet):
    """Admin CRUD for FAQ items."""
    permission_classes = [IsAdministrator]
    serializer_class = FAQItemSerializer
    queryset = FAQItem.objects.all().order_by('sort_order', 'id')

    def perform_create(self, serializer):
        faq = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='faq_created',
            target=faq,
            description=f"Yangi FAQ savoli qo'shildi: {faq.question_uz}",
            request=self.request,
        )

    def perform_update(self, serializer):
        faq = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='faq_updated',
            target=faq,
            description=f"FAQ savoli tahrirlandi: {faq.question_uz}",
            request=self.request,
        )

    def perform_destroy(self, instance):
        AuditLog.log(
            user=self.request.user,
            action='faq_deleted',
            description=f"FAQ savoli o'chirildi: {instance.question_uz}",
            request=self.request,
        )
        instance.delete()


class AdminAnnouncementViewSet(viewsets.ModelViewSet):
    """Admin CRUD for Announcements."""
    permission_classes = [IsAdministrator]
    serializer_class = AnnouncementSerializer
    queryset = Announcement.objects.all().order_by('-is_pinned', '-published_at')

    def perform_create(self, serializer):
        ann = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='announcement_created',
            target=ann,
            description=f"Yangi e'lon joylashtirildi: {ann.title_uz}",
            request=self.request,
        )

    def perform_update(self, serializer):
        ann = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='announcement_updated',
            target=ann,
            description=f"E'lon tahrirlandi: {ann.title_uz}",
            request=self.request,
        )

    def perform_destroy(self, instance):
        AuditLog.log(
            user=self.request.user,
            action='announcement_deleted',
            description=f"E'lon o'chirildi: {instance.title_uz}",
            request=self.request,
        )
        instance.delete()


class AdminContentPageViewSet(viewsets.ModelViewSet):
    """Admin CRUD for Content Pages."""
    permission_classes = [IsAdministrator]
    serializer_class = ContentPageSerializer
    queryset = ContentPage.objects.all().order_by('title_uz')
    lookup_field = 'slug'

    def perform_create(self, serializer):
        page = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='content_page_created',
            target=page,
            description=f"Yangi sahifa yaratildi: {page.slug}",
            request=self.request,
        )

    def perform_update(self, serializer):
        page = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='content_page_updated',
            target=page,
            description=f"Sahifa tahrirlandi: {page.slug}",
            request=self.request,
        )
