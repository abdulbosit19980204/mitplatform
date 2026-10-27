"""
Serializers for applications app.
"""
from rest_framework import serializers
from .models import Application, ApplicationStatusHistory
from apps.examinations.models import Examination, ExaminationRequiredDocument
from apps.examinations.serializers import ExaminationListSerializer, ExaminationDetailSerializer
from apps.documents.models import ApplicationDocument
from apps.documents.serializers import ApplicationDocumentSerializer


class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)

    class Meta:
        model = ApplicationStatusHistory
        fields = [
            'id',
            'from_status',
            'to_status',
            'changed_by_name',
            'reason',
            'created_at',
        ]


class ApplicationListSerializer(serializers.ModelSerializer):
    examination_title = serializers.CharField(source='examination.title', read_only=True)
    examination_language = serializers.CharField(source='examination.language', read_only=True)
    exam_date = serializers.DateTimeField(source='examination.exam_date', read_only=True)
    applicant_name = serializers.CharField(source='applicant.full_name', read_only=True)
    applicant_email = serializers.CharField(source='applicant.email', read_only=True)
    documents_count = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id',
            'reference_number',
            'examination',
            'examination_title',
            'examination_language',
            'exam_date',
            'applicant',
            'applicant_name',
            'applicant_email',
            'status',
            'submitted_at',
            'created_at',
            'updated_at',
            'documents_count',
            'correction_notes',
            'rejection_reason',
        ]

    def get_documents_count(self, obj):
        return {
            'total': obj.documents.count(),
            'approved': obj.documents.filter(status='approved').count(),
            'pending': obj.documents.filter(status='pending').count(),
            'correction_required': obj.documents.filter(status='correction_required').count(),
        }


class ApplicationDetailSerializer(serializers.ModelSerializer):
    examination = ExaminationDetailSerializer(read_only=True)
    documents = ApplicationDocumentSerializer(many=True, read_only=True)
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)
    assigned_reviewer_name = serializers.CharField(
        source='assigned_reviewer.full_name', read_only=True
    )

    class Meta:
        model = Application
        fields = [
            'id',
            'reference_number',
            'examination',
            'session',
            'applicant',
            'status',
            'applicant_snapshot',
            'assigned_reviewer',
            'assigned_reviewer_name',
            'internal_notes',
            'rejection_reason',
            'correction_notes',
            'submitted_at',
            'created_at',
            'updated_at',
            'documents',
            'status_history',
        ]
        read_only_fields = [
            'id',
            'reference_number',
            'applicant',
            'submitted_at',
            'created_at',
            'updated_at',
        ]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    examination_id = serializers.PrimaryKeyRelatedField(
        queryset=Examination.objects.all(), source='examination', write_only=True
    )

    class Meta:
        model = Application
        fields = ['id', 'reference_number', 'status', 'examination_id', 'session', 'applicant_snapshot']
        read_only_fields = ['id', 'reference_number', 'status']

    def validate_examination_id(self, examination):
        if not examination.is_registration_open:
            raise serializers.ValidationError(
                "Bu imtihonga hozirda ro'yxatdan o'tish mumkin emas (muddat tugagan yoki hali ochilmagan)."
            )
        return examination

    def create(self, validated_data):
        user = self.context['request'].user
        examination = validated_data['examination']
        new_snapshot = validated_data.get('applicant_snapshot') or {}

        # Prevent duplicate applications: update existing draft snapshot if present
        existing = Application.objects.filter(applicant=user, examination=examination).first()
        if existing:
            if new_snapshot:
                existing.applicant_snapshot = new_snapshot
                existing.save(update_fields=['applicant_snapshot', 'updated_at'])
            return existing

        # Extract snapshot from applicant profile if not provided
        profile = getattr(user, 'profile', None)
        if profile and not new_snapshot:
            new_snapshot = {
                'full_name': user.full_name,
                'email': user.email,
                'phone': profile.phone or user.phone,
                'jshr': profile.jshr,
                'gender': profile.gender,
                'birth_date': str(profile.birth_date) if profile.birth_date else '',
                'passport_series': profile.passport_series,
                'passport_number': profile.passport_number,
                'current_institution': profile.current_institution,
                'current_institution_code': profile.current_institution_code,
                'education_form': profile.education_form,
                'specialty_code': profile.specialty_code,
                'specialty_name': profile.specialty_name,
                'scientific_field': profile.scientific_field,
                'scientific_supervisor': profile.scientific_supervisor,
                'workplace': profile.workplace,
                'dissertation_topic': profile.dissertation_topic,
                'is_from_another_institution': profile.is_from_another_institution,
            }

        validated_data['applicant_snapshot'] = new_snapshot
        validated_data['applicant'] = user
        validated_data['status'] = 'draft'
        return super().create(validated_data)


class ApplicationReviewActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=['under_review', 'approve', 'request_corrections', 'reject']
    )
    notes = serializers.CharField(required=False, allow_blank=True)
    internal_notes = serializers.CharField(required=False, allow_blank=True)
    assigned_reviewer_id = serializers.IntegerField(required=False, allow_null=True)
