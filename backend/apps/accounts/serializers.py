"""
Serializers for accounts app.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, ApplicantProfile


class ApplicantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicantProfile
        fields = [
            'id',
            'first_name',
            'last_name',
            'middle_name',
            'gender',
            'birth_date',
            'jshr',
            'passport_series',
            'passport_number',
            'phone',
            'current_institution',
            'current_institution_code',
            'education_form',
            'specialty_code',
            'specialty_name',
            'scientific_field',
            'scientific_supervisor',
            'workplace',
            'dissertation_topic',
            'is_from_another_institution',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    profile = ApplicantProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'role', 'is_active', 'date_joined', 'profile']
        read_only_fields = ['id', 'role', 'is_active', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    middle_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'phone', 'password', 'password_confirm', 'first_name', 'last_name', 'middle_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Parollar mos kelmadi."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        middle_name = validated_data.pop('middle_name', '')

        full_name = validated_data.get('full_name', '').strip()
        if not full_name and (first_name or last_name):
            full_name = f"{last_name} {first_name} {middle_name}".strip()
            validated_data['full_name'] = full_name

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            phone=validated_data.get('phone', ''),
            role='applicant',
        )

        ApplicantProfile.objects.create(
            user=user,
            first_name=first_name or (full_name.split()[1] if len(full_name.split()) > 1 else full_name),
            last_name=last_name or (full_name.split()[0] if full_name.split() else ''),
            middle_name=middle_name or (full_name.split()[2] if len(full_name.split()) > 2 else ''),
            phone=validated_data.get('phone', ''),
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError("Email yoki parol noto'g'ri.")
            if not user.is_active:
                raise serializers.ValidationError("Hisob faolsizlantirilgan.")
            attrs['user'] = user
            return attrs
        raise serializers.ValidationError("Email va parol kiritilishi shart.")


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'role', 'is_active']
