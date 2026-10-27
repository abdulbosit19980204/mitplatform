import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

import json
from django.test import Client
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.applications.models import Application
from apps.accounts.models import User

c_applicant = Client()
c_reviewer = Client()

print("=" * 60)
print("AQXI EXAMINATION PLATFORM - FULL WORKFLOW TEST")
print("=" * 60)

# 1. Login as Applicant
res = c_applicant.post('/api/v1/auth/login/', {'email': 'talabgor@aqxi.uz', 'password': 'Talabgor123!'}, content_type='application/json')
assert res.status_code == 200, f"Login failed: {res.status_code}"
user_data = res.json()
token = user_data['tokens']['access']
print(f"[OK] 1. Talabgor kirdi: {user_data['user']['email']}")
headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

# 2. Get 6 required document types
res_docs = c_applicant.get('/api/v1/examinations/document-types/')
docs = res_docs.json().get('results', res_docs.json())
print(f"[OK] 2. Tizimdagi majburiy hujjat turlari ({len(docs)} ta):")
for d in docs:
    print(f"     {d['sort_order']}. {d['name_uz']} ({d['code']}) [{d['accepted_formats']}]")
assert len(docs) == 6, f"Expected 6 document types, got {len(docs)}"

# 3. Get published exams
res_exams = c_applicant.get('/api/v1/examinations/')
exams = res_exams.json().get('results', res_exams.json())
assert len(exams) > 0, "No examinations found!"
target_exam = exams[0]
print(f"[OK] 3. Tanlangan imtihon: {target_exam['title']} (ID: {target_exam['id']})")

# Clear any previous test application for this exam
Application.objects.filter(applicant__email='talabgor@aqxi.uz', examination_id=target_exam['id']).delete()

# 4. Create application draft
res_app = c_applicant.post('/api/v1/applications/', json.dumps({
    'examination_id': target_exam['id'],
    'applicant_snapshot': {
        'first_name': 'Anvar',
        'last_name': 'Karimov',
        'middle_name': 'Rustamovich',
        'phone': '+998901234567',
        'jshr': '12345678901234',
        'gender': 'male',
        'education_form': 'kunduzgi',
        'current_institution': "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti",
        'specialty_code': '06.01.05',
        'scientific_field': "Qishloq xo'jaligi fanlari",
        'is_from_another_institution': False,
    }
}), content_type='application/json', **headers)
assert res_app.status_code == 201, f"Create application failed: {res_app.status_code} {res_app.content}"
app_data = res_app.json()
app_id = app_data['id']
print(f"[OK] 4. Ariza qoralamasi yaratildi: ID={app_id}, Raqam={app_data['reference_number']}")

# 5. Try submitting without documents -> must fail with 400 Bad Request
res_premature = c_applicant.post(f'/api/v1/applications/{app_id}/submit/', **headers)
assert res_premature.status_code == 400, f"Expected 400, got {res_premature.status_code}"
print("[OK] 5. Hujjatsiz topshirish bloklandi (400 Bad Request).")

# 6. Upload 5 mandatory documents
print("[OK] 6. Hujjatlarni yuklash boshlandi:")
for dt in docs[:5]:
    ext = 'pdf' if 'pdf' in dt['accepted_formats'] else 'jpg'
    content = b'%PDF-1.4 sample content' if ext == 'pdf' else b'\xff\xd8\xff\xe0\x00\x10JFIF'
    mime = 'application/pdf' if ext == 'pdf' else 'image/jpeg'
    file_obj = SimpleUploadedFile(f"file_{dt['code']}.{ext}", content, content_type=mime)
    res_up = c_applicant.post(
        f'/api/v1/documents/application/{app_id}/upload/',
        {'document_type_id': dt['id'], 'file': file_obj},
        **headers
    )
    assert res_up.status_code in [200, 201], f"Upload failed for {dt['code']}: {res_up.status_code} {res_up.content}"
    print(f"     + Yuklandi: {dt['sort_order']}. {dt['name_uz']}")

# 7. Submit application (Internal applicant: docs 1-5 uploaded -> success)
res_submit = c_applicant.post(f'/api/v1/applications/{app_id}/submit/', **headers)
assert res_submit.status_code == 200, f"Submit failed: {res_submit.status_code} {res_submit.content}"
submitted_app = res_submit.json()
print(f"[OK] 7. Ariza muvaffaqiyatli topshirildi! Holat: '{submitted_app['status']}', Raqam: {submitted_app['reference_number']}")

# 8. Reviewer reviews application and requests correction
res_rev_login = c_reviewer.post('/api/v1/auth/login/', {'email': 'reviewer@aqxi.uz', 'password': 'Reviewer123!'}, content_type='application/json')
assert res_rev_login.status_code == 200
rev_token = res_rev_login.json()['tokens']['access']
rev_headers = {'HTTP_AUTHORIZATION': f'Bearer {rev_token}'}

# Reviewer requests correction on application
res_rev_action = c_reviewer.post(f'/api/v1/admin/applications/{app_id}/review/', json.dumps({
    'action': 'request_corrections',
    'notes': 'Pasport nusxasi xira chiqqan, qayta sifatli PDF yuklang.'
}), content_type='application/json', **rev_headers)
assert res_rev_action.status_code == 200
print("[OK] 8. Komissiya a'zosi tuzatish talab qildi (correction_required).")

# 9. Applicant re-uploads corrected passport
passport_dt = next(d for d in docs if d['code'] == 'passport_copy')
new_passport = SimpleUploadedFile("passport_updated.pdf", b'%PDF-1.5 high quality scan', content_type='application/pdf')
res_reupload = c_applicant.post(
    f'/api/v1/documents/application/{app_id}/upload/',
    {'document_type_id': passport_dt['id'], 'file': new_passport},
    **headers
)
assert res_reupload.status_code in [200, 201]
print("[OK] 9. Talabgor yangilangan pasport nusxasini yukladi.")

# 10. Applicant resubmits application
res_resubmit = c_applicant.post(f'/api/v1/applications/{app_id}/resubmit/', **headers)
assert res_resubmit.status_code == 200
print("[OK] 10. Talabgor tuzatilgan arizani qayta topshirdi.")

# 11. Reviewer approves application
res_approve = c_reviewer.post(f'/api/v1/admin/applications/{app_id}/review/', json.dumps({
    'action': 'approve',
    'notes': 'Barcha hujjatlar talabga to\'liq javob beradi.'
}), content_type='application/json', **rev_headers)
assert res_approve.status_code == 200
final_app = Application.objects.get(id=app_id)
assert final_app.status == 'approved'
print(f"[OK] 11. Komissiya a'zosi arizani tasdiqladi! Yakuniy holat: '{final_app.status}'")

# ============================================================
# 12. TEST CONDITIONAL DOCUMENT 6 FOR EXTERNAL APPLICANTS
# ============================================================
print("\n" + "=" * 60)
print("TEST 2: BOSHQARUV TASHKILOTIDAN TALABGOR UCHUN 6-HUJJAT (ALOQA XATI) TEKSHIRUVI")
print("=" * 60)

# Clear applications for exam 1
exam1_id = exams[1]['id'] if len(exams) > 1 else exams[0]['id']
Application.objects.filter(applicant__email='talabgor@aqxi.uz', examination_id=exam1_id).delete()

res_ext_app = c_applicant.post('/api/v1/applications/', json.dumps({
    'examination_id': exam1_id,
    'applicant_snapshot': {
        'first_name': 'Anvar',
        'last_name': 'Karimov',
        'is_from_another_institution': True,  # EXTERNAL APPLICANT!
        'current_institution': 'Toshkent davlat agrar universiteti',
        'specialty_code': '06.01.05',
    }
}), content_type='application/json', **headers)
ext_app_id = res_ext_app.json()['id']
print(f"[OK] 12.1. Tashqi talabgor arizasi yaratildi: ID={ext_app_id}")

# Upload only documents 1-5
for dt in docs[:5]:
    ext = 'pdf' if 'pdf' in dt['accepted_formats'] else 'jpg'
    content = b'%PDF-1.4 sample content' if ext == 'pdf' else b'\xff\xd8\xff\xe0\x00\x10JFIF'
    mime = 'application/pdf' if ext == 'pdf' else 'image/jpeg'
    file_obj = SimpleUploadedFile(f"ext_{dt['code']}.{ext}", content, content_type=mime)
    c_applicant.post(
        f'/api/v1/documents/application/{ext_app_id}/upload/',
        {'document_type_id': dt['id'], 'file': file_obj},
        **headers
    )
print("[OK] 12.2. Dastlabki 5 ta hujjat yuklandi.")

# Submit -> MUST FAIL because Document 6 (Aloqa xati) is missing for external applicant!
res_ext_sub1 = c_applicant.post(f'/api/v1/applications/{ext_app_id}/submit/', **headers)
assert res_ext_sub1.status_code == 400, f"Expected 400, got {res_ext_sub1.status_code}"
missing_list = res_ext_sub1.json().get('error', {}).get('details', {}).get('missing_documents', [])
print(f"[OK] 12.3. Aloqa xatisiz topshirish to'g'ri bloklandi: {missing_list}")
assert any('Aloqa xati' in m for m in missing_list), "Document 6 was not in missing list!"

# Upload Document 6 (Aloqa xati)
doc6 = next(d for d in docs if d['code'] == 'liaison_letter')
aloqa_f = SimpleUploadedFile("aloqa_xati.pdf", b'%PDF-1.4 rasmiy aloqa xati', content_type='application/pdf')
res_up6 = c_applicant.post(
    f'/api/v1/documents/application/{ext_app_id}/upload/',
    {'document_type_id': doc6['id'], 'file': aloqa_f},
    **headers
)
assert res_up6.status_code in [200, 201]
print("[OK] 12.4. 6-hujjat (Aloqa xati) yuklandi.")

# Submit again -> MUST SUCCEED now!
res_ext_sub2 = c_applicant.post(f'/api/v1/applications/{ext_app_id}/submit/', **headers)
assert res_ext_sub2.status_code == 200, f"Submit failed: {res_ext_sub2.status_code} {res_ext_sub2.content}"
print(f"[OK] 12.5. 6 ta hujjat bilan topshirish muvaffaqiyatli yakunlandi! Status: {res_ext_sub2.json().get('status')}")

print("=" * 60)
print("BARCHA BOSQICHLAR TO'LIQ VA MUVAFFAQIYATLI O'TDI!")
print("=" * 60)
