"""
Seed command to pre-populate institutional CMS data:
SiteSettings, NavigationItems, HomepageSections, FAQs, Announcements, and ContentPages.
Inspired by modern institutional design principles (SEA Journal / AQXI).
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.content.models import (
    SiteSettings,
    NavigationItem,
    HomepageSection,
    FAQItem,
    Announcement,
    ContentPage,
)


class Command(BaseCommand):
    help = "Seeds initial CMS content: SiteSettings, Navigation, Sections, FAQs, Announcements, Pages"

    def handle(self, *args, **options):
        self.stdout.write("CMS kontenti yuklanmoqda...")

        # 1. SiteSettings
        settings_obj = SiteSettings.get_settings()
        settings_obj.site_name_uz = "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti"
        settings_obj.site_name_oz = "Андижон қишлоқ хўжалиги ва агротехнологиялар институти"
        settings_obj.site_name_ru = "Андижанский институт сельского хозяйства и агротехнологий"
        settings_obj.motto_uz = "Oliy attestatsiya va malakaviy imtihonlar rasmiy portali"
        settings_obj.motto_oz = "Олий аттестация ва малакавий имтиҳонлар расмий портали"
        settings_obj.motto_ru = "Официальный портал высшей аттестации и квалификационных экзаменов"
        settings_obj.contact_email = "ilm@aqxi.uz"
        settings_obj.contact_phone = "+998 (74) 223-45-67"
        settings_obj.contact_phone_secondary = "+998 (74) 223-45-68"
        settings_obj.contact_address_uz = "Andijon viloyati, Andijon tumani, Kuyganyor qo'rg'oni, Oliygoh ko'chasi 1-uy"
        settings_obj.work_hours = "Dushanba - Shanba: 09:00 - 18:00"
        settings_obj.telegram_channel = "https://t.me/aqxi_rasmiy"
        settings_obj.official_website = "https://aqxi.uz"
        settings_obj.application_reference_prefix = "AQXI"
        settings_obj.max_upload_size_mb = 10
        settings_obj.allowed_upload_formats = "pdf,jpg,jpeg,png"
        settings_obj.enabled_languages = "uz,oz,ru"
        settings_obj.default_language = "uz"
        settings_obj.footer_copyright_uz = "© 2026 Andijon qishloq xo'jaligi va agrotexnologiyalar instituti. Barcha huquqlar himoyalangan."
        settings_obj.save()
        self.stdout.write(self.style.SUCCESS("[OK] Institut sozlamalari tayyorlandi."))

        # 2. Navigation Items
        NavigationItem.objects.all().delete()
        nav_items = [
            # Header
            ('Imtihonlar', 'Имтиҳонлар', 'Экзамены', '/imtihonlar', 'header', 1),
            ("Hujjatlar bo'yicha talablar", 'Ҳужжатлар талаблари', 'Требования к документам', '/hujjatlar', 'header', 2),
            ("Ko'p so'raladigan savollar", 'Кўп сўраладиган саволлар', 'Часто задаваемые вопросы', '/faq', 'header', 3),
            ("Bog'lanish", 'Боғланиш', 'Контакты', '/aloqa', 'header', 4),

            # Footer quick
            ("Imtihonlar jadvali", 'Имтиҳонлар жадвали', 'Расписание экзаменов', '/imtihonlar', 'footer_quick', 1),
            ("Ariza topshirish", 'Ариза топшириш', 'Подать заявку', '/ariza/yangi', 'footer_quick', 2),
            ("Talabgor kabineti", 'Талабгор кабинети', 'Кабинет соискателя', '/kabinet', 'footer_quick', 3),
            ("OAK Nizomi", 'ОАК Низоми', 'Положение ВАК', 'https://oak.uz', 'footer_quick', 4),

            # Footer legal
            ("Foydalanish qoidalari", 'Фойдаланиш қоидалари', 'Правила использования', '/hujjatlar?tab=rules', 'footer_legal', 1),
            ("Maxfiylik siyosati", 'Махфийлик сиёсати', 'Политика конфиденциальности', '/hujjatlar?tab=privacy', 'footer_legal', 2),
            ("Institut rasmiy sayti", 'Институт расмий сайти', 'Официальный сайт института', 'https://aqxi.uz', 'footer_legal', 3),
        ]
        for uz, oz, ru, url, loc, order in nav_items:
            NavigationItem.objects.create(
                title_uz=uz,
                title_oz=oz,
                title_ru=ru,
                url=url,
                location=loc,
                sort_order=order,
                is_external=url.startswith('http'),
                is_active=True,
            )
        self.stdout.write(self.style.SUCCESS("[OK] Navigatsiya menyulari yaratildi."))

        # 3. Homepage Sections
        HomepageSection.objects.all().delete()
        sections = [
            {
                'section_key': 'hero',
                'title_uz': "Imtihonlarga ro'yxatdan o'tish — sodda va qulay",
                'title_oz': "Имтиҳонларга рўйхатдан ўтиш — содда ва қулай",
                'title_ru': "Регистрация на экзамены — просто и удобно",
                'subtitle_uz': "Kerakli imtihonni tanlang, hujjatlaringizni yuboring va arizangiz holatini shaxsiy kabinetingiz orqali kuzatib boring.",
                'subtitle_oz': "Керакли имтиҳонни танланг, ҳужжатларингизни юборинг ва аризангиз ҳолатини шахсий кабинетингиз орқали кузатиб боринг.",
                'subtitle_ru': "Выберите нужный экзамен, отправьте документы и отслеживайте статус заявления через личный кабинет.",
                'badge_text_uz': "Rasmiy attestatsiya va ro'yxatdan o'tish portali",
                'button_text_uz': "Imtihonlarni ko'rish",
                'button_url': "/imtihonlar",
                'secondary_button_text_uz': "Ro'yxatdan o'tish",
                'secondary_button_url': "/ariza/yangi",
                'sort_order': 1,
                'is_active': True,
            },
            {
                'section_key': 'announcements_banner',
                'title_uz': "Muhim e'lonlar va muddatlar",
                'subtitle_uz': "Institut ilmiy bo'limi tomonidan e'lon qilingan so'nggi attestatsiya va imtihon yangiliklari",
                'sort_order': 2,
                'is_active': True,
            },
            {
                'section_key': 'workflow',
                'title_uz': "Ro'yxatdan o'tish tartibi",
                'subtitle_uz': "Malakaviy imtihonga ariza topshirish 3 ta oddiy bosqichda amalga oshiriladi",
                'content_uz': "1. Imtihon va ixtisoslikni tanlang; 2. Talab etilgan 6 ta hujjatni sifatli PDF shaklda yuklang; 3. Natija va ruxsatnomani shaxsiy kabinetda onlayn oling.",
                'sort_order': 3,
                'is_active': True,
            },
            {
                'section_key': 'documents_overview',
                'title_uz': "Topshirilishi talab etiladigan 6 ta hujjat toifasi",
                'subtitle_uz': "OAK talablariga muvofiq chet tili va mutaxassislik imtihonlari uchun zarur hujjatlar ro'yxati",
                'content_uz': "Rektor nomiga ariza, Pasport nusxasi, Obyektivka, Diplom nusxasi, Ilmiy kengash bayonnomasi/OAK byulleteni, va boshqa OTMdan qatnashuvchilar uchun Aloqa xati.",
                'button_text_uz': "To'liq talablar bilan tanishish",
                'button_url': "/hujjatlar",
                'sort_order': 4,
                'is_active': True,
            },
            {
                'section_key': 'support',
                'title_uz': "Savollaringiz bormi? Biz yordam beramiz",
                'subtitle_uz': "Institut ilmiy va doktorantura bo'limi mutaxassislari barcha savollaringizga javob berishga tayyor",
                'button_text_uz': "Bog'lanish",
                'button_url': "/aloqa",
                'sort_order': 5,
                'is_active': True,
            },
        ]
        for s in sections:
            HomepageSection.objects.create(**s)
        self.stdout.write(self.style.SUCCESS("[OK] Bosh sahifa bo'limlari tayyorlandi."))

        # 4. FAQs
        FAQItem.objects.all().delete()
        faqs = [
            (
                'registration',
                "Malakaviy imtihonlarga kimlar ro'yxatdan o'tishi mumkin?",
                "ОАК талабларига мувофиқ кимлар рўйхатдан ўтиши мумкин?",
                "Кто может зарегистрироваться на квалификационные экзамены?",
                "Oliy attestatsiya komissiyasi (OAK) talablariga muvofiq oliy ta'limdan keyingi ta'lim (PhD / DSc) institutlariga kirish va malakaviy imtihon sinovlariga tayyorlanayotgan tayanch doktorantlar, doktorantlar va mustaqil izlanuvchilar.",
                1,
            ),
            (
                'documents',
                "Hujjatlar qanday formatda va qaysi hajmda qabul qilinadi?",
                "Ҳужжатлар қандай форматда қабул қилинади?",
                "В каком формате и какого размера принимаются документы?",
                "Barcha asosiy hujjatlar sifatli PDF formatida qabul qilinadi. Pasport nusxasi uchun esa PDF, JPG, JPEG va PNG formatlariga ham ruxsat berilgan. Har bir faylning maksimal hajmi 10 MB dan oshmasligi lozim.",
                2,
            ),
            (
                'documents',
                "Aloqa xati (6-hujjat) kimlar uchun majburiy hisoblanadi?",
                "Алоқа хати кимлар учун мажбурий?",
                "Для кого обязательно письмо-ходатайство (6-й документ)?",
                "Aloqa xati faqat Andijon qishloq xo'jaligi va agrotexnologiyalar institutidan boshqa oliy ta'lim muassasasi yoki ilmiy-tadqiqot institutidan qatnashayotgan talabgorlar uchun majburiydir. Agar siz mazkur institutning o'zidan qatnashayotgan bo'lsangiz, ushbu hujjat talab etilmaydi.",
                3,
            ),
            (
                'exams',
                "Arizam holati 'Tuzatish kiritish talab etiladi' bo'lsa nima qilish kerak?",
                "Аризам ҳолати тузатиш талаб қилса нима қилиш керак?",
                "Что делать, если статус заявления 'Требуется исправление'?",
                "Shaxsiy kabinetingizga kiring, qabul komissiyasi a'zosi qoldirgan aniq izohni o'qing, ko'rsatilgan hujjatni yangilab yuklang va 'Qayta topshirish' tugmasini bosing.",
                4,
            ),
            (
                'results',
                "Imtihonga ruxsatnoma qayerdan olinadi?",
                "Имтиҳонга рухсатнома қаердан олинади?",
                "Где получить пропуск на экзамен?",
                "Arizangiz va barcha 6 ta hujjatingiz komissiya tomonidan to'liq tasdiqlangandan so'ng, shaxsiy kabinetingizda 'Ruxsatnomani chop etish' tugmasi paydo bo'ladi. Ushbu QR-kodli rasmiy ruxsatnomani qog'ozga chop etib, imtihon kuni shaxsingizni tasdiqlovchi hujjat bilan birga olib kelishingiz zarur.",
                5,
            ),
        ]
        for cat, q_uz, q_oz, q_ru, a_uz, order in faqs:
            FAQItem.objects.create(
                category=cat,
                question_uz=q_uz,
                question_oz=q_oz,
                question_ru=q_ru,
                answer_uz=a_uz,
                sort_order=order,
                is_published=True,
            )
        self.stdout.write(self.style.SUCCESS("[OK] FAQ ma'lumotlari yaratildi."))

        # 5. Announcements
        Announcement.objects.all().delete()
        now = timezone.now()
        announcements = [
            {
                'title_uz': "2026-yil bahorgi sessiya malakaviy imtihonlariga arizalar qabuli boshlandi",
                'title_oz': "2026 йил баҳорги сессия малакавий имтиҳонларига аризалар қабули бошланди",
                'title_ru': "Открыт прием заявлений на квалификационные экзамены весенней сессии 2026 года",
                'content_uz': "Chet tili (ingliz va nemis tili) hamda ixtisoslik fanlari bo'yicha ilmiy darajalar beruvchi malakaviy imtihonlarga ro'yxatdan o'tish portal orqali onlayn shaklda amalga oshirilmoqda. Talabgorlar belgilangan hujjatlarni to'liq yuklashlari shart.",
                'category': 'important',
                'badge_type': 'info',
                'is_pinned': True,
                'is_published': True,
                'published_at': now - timedelta(days=2),
            },
            {
                'title_uz': "Hujjat topshirishning oxirgi muddati: 15-may 2026-yil",
                'title_oz': "Ҳужжат топширишнинг охирги муддати: 15 май 2026 йил",
                'title_ru': "Крайний срок подачи документов: 15 мая 2026 года",
                'content_uz': "Belgilangan muddatdan keyin yuborilgan yoki yetishmayotgan hujjatlar qabul qilinmaydi. Shuningdek boshqa OTMdan qatnashayotgan talabgorlar aloqa xatini o'z vaqtida taqdim etishlari so'raladi.",
                'category': 'deadline',
                'badge_type': 'warning',
                'is_pinned': True,
                'is_published': True,
                'published_at': now - timedelta(days=1),
            },
        ]
        for ann in announcements:
            Announcement.objects.create(**ann)
        self.stdout.write(self.style.SUCCESS("[OK] E'lonlar yaratildi."))

        # 6. Content Pages
        ContentPage.objects.all().delete()
        ContentPage.objects.create(
            slug='hujjatlar-yoriqnomasi',
            title_uz="Malakaviy imtihon topshirish uchun talab etiladigan hujjatlar bo'yicha to'liq yo'riqnoma",
            lead_uz="O'zbekiston Respublikasi Oliy attestatsiya komissiyasi (OAK) nizomi talablariga muvofiq shakllantirilgan 6 ta majburiy hujjat to'g'risida ma'lumot.",
            body_html_uz="""
            <h3>1. Rektor nomiga yozilgan ariza</h3>
            <p>Institut rektori nomiga yozilgan, talabgorning imzosi qo'yilgan ariza nusxasi (sifatli skaner qilingan PDF formatda).</p>
            
            <h3>2. Pasport yoki ID-karta nusxasi</h3>
            <p>Shaxsni tasdiqlovchi fuqarolik pasporti yoki ID-kartaning asosiy sahifalari va propiska varaqasi (PDF yoki tasvir formatida).</p>
            
            <h3>3. Ma'lumotnoma (obyektivka)</h3>
            <p>Tasdiqlangan namunadagi xodim yoki izlanuvchi ma'lumotnomasi (PDF formatda).</p>
            
            <h3>4. Diplom nusxasi</h3>
            <p>Oliy ma'lumot to'g'risidagi magistrlik yoki diplomli mutaxassis diplomi va uning ilovasi nusxasi (PDF formatda).</p>
            
            <h3>5. Dissertatsiya mavzusi tasdiqlanganligi to'g'risida ko'chirma</h3>
            <p>OTM ilmiy kengash bayonnomasidan tasdiqlangan ko'chirma yoki OAK byulletenida e'lon qilingan ro'yxat nusxasi.</p>
            
            <h3>6. Aloqa xati (Tashqi talabgorlar uchun)</h3>
            <p>Talabgor Andijon qishloq xo'jaligi va agrotexnologiyalar institutidan boshqa tashkilotda ishlayotgan yoki tahsil olayotgan bo'lsa, o'z muassasasi rahbariyati tomonidan yozilgan rasmiy aloqa xati taqdim etilishi shart.</p>
            """,
            is_published=True,
        )

        self.stdout.write(self.style.SUCCESS("Barcha CMS ma'lumotlari muvaffaqiyatli tayyorlandi!"))
