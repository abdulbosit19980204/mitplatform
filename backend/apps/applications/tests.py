"""
Comprehensive automated tests for examinations, applications, and documents workflow.
"""
from datetime import timedelta
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status

from apps.accounts.models import User, ApplicantProfile
from apps.examinations.models import (
    Examination,
    RequiredDocumentType,
    ExaminationRequiredDocument,
    UzbekistanOTM,
    UzbekistanSpecialty,
)
from apps.applications.models import Application
from apps.documents.models import ApplicationDocument


class ExaminationPlatformTestCase(APITestCase):

    def setUp(self):
        # Create users
        self.admin = User.objects.create_user(
            email='admin_test@aqxi.uz',
            password='Password123!',
            full_name='Admin Test',
            role='admin',
            is_staff=True,
        )

        self.reviewer = User.objects.create_user(
            email='reviewer_test@aqxi.uz',
            password='Password123!',
            full_name='Reviewer Test',
            role='reviewer',
        )

        self.applicant = User.objects.create_user(
            email='applicant_test@aqxi.uz',
            password='Password123!',
            full_name='Applicant Test',
            role='applicant',
        )
        self.profile = ApplicantProfile.objects.create(
            user=self.applicant,
            first_name='Anvar',
            last_name='Karimov',
            is_from_another_institution=False,
        )

        # 6 required document types
        self.doc_types = []
        codes = [
            ('rector_letter', 'Rektor nomiga ariza', 1),
            ('passport_copy', 'Pasport nusxasi', 2),
            ('reference_objective', 'Obyektivka', 3),
            ('diploma_copy', 'Diplom nusxasi', 4),
            ('topic_confirmation', 'Mavzu tasdiqlanganligi', 5),
            ('liaison_letter', 'Aloqa xati', 6),
        ]
        for code, name, sort_order in codes:
            dt, _ = RequiredDocumentType.objects.get_or_create(
                code=code,
                defaults={
                    'name_uz': name,
                    'accepted_formats': 'pdf,jpg,png',
                    'max_size_mb': 10,
                    'sort_order': sort_order,
                }
            )
            self.doc_types.append(dt)

        # Create published examination
        now = timezone.now()
        self.exam = Examination.objects.create(
            title='Ingliz tili imtihoni',
            language='en',
            registration_start=now - timedelta(days=1),
            registration_end=now + timedelta(days=10),
            status='published',
            is_foreign_language=True,
            created_by=self.admin,
        )

        # Attach 6 documents (doc 6 is conditional)
        for dt in self.doc_types:
            is_cond = (dt.code == 'liaison_letter')
            ExaminationRequiredDocument.objects.create(
                examination=self.exam,
                document_type=dt,
                is_conditional=is_cond,
                condition_field='is_from_another_institution' if is_cond else '',
                sort_order=dt.sort_order,
            )

    def test_auth_registration_and_login(self):
        """Test registration and login flow."""
        reg_data = {
            'email': 'new_user@aqxi.uz',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
            'full_name': 'Aliyev Vali',
            'phone': '+998901112233',
        }
        res = self.client.post('/api/v1/auth/register/', reg_data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)

        # Login
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': 'new_user@aqxi.uz',
            'password': 'StrongPassword123!',
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', login_res.data)

    def test_role_based_access(self):
        """Applicants cannot access admin endpoints."""
        self.client.force_authenticate(user=self.applicant)
        res = self.client.get('/api/v1/admin/dashboard/stats/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can access
        self.client.force_authenticate(user=self.admin)
        admin_res = self.client.get('/api/v1/admin/dashboard/stats/')
        self.assertEqual(admin_res.status_code, status.HTTP_200_OK)

    def test_conditional_document_requirement(self):
        """
        Verify Document 6 conditional logic:
        - When applicant is NOT from another institution: requires docs 1-5 only.
        - When applicant IS from another institution: requires docs 1-6.
        """
        self.client.force_authenticate(user=self.applicant)

        # Create application draft
        app_res = self.client.post('/api/v1/applications/', {
            'examination_id': self.exam.id,
        })
        self.assertEqual(app_res.status_code, status.HTTP_201_CREATED)
        app_id = app_res.data['id']
        app = Application.objects.get(id=app_id)

        # Attempt to submit without documents -> should fail
        submit_res = self.client.post(f'/api/v1/applications/{app_id}/submit/')
        self.assertEqual(submit_res.status_code, status.HTTP_400_BAD_REQUEST)
        missing = submit_res.data.get('missing_documents') or submit_res.data.get('error', {}).get('details', {}).get('missing_documents', [])
        self.assertTrue(len(missing) > 0)

        # Upload first 5 documents
        pdf_content = b'%PDF-1.4 test content'
        for dt in self.doc_types[:5]:
            fake_file = SimpleUploadedFile(f'{dt.code}.pdf', pdf_content, content_type='application/pdf')
            upload_res = self.client.post(
                f'/api/v1/documents/application/{app_id}/upload/',
                {'document_type_id': dt.id, 'file': fake_file},
                format='multipart',
            )
            self.assertIn(upload_res.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

        # Applicant is from SAME institution (is_from_another_institution = False)
        # Should succeed because Doc 6 is NOT required for internal applicants!
        submit_ok = self.client.post(f'/api/v1/applications/{app_id}/submit/')
        self.assertEqual(submit_ok.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, 'submitted')
        self.assertTrue(app.reference_number.startswith('AQXI-'))

    def test_external_applicant_requires_document_6(self):
        """When applicant is from ANOTHER institution, Doc 6 is strictly mandatory."""
        self.profile.is_from_another_institution = True
        self.profile.save()

        self.client.force_authenticate(user=self.applicant)
        app = Application.objects.create(
            applicant=self.applicant,
            examination=self.exam,
            applicant_snapshot={'is_from_another_institution': True},
            status='draft',
        )

        # Upload only docs 1-5
        pdf_content = b'%PDF-1.4 test'
        for dt in self.doc_types[:5]:
            ApplicationDocument.objects.create(
                application=app,
                document_type=dt,
                file=SimpleUploadedFile(f'{dt.code}.pdf', pdf_content, content_type='application/pdf'),
                original_filename=f'{dt.code}.pdf',
                file_size=len(pdf_content),
                mime_type='application/pdf',
                status='pending',
            )

        # Attempt to submit -> should FAIL because Doc 6 (Aloqa xati) is missing!
        submit_res = self.client.post(f'/api/v1/applications/{app.id}/submit/')
        self.assertEqual(submit_res.status_code, status.HTTP_400_BAD_REQUEST)
        missing_docs = submit_res.data.get('missing_documents') or submit_res.data.get('error', {}).get('details', {}).get('missing_documents', [])
        self.assertTrue(any('Aloqa xati' in str(doc) for doc in missing_docs))

        # Now upload Doc 6 (Aloqa xati)
        dt6 = self.doc_types[5]
        ApplicationDocument.objects.create(
            application=app,
            document_type=dt6,
            file=SimpleUploadedFile('aloqa_xati.pdf', pdf_content, content_type='application/pdf'),
            original_filename='aloqa_xati.pdf',
            file_size=len(pdf_content),
            mime_type='application/pdf',
            status='pending',
        )

        # Now submission must succeed
        submit_ok = self.client.post(f'/api/v1/applications/{app.id}/submit/')
        self.assertEqual(submit_ok.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, 'submitted')

    def test_document_review_and_correction_flow(self):
        """Test reviewer workflow: request corrections -> resubmit -> approve."""
        app = Application.objects.create(
            applicant=self.applicant,
            examination=self.exam,
            status='submitted',
        )

        # Attach documents to satisfy validate_application_documents on resubmit
        pdf_content = b'%PDF-1.4 test'
        for dt in self.doc_types[:5]:
            ApplicationDocument.objects.create(
                application=app,
                document_type=dt,
                file=SimpleUploadedFile(f'{dt.code}.pdf', pdf_content, content_type='application/pdf'),
                original_filename=f'{dt.code}.pdf',
                file_size=len(pdf_content),
                mime_type='application/pdf',
                status='pending',
            )

        # Reviewer requests corrections
        self.client.force_authenticate(user=self.reviewer)
        review_res = self.client.post(f'/api/v1/admin/applications/{app.id}/review/', {
            'action': 'request_corrections',
            'notes': 'Pasport nusxasi sifatsiz, qaytadan aniqroq qilib yuklang.',
        })
        self.assertEqual(review_res.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, 'correction_required')

        # Applicant resubmits
        self.client.force_authenticate(user=self.applicant)
        resubmit_res = self.client.post(f'/api/v1/applications/{app.id}/resubmit/')
        self.assertEqual(resubmit_res.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, 'submitted')

        # Reviewer approves
        self.client.force_authenticate(user=self.reviewer)
        approve_res = self.client.post(f'/api/v1/admin/applications/{app.id}/review/', {
            'action': 'approve',
            'notes': 'Hujjatlar to\'liq va talabga javob beradi.',
        })
        self.assertEqual(approve_res.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, 'approved')
