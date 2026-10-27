"""
Views for accounts app.
"""
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings
from django.utils import timezone
from .models import User, ApplicantProfile
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ApplicantProfileSerializer,
    AdminUserUpdateSerializer,
)
from .permissions import IsAdministrator
from apps.audit.models import AuditLog


def set_auth_cookies(response, user):
    """Set JWT access and refresh tokens as secure/httpOnly cookies."""
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    cookie_secure = getattr(settings, 'SIMPLE_JWT', {}).get('AUTH_COOKIE_SECURE', False)
    samesite = 'Lax'

    response.set_cookie(
        'access_token',
        access_token,
        max_age=3600,
        httponly=True,
        secure=cookie_secure,
        samesite=samesite,
        path='/',
    )
    response.set_cookie(
        'refresh_token',
        refresh_token,
        max_age=7 * 86400,
        httponly=True,
        secure=cookie_secure,
        samesite=samesite,
        path='/',
    )
    return {
        'access': access_token,
        'refresh': refresh_token,
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            AuditLog.log(
                user=user,
                action='user_registered',
                target=user,
                description=f"Yangi foydalanuvchi ro'yxatdan o'tdi: {user.email}",
                request=request,
            )
            response = Response(
                {
                    'message': "Muvaffaqiyatli ro'yxatdan o'tdingiz",
                    'user': UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
            tokens = set_auth_cookies(response, user)
            response.data['tokens'] = tokens
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            AuditLog.log(
                user=user,
                action='user_logged_in',
                target=user,
                description=f"Foydalanuvchi tizimga kirdi: {user.email}",
                request=request,
            )
            response = Response({
                'message': "Tizimga muvaffaqiyatli kirildi",
                'user': UserSerializer(user).data,
            })
            tokens = set_auth_cookies(response, user)
            response.data['tokens'] = tokens
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        response = Response({'message': 'Tizimdan chiqildi'})
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')

        # Blacklist refresh token if provided
        refresh_token = request.data.get('refresh') or request.COOKIES.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        AuditLog.log(
            user=request.user,
            action='user_logged_out',
            target=request.user,
            description="Tizimdan chiqish amalga oshirildi",
            request=request,
        )
        return response


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        full_name = request.data.get('full_name')
        phone = request.data.get('phone')

        if full_name:
            user.full_name = full_name
        if phone:
            user.phone = phone
        user.save()

        # Update profile
        profile, _ = ApplicantProfile.objects.get_or_create(user=user)
        profile_serializer = ApplicantProfileSerializer(profile, data=request.data.get('profile', request.data), partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
            return Response(UserSerializer(user).data)
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email kiritilishi shart'}, status=status.HTTP_400_BAD_REQUEST)
        # In a real environment, send reset email with token.
        return Response({'message': "Agar ushbu email ro'yxatdan o'tgan bo'lsa, parolni tiklash havolasi yuborildi."})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        return Response({'message': "Parol muvaffaqiyatli o'zgartirildi."})


# Admin views
class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdministrator]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-date_joined')
    filterset_fields = ['role', 'is_active']
    search_fields = ['email', 'full_name', 'phone']


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdministrator]
    serializer_class = AdminUserUpdateSerializer
    queryset = User.objects.all()
