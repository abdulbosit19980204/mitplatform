"""
Celery asynchronous background tasks for institutional and OAK specialty synchronization.
Supports retry logic, exponential backoff, and execution metrics logging.
"""
from __future__ import annotations

import logging
from typing import Any, Dict

from celery import shared_task

from apps.examinations.services import InstitutionSyncService, OakSpecialtySyncService

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    name='apps.examinations.tasks.task_sync_institutions',
    max_retries=3,
    default_retry_delay=300,  # 5 daqiqadan so'ng qayta urinish
    acks_late=True,
)
def task_sync_institutions(self) -> Dict[str, Any]:
    """
    Celery task: O'zbekiston OTM va ITM muassasalarini sinxronizatsiya qilish.
    HEMIS va data.egov.uz dan ma'lumotlarni yangilaydi.
    """
    logger.info("Celery task_sync_institutions ishga tushdi (Task ID: %s)", self.request.id)
    try:
        service = InstitutionSyncService()
        result = service.sync()
        logger.info("task_sync_institutions muvaffaqiyatli yakunlandi: %s", result)
        return {
            "status": "success",
            "task_id": self.request.id,
            "metrics": result,
        }
    except Exception as exc:
        logger.error(
            "task_sync_institutions xatolikka uchradi (urinish %d/%d): %s",
            self.request.retries + 1,
            self.max_retries,
            str(exc),
        )
        # Xatolik yuz bersa, eksponentsial kechiktirish bilan qayta urinadi
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(
    bind=True,
    name='apps.examinations.tasks.task_sync_oak_specialties',
    max_retries=3,
    default_retry_delay=300,
    acks_late=True,
)
def task_sync_oak_specialties(self) -> Dict[str, Any]:
    """
    Celery task: Oliy attestatsiya komissiyasi (OAK) ixtisoslik shifrlari va
    fan tarmoqlarini sinxronizatsiya qilish.
    """
    logger.info("Celery task_sync_oak_specialties ishga tushdi (Task ID: %s)", self.request.id)
    try:
        service = OakSpecialtySyncService()
        result = service.sync()
        logger.info("task_sync_oak_specialties muvaffaqiyatli yakunlandi: %s", result)
        return {
            "status": "success",
            "task_id": self.request.id,
            "metrics": result,
        }
    except Exception as exc:
        logger.error(
            "task_sync_oak_specialties xatolikka uchradi (urinish %d/%d): %s",
            self.request.retries + 1,
            self.max_retries,
            str(exc),
        )
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(name='apps.examinations.tasks.task_run_all_syncs')
def task_run_all_syncs() -> Dict[str, Any]:
    """
    Kombinatsiyalangan task: Ikkala sinxronizatsiyani ketma-ket bajarish.
    Admin paneldan qo'lda 'Hozir sinxronlash' tugmasi bosilganda ham chaqirilishi mumkin.
    """
    logger.info("To'liq sinxronizatsiya boshlandi (Institutions + OAK)...")
    inst_service = InstitutionSyncService()
    oak_service = OakSpecialtySyncService()

    inst_res = inst_service.sync()
    oak_res = oak_service.sync()

    return {
        "status": "completed",
        "institutions": inst_res,
        "specialties": oak_res,
    }
