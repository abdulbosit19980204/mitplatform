"""
Management command to load Uzbekistan OTM and OAK specialties fixtures,
and create default required document types with UTF-8 encoding.
"""
import json
from pathlib import Path
from django.core.management.base import BaseCommand
from apps.examinations.models import RequiredDocumentType, UzbekistanOTM, UzbekistanSpecialty


class Command(BaseCommand):
    help = "Loads Uzbekistan OTM, OAK specialties, and default document types into the database"

    def handle(self, *args, **options):
        self.stdout.write("Hujjat turlari va O'zbekiston ma'lumotlari yuklanmoqda...")
        base_dir = Path(__file__).resolve().parent.parent.parent / 'fixtures'

        # 1. Required Document Types
        doc_fixture = base_dir / 'default_document_types.json'
        if doc_fixture.exists():
            with open(doc_fixture, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for item in data:
                    fields = item['fields']
                    RequiredDocumentType.objects.update_or_create(
                        code=fields['code'],
                        defaults=fields
                    )
            self.stdout.write(self.style.SUCCESS("[OK] Majburiy 6 ta hujjat turlari yuklandi"))

        # 2. Uzbekistan OTM list
        otm_fixture = base_dir / 'uzbekistan_otm.json'
        if otm_fixture.exists():
            with open(otm_fixture, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for item in data:
                    fields = item['fields']
                    UzbekistanOTM.objects.update_or_create(
                        code=fields['code'],
                        defaults=fields
                    )
            self.stdout.write(self.style.SUCCESS("[OK] O'zbekiston OTMlari ro'yxati yuklandi"))

        # 3. OAK Specialties list
        spec_fixture = base_dir / 'oak_specialties.json'
        if spec_fixture.exists():
            with open(spec_fixture, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for item in data:
                    fields = item['fields']
                    UzbekistanSpecialty.objects.update_or_create(
                        code=fields['code'],
                        defaults=fields
                    )
            self.stdout.write(self.style.SUCCESS("[OK] OAK ixtisoslik shifrlari yuklandi"))

        self.stdout.write(self.style.SUCCESS("Barcha boshlang'ich ma'lumotlar muvaffaqiyatli tayyorlandi!"))
