"""
Serializers for documents app.
"""
from rest_framework import serializers
from .models import ApplicationDocument, DocumentReview
from apps.examinations.serializers import RequiredDocumentTypeSerializer
from apps.examinations.models import RequiredDocumentType


class DocumentReviewSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True)

    class Meta:
        model = DocumentReview
        fields = ['id', 'decision', 'comments', 'reviewed_by_name', 'created_at']


class ApplicationDocumentSerializer(serializers.ModelSerializer):
    document_type = RequiredDocumentTypeSerializer(read_only=True)
    document_type_code = serializers.CharField(source='document_type.code', read_only=True)
    document_type_name = serializers.CharField(source='document_type.name_uz', read_only=True)
    download_url = serializers.SerializerMethodField()
    reviews = DocumentReviewSerializer(many=True, read_only=True)

    class Meta:
        model = ApplicationDocument
        fields = [
            'id',
            'application',
            'document_type',
            'document_type_code',
            'document_type_name',
            'original_filename',
            'file_size',
            'mime_type',
            'status',
            'download_url',
            'reviews',
            'uploaded_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'original_filename', 'file_size', 'mime_type', 'status', 'uploaded_at']

    def get_download_url(self, obj):
        request = self.context.get('request')
        url = f"/api/v1/documents/{obj.id}/download/"
        if request:
            return request.build_absolute_uri(url)
        return url


class DocumentUploadSerializer(serializers.Serializer):
    document_type_id = serializers.PrimaryKeyRelatedField(
        queryset=RequiredDocumentType.objects.all(), source='document_type'
    )
    file = serializers.FileField()


class DocumentReviewActionSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=['approved', 'correction_required'])
    comments = serializers.CharField(required=False, allow_blank=True)
