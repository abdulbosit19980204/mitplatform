"""
URLs for content management app.
Includes public endpoints and admin CRUD viewsets.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicSiteSettingsView,
    PublicNavigationListView,
    PublicHomepageSectionListView,
    PublicFAQListView,
    PublicAnnouncementListView,
    PublicContentPageDetailView,
    AdminSiteSettingsView,
    AdminNavigationViewSet,
    AdminHomepageSectionViewSet,
    AdminFAQViewSet,
    AdminAnnouncementViewSet,
    AdminContentPageViewSet,
)

admin_router = DefaultRouter()
admin_router.register(r'navigation', AdminNavigationViewSet, basename='admin_navigation')
admin_router.register(r'homepage-sections', AdminHomepageSectionViewSet, basename='admin_homepage_sections')
admin_router.register(r'faqs', AdminFAQViewSet, basename='admin_faqs')
admin_router.register(r'announcements', AdminAnnouncementViewSet, basename='admin_announcements')
admin_router.register(r'pages', AdminContentPageViewSet, basename='admin_pages')

urlpatterns = [
    # Public endpoints
    path('settings/', PublicSiteSettingsView.as_view(), name='public_settings'),
    path('navigation/', PublicNavigationListView.as_view(), name='public_navigation'),
    path('homepage-sections/', PublicHomepageSectionListView.as_view(), name='public_homepage_sections'),
    path('faqs/', PublicFAQListView.as_view(), name='public_faqs'),
    path('announcements/', PublicAnnouncementListView.as_view(), name='public_announcements'),
    path('pages/<slug:slug>/', PublicContentPageDetailView.as_view(), name='public_page_detail'),

    # Admin endpoints
    path('admin/settings/', AdminSiteSettingsView.as_view(), name='admin_content_settings'),
    path('admin/', include(admin_router.urls)),
]
