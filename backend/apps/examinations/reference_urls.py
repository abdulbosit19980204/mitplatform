"""
Reference URLs for Uzbekistan Open Data dropdowns.
"""
from django.urls import path
from .views import (
    UzbekistanOTMListView,
    UzbekistanSpecialtyListView,
    ReferenceOptionsView,
)

urlpatterns = [
    path('otm/', UzbekistanOTMListView.as_view(), name='reference_otm'),
    path('specialties/', UzbekistanSpecialtyListView.as_view(), name='reference_specialties'),
    path('options/', ReferenceOptionsView.as_view(), name='reference_options'),
]
