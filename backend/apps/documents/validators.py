"""
File validation utilities for uploaded documents.
Validates file size, extension, and magic bytes.
"""
from rest_framework.exceptions import ValidationError


ALLOWED_MIME_TYPES = {
    'application/pdf': [b'%PDF'],
    'image/jpeg': [b'\xff\xd8\xff', b'\xff\xd8'],
    'image/png': [b'\x89PNG\r\n', b'\x89PNG'],
}

EXTENSION_TO_MIME = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
}


def validate_document_file(file, allowed_formats='pdf', max_size_mb=10):
    """
    Validate an uploaded document file.

    Checks:
    1. File size against max_size_mb
    2. File extension against allowed_formats
    3. Magic bytes to verify actual file type
    """
    # Check size
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(
            f'Fayl hajmi {max_size_mb}MB dan oshmasligi kerak. '
            f'Joriy hajm: {file.size / (1024 * 1024):.1f}MB'
        )

    # Check extension
    ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''
    allowed_exts = [f.strip().lower() for f in allowed_formats.split(',')]
    ext_display = ext if ext else "noma'lum"
    if ext not in allowed_exts:
        raise ValidationError(
            f"Ruxsat etilgan formatlar: {allowed_formats}. "
            f"Yuklangan fayl formati: {ext_display}"
        )

    # Check magic bytes (actual file signature)
    file.seek(0)
    header = file.read(8)
    file.seek(0)

    expected_mime = EXTENSION_TO_MIME.get(ext)
    if expected_mime and expected_mime in ALLOWED_MIME_TYPES:
        valid_headers = ALLOWED_MIME_TYPES[expected_mime]
        if not any(header.startswith(h) for h in valid_headers):
            raise ValidationError(
                "Fayl formati noto'g'ri. Fayl kengaytmasi tarkib bilan mos kelmayapti."
            )

    return True


def get_file_mime_type(file):
    """Detect MIME type from magic bytes."""
    file.seek(0)
    header = file.read(8)
    file.seek(0)

    for mime_type, signatures in ALLOWED_MIME_TYPES.items():
        if any(header.startswith(sig) for sig in signatures):
            return mime_type
    return 'application/octet-stream'
