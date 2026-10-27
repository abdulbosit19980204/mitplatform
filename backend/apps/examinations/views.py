"""
Views for examinations app.
"""
from rest_framework import generics, viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import (
    Examination,
    RequiredDocumentType,
    ExaminationRequiredDocument,
    UzbekistanOTM,
    UzbekistanSpecialty,
)
from .serializers import (
    ExaminationListSerializer,
    ExaminationDetailSerializer,
    ExaminationCreateUpdateSerializer,
    RequiredDocumentTypeSerializer,
    UzbekistanOTMSerializer,
    UzbekistanSpecialtySerializer,
)
from apps.accounts.permissions import IsAdministrator
from apps.audit.models import AuditLog


class ExaminationListView(generics.ListAPIView):
    """Public listing of published examinations."""
    permission_classes = [permissions.AllowAny]
    serializer_class = ExaminationListSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'title_uz', 'category', 'description']

    def get_queryset(self):
        qs = Examination.objects.filter(status__in=['published', 'registration_closed'])
        lang = self.request.query_params.get('language')
        if lang:
            qs = qs.filter(language=lang)
        is_open = self.request.query_params.get('is_open')
        if is_open == 'true':
            now = timezone.now()
            qs = qs.filter(status='published', registration_start__lte=now, registration_end__gte=now)
        return qs.order_by('-registration_start')


class ExaminationDetailView(generics.RetrieveAPIView):
    """Public detail of an examination."""
    permission_classes = [permissions.AllowAny]
    serializer_class = ExaminationDetailSerializer
    queryset = Examination.objects.all()


class RequiredDocumentTypeListView(generics.ListAPIView):
    """List of all available required document types."""
    permission_classes = [permissions.AllowAny]
    serializer_class = RequiredDocumentTypeSerializer
    queryset = RequiredDocumentType.objects.all().order_by('sort_order')


# Reference data views for Uzbekistan dropdowns
class UzbekistanOTMListView(generics.ListAPIView):
    """List and search Uzbekistan higher education institutions (OTM / ITM)."""
    permission_classes = [permissions.AllowAny]
    serializer_class = UzbekistanOTMSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name_uz', 'name_oz', 'name_ru', 'code', 'region']

    def get_queryset(self):
        qs = UzbekistanOTM.objects.filter(is_active=True)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(name_uz__icontains=search) |
                Q(name_oz__icontains=search) |
                Q(name_ru__icontains=search) |
                Q(code__icontains=search)
            )
        return qs.order_by('name_uz')[:100]


class UzbekistanSpecialtyListView(generics.ListAPIView):
    """List and search OAK PhD/DSc specialty codes and scientific fields."""
    permission_classes = [permissions.AllowAny]
    serializer_class = UzbekistanSpecialtySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name_uz', 'name_oz', 'name_ru', 'code', 'field']

    def get_queryset(self):
        qs = UzbekistanSpecialty.objects.filter(is_active=True)
        search = self.request.query_params.get('search')
        field = self.request.query_params.get('field')
        if field:
            qs = qs.filter(field__icontains=field)
        if search:
            qs = qs.filter(
                Q(code__icontains=search) |
                Q(name_uz__icontains=search) |
                Q(field__icontains=search)
            )
        return qs.order_by('code')[:100]


class ReferenceOptionsView(generics.GenericAPIView):
    """Static dropdown options: Ta'lim shakli, Malakaviy imtihon turlari, Fan tarmoqlari."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        education_forms = [
            {'value': 'kunduzgi', 'label_uz': 'Kunduzgi', 'label_oz': 'Кундузги', 'label_ru': 'Дневная'},
            {'value': 'sirtqi', 'label_uz': 'Sirtqi', 'label_oz': 'Сиртқи', 'label_ru': 'Заочная'},
            {'value': 'kechki', 'label_uz': 'Kechki', 'label_oz': 'Кечки', 'label_ru': 'Вечерняя'},
            {'value': 'masofaviy', 'label_uz': 'Masofaviy', 'label_oz': 'Масофавий', 'label_ru': 'Дистанционная'},
        ]

        exam_types = [
            {'value': 'english', 'label_uz': 'Ingliz tili', 'label_oz': 'Инглиз тили', 'label_ru': 'Английский язык'},
            {'value': 'german', 'label_uz': 'Nemis tili', 'label_oz': 'Немис тили', 'label_ru': 'Немецкий язык'},
            {'value': 'specialty', 'label_uz': 'Ixtisoslik fani', 'label_oz': 'Ихтисослик фани', 'label_ru': 'Специальный предмет'},
        ]

        scientific_fields = list(
            UzbekistanSpecialty.objects.exclude(field='')
            .values_list('field', flat=True)
            .distinct()
        )
        if not scientific_fields:
            scientific_fields = [
                "Qishloq xo'jaligi fanlari",
                "Biologiya fanlari",
                "Texnika fanlari",
                "Iqtisodiyot fanlari",
                "Kimyo fanlari",
                "Veterinariya fanlari",
                "Filologiya fanlari",
                "Pedagogika fanlari",
            ]

        return Response({
            'education_forms': education_forms,
            'exam_types': exam_types,
            'scientific_fields': scientific_fields,
        })


# Admin ViewSet
class AdminExaminationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdministrator]
    queryset = Examination.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ExaminationCreateUpdateSerializer
        if self.action == 'retrieve':
            return ExaminationDetailSerializer
        return ExaminationListSerializer

    def perform_create(self, serializer):
        exam = serializer.save(created_by=self.request.user)
        AuditLog.log(
            user=self.request.user,
            action='examination_created',
            target=exam,
            description=f"Yangi imtihon yaratildi: {exam.title}",
            request=self.request,
        )

    def perform_update(self, serializer):
        exam = serializer.save()
        AuditLog.log(
            user=self.request.user,
            action='examination_updated',
            target=exam,
            description=f"Imtihon tahrirlandi: {exam.title}",
            request=self.request,
        )

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        exam = self.get_object()
        exam.status = 'published'
        exam.save(update_fields=['status', 'updated_at'])
        AuditLog.log(
            user=request.user,
            action='examination_published',
            target=exam,
            description=f"Imtihon e'lon qilindi: {exam.title}",
            request=request,
        )
        return Response({'status': 'published', 'message': "Imtihon muvaffaqiyatli nashr etildi."})

    @action(detail=True, methods=['post'])
    def close_registration(self, request, pk=None):
        exam = self.get_object()
        exam.status = 'registration_closed'
        exam.save(update_fields=['status', 'updated_at'])
        AuditLog.log(
            user=request.user,
            action='examination_closed',
            target=exam,
            description=f"Imtihonga ro'yxatdan o'tish yopildi: {exam.title}",
            request=request,
        )
        return Response({'status': 'registration_closed', 'message': "Ro'yxatdan o'tish yopildi."})

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        exam = self.get_object()
        exam.status = 'archived'
        exam.save(update_fields=['status', 'updated_at'])
        AuditLog.log(
            user=request.user,
            action='examination_archived',
            target=exam,
            description=f"Imtihon arxivlandi: {exam.title}",
            request=request,
        )
        return Response({'status': 'archived', 'message': "Imtihon arxivlandi."})
