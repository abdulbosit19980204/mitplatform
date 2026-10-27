"""
Custom exception handler for consistent API error responses.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent error format:
    {
        "success": false,
        "error": {
            "code": "validation_error",
            "message": "...",
            "details": {...}
        }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'success': False,
            'error': {
                'code': _get_error_code(exc),
                'message': _get_error_message(response.data),
                'details': response.data,
            }
        }
        response.data = error_data

    return response


def _get_error_code(exc):
    """Extract a machine-readable error code from the exception."""
    from rest_framework.exceptions import (
        ValidationError, AuthenticationFailed, NotAuthenticated,
        PermissionDenied, NotFound, MethodNotAllowed, Throttled,
    )
    mapping = {
        ValidationError: 'validation_error',
        AuthenticationFailed: 'authentication_failed',
        NotAuthenticated: 'not_authenticated',
        PermissionDenied: 'permission_denied',
        NotFound: 'not_found',
        MethodNotAllowed: 'method_not_allowed',
        Throttled: 'throttled',
    }
    return mapping.get(type(exc), 'server_error')


def _get_error_message(data):
    """Extract a human-readable message from error data."""
    if isinstance(data, dict):
        if 'detail' in data:
            detail = data['detail']
            return str(detail) if not isinstance(detail, list) else str(detail[0])
        # Get first error message from field errors
        for key, value in data.items():
            if isinstance(value, list) and value:
                return f"{key}: {value[0]}"
            if isinstance(value, str):
                return f"{key}: {value}"
    if isinstance(data, list) and data:
        return str(data[0])
    return str(data)
