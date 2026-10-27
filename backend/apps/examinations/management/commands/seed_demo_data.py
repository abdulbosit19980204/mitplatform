"""
Seed demo data: users (admin, reviewer, applicant), examinations, sessions.
"""
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User, ApplicantProfile
from apps.examinations.models import (
    Examination,
    RequiredDocumentType,
    ExaminationRequiredDocument,
)
from apps.scheduling.models import ExaminationSession
from apps.notifications.models import InstitutionSettings


class Command(BaseCommand):
    help = "Seeds initial demo users, examinations, sessions, and settings"

    def handle(self, *args, **options):
        # 1. Institution settings
        settings_obj, _ = InstitutionSettings.objects.get_or_create(id=1)
        settings_obj.site_name_uz = "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti"
        settings_obj.contact_email = "qabul@aqxi.uz"
        settings_obj.contact_phone = "+998 74 223 45 67"
        settings_obj.contact_address = "Andijon viloyati, Andijon tumani, Kuyganyor shaharchasi"
        settings_obj.save()

        # 2. Users
        # Admin
        admin_user, _ = User.objects.get_or_create(
            email='admin@aqxi.uz',
            defaults={
                'full_name': 'Administrator (Boshqaruvchi)',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('Admin123!')
        admin_user.save()

        # Reviewer
        reviewer_user, _ = User.objects.get_or_create(
            email='reviewer@aqxi.uz',
            defaults={
                'full_name': 'Komissiya a\'zosi (Mas\'ul xodim)',
                'role': 'reviewer',
                'is_staff': True,
            }
        )
        reviewer_user.set_password('Reviewer123!')
        reviewer_user.save()

        # Applicant
        applicant_user, _ = User.objects.get_or_create(
            email='talabgor@aqxi.uz',
            defaults={
                'full_name': 'Karimov Anvar Rustamovich',
                'phone': '+998901234567',
                'role': 'applicant',
            }
        )
        applicant_user.set_password('Talabgor123!')
        applicant_user.save()

        # Profile for applicant
        ApplicantProfile.objects.get_or_create(
            user=applicant_user,
            defaults={
                'first_name': 'Anvar',
                'last_name': 'Karimov',
                'middle_name': 'Rustamovich',
                'gender': 'male',
                'jshr': '12345678901234',
                'passport_series': 'AA',
                'passport_number': '1234567',
                'phone': '+998901234567',
                'current_institution': "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti",
                'current_institution_code': 'AQXI',
                'education_form': 'kunduzgi',
                'specialty_code': '06.01.05',
                'specialty_name': "Seleksiya va urug'chilik",
                'scientific_field': "Qishloq xo'jaligi fanlari",
                'scientific_supervisor': 'Prof. Olimov B.K.',
                'workplace': 'AQXI Seleksiya kafedrasi',
                'dissertation_topic': "G'o'zaning yangi navlarini yetishtirish agrotexnologiyasi",
                'is_from_another_institution': False,
            }
        )

        # 3. Examinations
        now = timezone.now()
        doc_types = list(RequiredDocumentType.objects.all().order_by('sort_order'))

        # Exam 1: English qualification exam (Foreign language -> 6 documents)
        exam_en, created_en = Examination.objects.get_or_create(
            title="Ingliz tili bo'yicha malakaviy imtihon (PhD / DSc)",
            defaults={
                'title_uz': "Ingliz tili bo'yicha malakaviy imtihon (PhD / DSc)",
                'title_oz': "Инглиз тили бўйича малакавий имтиҳон (PhD / DSc)",
                'title_ru': "Квалификационный экзамен по английскому языку (PhD / DSc)",
                'description': "Oliy ta'limdan keyingi ta'lim institutlariga kirish va malakaviy imtihonlar uchun ingliz tili bo'yicha maxsus sinov.",
                'category': 'Chet tili',
                'language': 'en',
                'registration_start': now - timedelta(days=2),
                'registration_end': now + timedelta(days=20),
                'exam_date': now + timedelta(days=25),
                'location': "AQXI Bosh binosi, 204-auditoriya",
                'capacity': 100,
                'status': 'published',
                'is_foreign_language': True,
                'require_liaison_letter': False,
                'created_by': admin_user,
            }
        )

        # Attach 6 documents with Document 6 being conditional
        for dt in doc_types:
            is_cond = (dt.code == 'liaison_letter')
            ExaminationRequiredDocument.objects.get_or_create(
                examination=exam_en,
                document_type=dt,
                defaults={
                    'is_conditional': is_cond,
                    'condition_field': 'is_from_another_institution' if is_cond else '',
                    'is_required': True,
                    'sort_order': dt.sort_order,
                }
            )

        # Exam 2: German qualification exam
        exam_de, created_de = Examination.objects.get_or_create(
            title="Nemis tili bo'yicha malakaviy imtihon (PhD / DSc)",
            defaults={
                'title_uz': "Nemis tili bo'yicha malakaviy imtihon (PhD / DSc)",
                'title_oz': "Немис тили бўйича малакавий имтиҳон (PhD / DSc)",
                'title_ru': "Квалификационный экзамен по немецкому языку (PhD / DSc)",
                'description': "Ilmiy izlanuvchilar va doktorantlar uchun nemis tili bo'yicha malakaviy imtihon sinovi.",
                'category': 'Chet tili',
                'language': 'de',
                'registration_start': now - timedelta(days=1),
                'registration_end': now + timedelta(days=15),
                'exam_date': now + timedelta(days=18),
                'location': "AQXI Axborot-resurs markazi, 1-zal",
                'capacity': 50,
                'status': 'published',
                'is_foreign_language': True,
                'require_liaison_letter': False,
                'created_by': admin_user,
            }
        )

        for dt in doc_types:
            is_cond = (dt.code == 'liaison_letter')
            ExaminationRequiredDocument.objects.get_or_create(
                examination=exam_de,
                document_type=dt,
                defaults={
                    'is_conditional': is_cond,
                    'condition_field': 'is_from_another_institution' if is_cond else '',
                    'is_required': True,
                    'sort_order': dt.sort_order,
                }
            )

        # 4. Examination Sessions
        ExaminationSession.objects.get_or_create(
            examination=exam_en,
            name="1-guruh (Ertalabki sessiya)",
            exam_date=(now + timedelta(days=25)).date(),
            start_time='09:00:00',
            end_time='12:00:00',
            defaults={
                'venue': "AQXI Bosh binosi, 204-xona",
                'capacity': 50,
                'is_published': True,
            }
        )
        ExaminationSession.objects.get_or_create(
            examination=exam_en,
            name="2-guruh (Tushdan keyingi sessiya)",
            exam_date=(now + timedelta(days=25)).date(),
            start_time='14:00:00',
            end_time='17:00:00',
            defaults={
                'venue': "AQXI Bosh binosi, 204-xona",
                'capacity': 50,
                'is_published': True,
            }
        )

        self.stdout.write(self.style.SUCCESS("Demo ma'lumotlar yaratildi:"))
        self.stdout.write(f"- Admin: admin@aqxi.uz / Admin123!")
        self.stdout.write(f"- Reviewer: reviewer@aqxi.uz / Reviewer123!")
        self.stdout.write(f"- Applicant: talabgor@aqxi.uz / Talabgor123!")
