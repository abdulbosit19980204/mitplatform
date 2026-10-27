"""
Serializers for examinations app.
"""
from rest_framework import serializers
from .models import (
    Examination,
    RequiredDocumentType,
    ExaminationRequiredDocument,
    UzbekistanOTM,
    UzbekistanSpecialty,
)
from apps.scheduling.models import ExaminationSession


class RequiredDocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequiredDocumentType
        fields = [
            'id',
            'code',
            'name_uz',
            'name_oz',
            'name_ru',
            'description_uz',
            'accepted_formats',
            'max_size_mb',
            'sort_order',
        ]


class ExaminationRequiredDocumentSerializer(serializers.ModelSerializer):
    document_type = RequiredDocumentTypeSerializer(read_only=True)
    document_type_id = serializers.PrimaryKeyRelatedField(
        queryset=RequiredDocumentType.objects.all(),
        source='document_type',
        write_only=True,
    )

    class Meta:
        model = ExaminationRequiredDocument
        fields = [
            'id',
            'document_type',
            'document_type_id',
            'is_conditional',
            'condition_field',
            'is_required',
            'sort_order',
        ]


class ExaminationSessionSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExaminationSession
        fields = [
            'id',
            'name',
            'exam_date',
            'start_time',
            'end_time',
            'venue',
            'capacity',
            'is_published',
            'registered_count',
        ]


class ExaminationListSerializer(serializers.ModelSerializer):
    is_registration_open = serializers.BooleanField(read_only=True)
    registered_count = serializers.IntegerField(read_only=True)
    required_documents = ExaminationRequiredDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Examination
        fields = [
            'id',
            'title',
            'title_uz',
            'title_oz',
            'title_ru',
            'category',
            'language',
            'registration_start',
            'registration_end',
            'exam_date',
            'location',
            'capacity',
            'status',
            'is_registration_open',
            'registered_count',
            'is_foreign_language',
            'require_liaison_letter',
            'required_documents',
            'created_at',
        ]


class ExaminationDetailSerializer(serializers.ModelSerializer):
    is_registration_open = serializers.BooleanField(read_only=True)
    registered_count = serializers.IntegerField(read_only=True)
    required_documents = ExaminationRequiredDocumentSerializer(many=True, read_only=True)
    sessions = ExaminationSessionSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Examination
        fields = [
            'id',
            'title',
            'title_uz',
            'title_oz',
            'title_ru',
            'description',
            'category',
            'language',
            'registration_start',
            'registration_end',
            'exam_date',
            'location',
            'capacity',
            'eligibility_rules',
            'status',
            'is_foreign_language',
            'require_liaison_letter',
            'is_registration_open',
            'registered_count',
            'required_documents',
            'sessions',
            'created_at',
            'updated_at',
        ]


class ExaminationCreateUpdateSerializer(serializers.ModelSerializer):
    required_document_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Examination
        fields = [
            'id',
            'title',
            'title_uz',
            'title_oz',
            'title_ru',
            'description',
            'category',
            'language',
            'registration_start',
            'registration_end',
            'exam_date',
            'location',
            'capacity',
            'eligibility_rules',
            'status',
            'is_foreign_language',
            'require_liaison_letter',
            'required_document_ids',
        ]

    def validate(self, attrs):
        start = attrs.get('registration_start') or (self.instance and self.instance.registration_start)
        end = attrs.get('registration_end') or (self.instance and self.instance.registration_end)
        if start and end and start >= end:
            raise serializers.ValidationError({
                'registration_end': "Ro'yxatdan o'tish tugash vaqti boshlanish vaqtidan keyin bo'lishi shart."
            })
        return attrs

    def create(self, validated_data):
        doc_ids = validated_data.pop('required_document_ids', None)
        examination = super().create(validated_data)
        if doc_ids:
            for idx, doc_id in enumerate(doc_ids):
                try:
                    dt = RequiredDocumentType.objects.get(id=doc_id)
                    is_cond = (dt.code == 'liaison_letter')
                    ExaminationRequiredDocument.objects.create(
                        examination=examination,
                        document_type=dt,
                        is_conditional=is_cond,
                        condition_field='is_from_another_institution' if is_cond else '',
                        sort_order=idx,
                    )
                except RequiredDocumentType.DoesNotExist:
                    pass
        else:
            # Auto-attach standard 6 required document types for all examinations
            docs = RequiredDocumentType.objects.all().order_by('sort_order')
            for idx, dt in enumerate(docs):
                is_cond = (dt.code == 'liaison_letter')
                ExaminationRequiredDocument.objects.create(
                    examination=examination,
                    document_type=dt,
                    is_conditional=is_cond,
                    condition_field='is_from_another_institution' if is_cond else '',
                    sort_order=idx,
                )
        return examination


class UzbekistanOTMSerializer(serializers.ModelSerializer):
    class Meta:
        model = UzbekistanOTM
        fields = ['id', 'code', 'name_uz', 'name_oz', 'name_ru', 'region']


class UzbekistanSpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = UzbekistanSpecialty
        fields = ['id', 'code', 'name_uz', 'name_oz', 'name_ru', 'field']
