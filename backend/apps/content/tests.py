from rest_framework.test import APITestCase
from rest_framework import status
from apps.accounts.models import User
from apps.content.models import (
    SiteSettings,
    NavigationItem,
    HomepageSection,
    FAQItem,
    Announcement,
    ContentPage,
)


class ContentAPITestCase(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin_cms@aqxi.uz',
            password='Password123!',
            full_name='CMS Admin',
            role='admin',
            is_staff=True,
        )
        self.applicant = User.objects.create_user(
            email='applicant_cms@aqxi.uz',
            password='Password123!',
            full_name='Applicant CMS',
            role='applicant',
        )

        # Seed sample items
        self.nav_item = NavigationItem.objects.create(
            title_uz='Imtihonlar',
            url='/imtihonlar',
            location='header',
            sort_order=1,
            is_active=True,
        )
        self.faq_item = FAQItem.objects.create(
            category='registration',
            question_uz="Qanday ro'yxatdan o'tiladi?",
            answer_uz="Onlayn ariza shaklini to'ldirish orqali.",
            sort_order=1,
            is_published=True,
        )
        self.announcement = Announcement.objects.create(
            title_uz="Qabul ochildi",
            content_uz="Bahorgi imtihonlar qabuli ochiq.",
            category='important',
            badge_type='info',
            is_published=True,
        )
        self.section = HomepageSection.objects.create(
            section_key='hero',
            title_uz="Imtihonlarga ro'yxatdan o'tish",
            subtitle_uz="Kerakli imtihonni tanlang",
            sort_order=1,
            is_active=True,
        )

    def test_public_content_endpoints(self):
        # Settings
        res_set = self.client.get('/api/v1/content/settings/')
        self.assertEqual(res_set.status_code, status.HTTP_200_OK)
        self.assertIn('site_name_uz', res_set.data)

        # Navigation
        res_nav = self.client.get('/api/v1/content/navigation/')
        self.assertEqual(res_nav.status_code, status.HTTP_200_OK)
        nav_results = res_nav.data.get('results', res_nav.data)
        self.assertTrue(len(nav_results) >= 1)

        # FAQs
        res_faq = self.client.get('/api/v1/content/faqs/')
        self.assertEqual(res_faq.status_code, status.HTTP_200_OK)
        faq_results = res_faq.data.get('results', res_faq.data)
        self.assertTrue(len(faq_results) >= 1)

        # Announcements
        res_ann = self.client.get('/api/v1/content/announcements/')
        self.assertEqual(res_ann.status_code, status.HTTP_200_OK)
        ann_results = res_ann.data.get('results', res_ann.data)
        self.assertTrue(len(ann_results) >= 1)

        # Homepage sections
        res_sec = self.client.get('/api/v1/content/homepage-sections/')
        self.assertEqual(res_sec.status_code, status.HTTP_200_OK)
        sec_results = res_sec.data.get('results', res_sec.data)
        self.assertTrue(len(sec_results) >= 1)

    def test_admin_cms_crud(self):
        # Applicant cannot edit CMS
        self.client.force_authenticate(user=self.applicant)
        res_forbidden = self.client.post('/api/v1/content/admin/faqs/', {
            'question_uz': 'Test question?',
            'answer_uz': 'Test answer.',
            'category': 'general',
        })
        self.assertEqual(res_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # Admin CAN edit CMS
        self.client.force_authenticate(user=self.admin)
        res_create = self.client.post('/api/v1/content/admin/faqs/', {
            'question_uz': 'Yangi savol?',
            'answer_uz': 'Yangi javob.',
            'category': 'general',
            'is_published': True,
        })
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        new_faq_id = res_create.data['id']

        # Update FAQ
        res_update = self.client.patch(f'/api/v1/content/admin/faqs/{new_faq_id}/', {
            'question_uz': 'Tahrirlangan savol?',
        })
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        self.assertEqual(res_update.data['question_uz'], 'Tahrirlangan savol?')

        # Delete FAQ
        res_delete = self.client.delete(f'/api/v1/content/admin/faqs/{new_faq_id}/')
        self.assertEqual(res_delete.status_code, status.HTTP_204_NO_CONTENT)
