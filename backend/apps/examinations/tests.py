from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from apps.accounts.models import User
from apps.examinations.models import Examination, RequiredDocumentType, UzbekistanOTM, UzbekistanSpecialty


class ExaminationAPITestCase(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin_exam@aqxi.uz',
            password='Password123!',
            full_name='Exam Admin',
            role='admin',
            is_staff=True,
        )
        # Create 6 document types
        self.doc_types = []
        codes = [
            ('rector_letter', 'Rektor nomiga ariza', 1),
            ('passport_copy', 'Pasport nusxasi', 2),
            ('reference_objective', "Ma'lumotnoma (obyektivka)", 3),
            ('diploma_copy', 'Diplom nusxasi', 4),
            ('topic_confirmation', "Mavzu tasdiqlanganligi", 5),
            ('liaison_letter', "Aloqa xati", 6),
        ]
        for code, name, sort_order in codes:
            dt, _ = RequiredDocumentType.objects.get_or_create(
                code=code,
                defaults={'name_uz': name, 'sort_order': sort_order, 'accepted_formats': 'pdf'}
            )
            self.doc_types.append(dt)

        # Create OTM and Specialty sample
        UzbekistanOTM.objects.create(code='001', name_uz="Andijon qishloq xo'jaligi va agrotexnologiyalar instituti")
        UzbekistanSpecialty.objects.create(code='06.01.05', name_uz="Seleksiya va urug'chilik", field="Qishloq xo'jaligi fanlari")

    def test_get_document_types(self):
        res = self.client.get('/api/v1/examinations/document-types/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', res.data)
        self.assertEqual(len(results), 6)

    def test_get_otm_and_specialties(self):
        res_otm = self.client.get('/api/v1/reference/otm/')
        self.assertEqual(res_otm.status_code, status.HTTP_200_OK)
        results_otm = res_otm.data.get('results', res_otm.data)
        self.assertTrue(len(results_otm) >= 1)

        res_spec = self.client.get('/api/v1/reference/specialties/')
        self.assertEqual(res_spec.status_code, status.HTTP_200_OK)
        results_spec = res_spec.data.get('results', res_spec.data)
        self.assertTrue(len(results_spec) >= 1)

    def test_create_examination_auto_attaches_all_6_documents(self):
        self.client.force_authenticate(user=self.admin)
        now = timezone.now()
        payload = {
            'title': 'Falsafa va metodologiya imtihoni',
            'category': 'Malakaviy imtihon',
            'language': 'uz',
            'registration_start': now.isoformat(),
            'registration_end': (now + timedelta(days=15)).isoformat(),
            'exam_date': (now + timedelta(days=20)).isoformat(),
            'location': '2-bino, 101-xona',
            'capacity': 50,
            'status': 'published',
        }
        res = self.client.post('/api/v1/admin/examinations/', payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        exam_id = res.data['id']

        exam = Examination.objects.get(id=exam_id)
        self.assertEqual(exam.required_documents.count(), 6)
