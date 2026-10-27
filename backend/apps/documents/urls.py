"""
URLs for documents app.
"""
from django.urls import path
from .views import (
    ApplicationDocumentUploadView,
    ApplicationDocumentDeleteView,
    ApplicationDocumentDownloadView,
    DocumentReviewView,
)

urlpatterns = [
    path('application/<int:application_id>/upload/', ApplicationDocumentUploadView.as_view(), name='document_upload'),
    path('<int:pk>/delete/', ApplicationDocumentDeleteView.as_view(), name='document_delete'),
    path('<int:pk>/download/', ApplicationDocumentDownloadView.as_view(), name='document_download'),
    path('<int:pk>/review/', DocumentReviewView.as_view(), name='document_review'),
]
