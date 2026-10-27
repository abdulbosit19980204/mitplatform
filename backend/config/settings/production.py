"""Production settings."""
from .base import *  # noqa
from decouple import config

DEBUG = False

# Security settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Update JWT for production
SIMPLE_JWT = {
    **SIMPLE_JWT,
    'AUTH_COOKIE_SECURE': True,
    'AUTH_COOKIE_SAMESITE': 'Strict',
}

# In production, media files are served by Nginx via X-Accel-Redirect
# Never expose MEDIA_ROOT directly
MEDIA_URL = '/protected/'

# WhiteNoise for static files (if not using Nginx for static)
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'

# Email in production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
