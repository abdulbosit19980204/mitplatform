"""
Views for notifications app.
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification, InstitutionSettings
from .serializers import NotificationSerializer, InstitutionSettingsSerializer
from apps.accounts.permissions import IsAdministrator


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notif = Notification.objects.get(id=pk, recipient=request.user)
            notif.is_read = True
            notif.save(update_fields=['is_read'])
            return Response({'status': 'marked_read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Topilmadi'}, status=status.HTTP_404_NOT_FOUND)


class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all_marked_read'})


class InstitutionSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = InstitutionSettingsSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdministrator()]

    def get_object(self):
        obj, _ = InstitutionSettings.objects.get_or_create(id=1)
        return obj
