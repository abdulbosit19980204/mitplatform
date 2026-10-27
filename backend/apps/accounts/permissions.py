"""
Custom permission classes for role-based access control.
"""
from rest_framework.permissions import BasePermission, IsAuthenticated


class IsApplicant(BasePermission):
    """Allow access only to users with 'applicant' role."""
    message = "Faqat abituriyentlar uchun ruxsat etilgan."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'applicant'
        )


class IsReviewer(BasePermission):
    """Allow access only to users with 'reviewer' role."""
    message = "Faqat ko'rib chiquvchilar uchun ruxsat etilgan."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('reviewer', 'admin')
        )


class IsAdministrator(BasePermission):
    """Allow access only to users with 'admin' role."""
    message = "Faqat administratorlar uchun ruxsat etilgan."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow access if user owns the object or is admin/reviewer."""
    message = "Siz bu ob'ektga kirish huquqiga ega emassiz."

    def has_object_permission(self, request, view, obj):
        if request.user.role in ('admin', 'reviewer'):
            return True
        # Check ownership on common patterns
        if hasattr(obj, 'applicant'):
            return obj.applicant == request.user
        if hasattr(obj, 'recipient'):
            return obj.recipient == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
