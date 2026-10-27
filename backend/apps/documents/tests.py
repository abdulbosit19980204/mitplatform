from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.exceptions import ValidationError
from apps.documents.validators import validate_document_file, get_file_mime_type


class DocumentValidationTestCase(TestCase):

    def test_valid_pdf_file(self):
        valid_pdf = SimpleUploadedFile("ariza.pdf", b"%PDF-1.5 test document", content_type="application/pdf")
        self.assertTrue(validate_document_file(valid_pdf, allowed_formats="pdf", max_size_mb=10))

    def test_valid_image_file(self):
        valid_jpg = SimpleUploadedFile("pasport.jpg", b"\xff\xd8\xff\xe0\x00\x10JFIF", content_type="image/jpeg")
        self.assertTrue(validate_document_file(valid_jpg, allowed_formats="pdf,jpg,jpeg,png", max_size_mb=10))

    def test_fake_extension_magic_bytes_mismatch(self):
        fake_pdf = SimpleUploadedFile("fake.pdf", b"This is plain text disguised as pdf", content_type="application/pdf")
        with self.assertRaises(ValidationError) as ctx:
            validate_document_file(fake_pdf, allowed_formats="pdf", max_size_mb=10)
        self.assertIn("Fayl formati noto'g'ri", str(ctx.exception))

    def test_disallowed_extension(self):
        exe_file = SimpleUploadedFile("virus.exe", b"MZ\x90\x00", content_type="application/x-dosexec")
        with self.assertRaises(ValidationError) as ctx:
            validate_document_file(exe_file, allowed_formats="pdf", max_size_mb=10)
        self.assertIn("Ruxsat etilgan formatlar", str(ctx.exception))

    def test_file_size_exceeded(self):
        large_content = b"%PDF" + b"0" * (11 * 1024 * 1024)
        large_file = SimpleUploadedFile("large.pdf", large_content, content_type="application/pdf")
        with self.assertRaises(ValidationError) as ctx:
            validate_document_file(large_file, allowed_formats="pdf", max_size_mb=10)
        self.assertIn("Fayl hajmi 10MB dan oshmasligi kerak", str(ctx.exception))
