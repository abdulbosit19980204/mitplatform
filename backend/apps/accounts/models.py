"""
User model for mitplatform.
Custom AbstractBaseUser with email as USERNAME_FIELD.
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom manager for User model."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email manzil kiritilishi shart')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser uchun is_staff=True bo\'lishi shart.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser uchun is_superuser=True bo\'lishi shart.')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model using email instead of username."""

    ROLE_CHOICES = [
        ('applicant', "Ariza beruvchi"),
        ('reviewer', "Ko'rib chiquvchi"),
        ('admin', 'Administrator'),
    ]

    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='applicant')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = 'Foydalanuvchi'
        verbose_name_plural = 'Foydalanuvchilar'

    def __str__(self):
        return f'{self.full_name} <{self.email}>'

    @property
    def is_applicant(self):
        return self.role == 'applicant'

    @property
    def is_reviewer(self):
        return self.role == 'reviewer'

    @property
    def is_admin(self):
        return self.role == 'admin'


class ApplicantProfile(models.Model):
    """Extended profile information for applicants."""

    GENDER_CHOICES = [
        ('male', 'Erkak'),
        ('female', 'Ayol'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    jshr = models.CharField(max_length=14, blank=True, verbose_name='JSHSHIR')
    passport_series = models.CharField(max_length=2, blank=True)
    passport_number = models.CharField(max_length=7, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    # Academic information
    current_institution = models.CharField(max_length=500, blank=True, verbose_name='OTM nomi')
    current_institution_code = models.CharField(max_length=20, blank=True, verbose_name='OTM kodi')
    education_form = models.CharField(max_length=50, blank=True, verbose_name="Ta'lim shakli")
    specialty_code = models.CharField(max_length=20, blank=True, verbose_name='Ixtisoslik shifri')
    specialty_name = models.CharField(max_length=500, blank=True, verbose_name='Ixtisoslik nomi')
    scientific_field = models.CharField(
        max_length=500, blank=True, verbose_name="Ilmiy daraja fan tarmog'i"
    )
    scientific_supervisor = models.CharField(
        max_length=255, blank=True, verbose_name='Ilmiy rahbar'
    )
    workplace = models.CharField(
        max_length=500, blank=True, verbose_name='Ish bajarayotgan tashkilot'
    )
    dissertation_topic = models.TextField(blank=True, verbose_name='Disertatsiya mavzusi')
    is_from_another_institution = models.BooleanField(
        default=False, verbose_name="Boshqa OTMdan"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Abituriyent profili'
        verbose_name_plural = 'Abituriyent profillari'

    def __str__(self):
        return f'{self.last_name} {self.first_name} - {self.user.email}'

    @property
    def full_name(self):
        parts = [self.last_name, self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        return ' '.join(parts)
