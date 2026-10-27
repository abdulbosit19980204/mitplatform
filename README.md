# Andijon Qishloq Xo‘jaligi Instituti — Imtihon va Ro‘yxatdan O‘tish Platformasi

Andijon qishloq xo‘jaligi va agrotexnologiyalar instituti uchun oliy ta’limdan keyingi ta’lim (PhD / DSc) malakaviy imtihonlariga ro‘yxatdan o‘tish, talabgor arizalarini qabul qilish, 6 ta majburiy hujjatni tekshirish, imtihon jadvallarini boshqarish va komissiya a’zolari uchun administrator paneli.

---

## 🏛 Texnologik stak (Tech Stack)

### Backend
- **Python 3.12 / 3.14**, **Django 5.x**, **Django REST Framework**
- **Autentifikatsiya:** JWT (JSON Web Tokens) `httpOnly` xavfsiz cookie-lar va CSRF himoyasi bilan
- **Ma'lumotlar bazasi:** PostgreSQL (ishlab chiqishda SQLite avtomatik qo'llab-quvvatlanadi)
- **API Hujjatlari:** drf-spectacular (OpenAPI / Swagger UI `/api/docs/` va Redoc `/api/redoc/`)
- **Fayllar xavfsizligi:** Shifrlangan va xususiy katalogda saqlash (`private_media`), Magic-baytlar orqali MIME-tur va hajm tekshiruvi

### Frontend
- **Next.js 16 (App Router)** + **TypeScript** (Strict mode)
- **Tailwind CSS v4** — Institutning qat'iy ranglar tizimi:
  - Asosiy Navy (To'q ko'k): `#16324F`
  - Harakatlar uchun moviy (Blue): `#245B82`
  - Asosiy fon: `#F5F7FA`
  - Muvaffaqiyat (Success): `#16803C`
  - Ogohlantirish (Warning): `#B7791F`
  - Xatolik (Error): `#C0392B`
- **3 Tilda ishlash (i18n):** O'zbekcha lotin (birlamchi), O'zbekcha kirill, Ruscha
- **Forma va validatsiya:** React Hook Form, Zod, Lucide ikonkalari

---

## 🌐 O'zbekiston Ochiq Ma'lumotlari Integratsiyasi

Ro'yxatdan o'tish arizasi shakli O'zbekiston davlat klassifikatorlari va ochiq ma'lumotlar bazasi asosida avtomatik to'ldiriladi:
1. **Ta'lim shakli** — Kunduzgi, Sirtqi, Kechki, Masofaviy
2. **OTM yoki ITM nomi** — O'zbekiston Respublikasi Oliy ta'lim muassasalari rasmiy ro'yxati (HEMIS / data.egov.uz)
3. **Ixtisoslik shifri** — Oliy attestatsiya komissiyasi (OAK) PhD/DSc ixtisoslik shifrlari va kodlari
4. **Ilmiy daraja beradigan fan tarmog'i** — Qishloq xo'jaligi, Texnika, Biologiya, Iqtisodiyot va boshqalar
5. **Malakaviy imtihon turi** — Ingliz tili, Nemis tili, Mutaxassislik fani

---

## 📄 6 ta Majburiy Hujjat Tizimi

Chet tili (ingliz va nemis tili) malakaviy imtihonlari uchun quyidagi 6 ta hujjat toifasi talab etiladi:
1. **Rektor nomiga ariza** (PDF)
2. **Pasport nusxasi** (PDF / JPG / PNG)
3. **Ma'lumotnoma (obyektivka)** (PDF)
4. **Diplom nusxasi** (PDF)
5. **Mavzu tasdiqlanganligi haqidagi OTM ilmiy kengash bayonnomasidan ko'chirma yoki OAK byulletenida chop etilgan bo'lsa, uning nusxasi** (PDF)
6. **Aloqa xati — talabgor mazkur institutdan boshqa OTMdan qatnashsa** (PDF)

> **MUHIM SHARTLI QOIDA:** 6-hujjat (*Aloqa xati*) faqat talabgor boshqa OTM yoki ITMdan qatnashayotganda majburiydir. Agar talabgor mazkur institutning o'zidan bo'lsa, 6-hujjat talab etilmaydi va ariza 5 ta hujjat bilan muvaffaqiyatli topshiriladi.

---

## 🚀 Loyihani Ishga Tushirish (Quick Start)

### 1. Backend sozlash va ishga tushirish

```bash
cd backend

# Virtual muhit yaratish va aktivlashtirish (ixtiyoriy)
python -m venv venv
venv\Scripts\activate

# Kerakli kutubxonalarni o'rnatish
pip install -r requirements.txt

# Migratsiyalarni amalga oshirish
python manage.py migrate

# O'zbekiston OTMlari, OAK ixtisosliklari va 6 ta hujjat turini yuklash
python manage.py load_uz_data

# Demo ma'lumotlarni (foydalanuvchilar va namunaviy imtihonlarni) yuklash
python manage.py seed_demo_data

# Serverni ishga tushirish
python manage.py runserver 0.0.0.0:8000
```

Backend manzili: `http://localhost:8000`  
Swagger API hujjatlari: `http://localhost:8000/api/docs/`

---

### 2. Frontend sozlash va ishga tushirish

```bash
cd frontend

# Bog'liqliklarni o'rnatish
npm install

# Ishlab chiqish rejimida ishga tushirish
npm run dev

# Yoki production uchun yig'ish va ishga tushirish
npm run build
npm start
```

Frontend manzili: `http://localhost:3000`

---

## 👥 Demo Hisoblar (Testlash uchun)

Tizimda rollar bo'yicha tayyor foydalanuvchilar mavjud:

| Rol | Email | Parol | Huquqlari |
|---|---|---|---|
| **Administrator** | `admin@aqxi.uz` | `Admin123!` | Imtihonlar yaratish, arizalarni tasdiqlash/rad etish, audit, hisobotlar |
| **Ko'rib chiquvchi** | `reviewer@aqxi.uz` | `Reviewer123!` | Arizalarni tekshirish, hujjatlarni tasdiqlash, tuzatish talab qilish |
| **Abituriyent** | `talabgor@aqxi.uz` | `Talabgor123!` | Imtihonga ariza topshirish, hujjat yuklash, holatni kuzatish |

---

## 🧪 Avtomatlashtirilgan Testlar

Backend testlarini ishga tushirish:

```bash
cd backend
python manage.py test apps.applications.tests
```

Sinovdan o'tkazilgan holatlar:
- Foydalanuvchi ro'yxatdan o'tishi va JWT autentifikatsiyasi
- Rollarga asoslangan ruxsatlar (Abituriyent administrator bo'limiga kira olmasligi)
- 6-hujjatning shartli (conditional) talab qilinishi:
  - O'z institutidan qatnashganda 5 ta hujjat bilan muvaffaqiyatli topshirish
  - Boshqa OTMdan qatnashganda 6-hujjat majburiy bo'lishi va hujjatsiz rad etilishi
- Hujjatlar tekshiruvi: Ko'rib chiquvchi tomonidan tuzatish talab qilinishi va qayta topshirish
- Ariza to'liq tasdiqlanishi

---

## 🐳 Docker bilan ishga tushirish

```bash
docker-compose up --build -d
```
Tizim PostgreSQL 16, Django REST Framework va Next.js konteynerlarini avtomatik ishga tushiradi.
