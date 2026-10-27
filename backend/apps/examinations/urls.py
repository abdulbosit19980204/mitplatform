"""
URLs for examinations app (public endpoints).
"""
from django.urls import path
from .views import (
    ExaminationListView,
    ExaminationDetailView,
    RequiredDocumentTypeListView,
)

urlpatterns = [
    path('', ExaminationListView.as_view(), name='examination_list'),
    path('<int:pk>/', ExaminationDetailView.as_view(), name='examination_detail'),
    path('document-types/', RequiredDocumentTypeListView.as_view(), name='document_type_list'),
]
