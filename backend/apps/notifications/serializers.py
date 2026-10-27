"""
Serializers for notifications and settings app.
"""
from rest_framework import serializers
from .models import Notification, InstitutionSettings


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'body', 'is_read', 'related_application', 'created_at']
        read_only_fields = ['id', 'title', 'body', 'related_application', 'created_at']


class InstitutionSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionSettings
        fields = '__all__'
