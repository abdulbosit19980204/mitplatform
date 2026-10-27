"""
Serializers for scheduling app.
"""
from rest_framework import serializers
from .models import ExaminationSession


class ExaminationSessionSerializer(serializers.ModelSerializer):
    registered_count = serializers.IntegerField(read_only=True)
    examination_title = serializers.CharField(source='examination.title', read_only=True)

    class Meta:
        model = ExaminationSession
        fields = [
            'id',
            'examination',
            'examination_title',
            'name',
            'exam_date',
            'start_time',
            'end_time',
            'venue',
            'capacity',
            'is_published',
            'registered_count',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'registered_count']
