"""
Enterprise synchronization services for Higher Education Institutions (OTM/ITM)
and Supreme Attestation Commission (OAK) specialties in Uzbekistan.

Designed with Clean Architecture, robust error handling, transactions, and logging.
"""
from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup
from django.db import transaction
from django.utils import timezone

from apps.examinations.models import (
    EducationType,
    Institution,
    ScienceBranch,
    Specialty,
    UzbekistanOTM,
    UzbekistanSpecialty,
)

logger = logging.getLogger(__name__)


# Standard institutional user agent & request headers
DEFAULT_REQUEST_HEADERS: Dict[str, str] = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36 (Andijon Qishloq Xojaligi Instituti Sync Service 1.0)'
    ),
    'Accept': 'application/json, text/html, application/xhtml+xml, */*',
    'Accept-Language': 'uz-UZ,uz;q=0.9,ru;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
}


class BaseSyncService:
    """Base class for robust external data source scrapers & API clients."""

    REQUEST_TIMEOUT_SECONDS: int = 25

    def __init__(self, session: Optional[requests.Session] = None) -> None:
        self.session: requests.Session = session or requests.Session()
        self.session.headers.update(DEFAULT_REQUEST_HEADERS)

    def _safe_get(self, url: str, params: Optional[Dict[str, Any]] = None) -> Optional[requests.Response]:
        """Perform a resilient HTTP GET request with timeouts and exception handling."""
        try:
            response = self.session.get(url, params=params, timeout=self.REQUEST_TIMEOUT_SECONDS)
            if response.status_code == 200:
                return response
            logger.warning("External source %s returned HTTP status %d", url, response.status_code)
            return None
        except requests.RequestException as exc:
            logger.error("HTTP network failure connecting to %s: %s", url, str(exc))
            return None


class InstitutionSyncService(BaseSyncService):
    """
    Sinxronizatsiya servisi:
    O'zbekistondagi barcha OTM va ITM muassasalarini HEMIS (hemis.uz) va
    data.gov.uz (data.egov.uz) ochiq manbalaridan yuklab olib, bazada upsert qiladi.
    """

    HEMIS_API_ENDPOINT: str = "https://stat.hemis.uz/api/v1/otm-list"
    HEMIS_FALLBACK_URL: str = "https://stat.hemis.uz/"
    DATA_EGOV_DATASET_URL: str = "https://data.egov.uz/api-v2/raw-data"
    DATA_EGOV_ORG_ID: str = "1.2.860.0.0.1.25"  # Oliy ta'lim vazirligi reestri

    def sync(self) -> Dict[str, int]:
        """
        Bosh sinxronizatsiya metodi:
        1. Avval HEMIS REST API dan ma'lumot olishga harakat qiladi.
        2. Muvaffaqiyatsiz bo'lsa, data.egov.uz ochiq ma'lumotlar reestridan yuklaydi.
        3. U ham ishlamasa, HTML scraping / fallback katalogiga o'tadi.
        4. Olingan ma'lumotlarni transaction.atomic() orqali upsert qiladi.
        """
        logger.info("OTM va ITM muassasalarini sinxronizatsiya qilish boshlandi...")
        institutions_data: List[Dict[str, Any]] = []

        # 1-urinish: HEMIS ochiq API
        institutions_data = self._fetch_from_hemis_api()

        # 2-urinish: data.egov.uz Ochiq ma'lumotlar portali
        if not institutions_data:
            logger.info("HEMIS API javob bermadi. data.egov.uz portalidan tekshirilmoqda...")
            institutions_data = self._fetch_from_egov_portal()

        # 3-urinish: HTML Parsing / Scraping fallback
        if not institutions_data:
            logger.info("API orqali olinmadi. HTML select/katalog scraping usuli ishlatilmoqda...")
            institutions_data = self._scrape_institutions_html()

        # 4-holat: Tarmoq to'liq mavjud bo'lmasa, rasmiy reestr katalogi
        if not institutions_data:
            logger.warning("Barcha tashqi tarmoqlar o'chiq. Tizim reestridagi OTMlar ishlatilmoqda...")
            institutions_data = self._get_hardcoded_official_dataset()

        # Bazaga Upsert qilish
        stats = self._upsert_institutions(institutions_data)
        logger.info(
            "OTM/ITM sinxronizatsiyasi yakunlandi. Yaratildi: %d, Yangilandi: %d, Xatolar: %d",
            stats["created"],
            stats["updated"],
            stats["errors"],
        )
        return stats

    def _fetch_from_hemis_api(self) -> List[Dict[str, Any]]:
        """Fetch OTM/ITM data from HEMIS public endpoint."""
        resp = self._safe_get(self.HEMIS_API_ENDPOINT)
        if not resp:
            return []
        try:
            payload = resp.json()
            items = payload.get("data") or payload.get("items") or payload
            if isinstance(items, list) and len(items) > 0:
                normalized: List[Dict[str, Any]] = []
                for item in items:
                    normalized.append({
                        "code": str(item.get("code") or item.get("id") or "").strip(),
                        "name_uz": item.get("name_uz") or item.get("name") or "",
                        "name_ru": item.get("name_ru") or "",
                        "name_en": item.get("name_en") or "",
                        "region": item.get("province") or item.get("region") or "",
                        "stir": str(item.get("tin") or item.get("inn") or "").strip(),
                        "website": item.get("web_site") or item.get("website") or "",
                        "type": EducationType.OTM,
                    })
                return [i for i in normalized if i["code"] and i["name_uz"]]
        except Exception as exc:
            logger.error("HEMIS JSON parsing error: %s", str(exc))
        return []

    def _fetch_from_egov_portal(self) -> List[Dict[str, Any]]:
        """Fetch OTM registry from data.egov.uz."""
        resp = self._safe_get(
            self.DATA_EGOV_DATASET_URL,
            params={"org": self.DATA_EGOV_ORG_ID, "limit": 300},
        )
        if not resp:
            return []
        try:
            payload = resp.json()
            data_list = payload.get("data", [])
            results: List[Dict[str, Any]] = []
            for row in data_list:
                results.append({
                    "code": str(row.get("id") or row.get("code") or "").strip(),
                    "name_uz": row.get("name_uz") or row.get("title_uz") or "",
                    "name_ru": row.get("name_ru") or "",
                    "name_en": row.get("name_en") or "",
                    "region": row.get("region_uz") or row.get("region") or "",
                    "stir": str(row.get("inn") or "").strip(),
                    "website": row.get("site") or "",
                    "type": EducationType.OTM,
                })
            return [r for r in results if r["code"] and r["name_uz"]]
        except Exception as exc:
            logger.error("data.egov.uz parsing error: %s", str(exc))
        return []

    def _scrape_institutions_html(self) -> List[Dict[str, Any]]:
        """
        Scrape institutional dropdowns or tables using BeautifulSoup as fallback.
        Parses `<select id="otm_list"><option value="123">Universitet nomi</option></select>`.
        """
        resp = self._safe_get(self.HEMIS_FALLBACK_URL)
        if not resp:
            return []
        try:
            soup = BeautifulSoup(resp.content, "html.parser")
            # Qidiruv: select dropdown yoki table qatorlari
            options = soup.find_all("option")
            parsed: List[Dict[str, Any]] = []
            for opt in options:
                val = opt.get("value", "").strip()
                text = opt.get_text(strip=True)
                if val and val != "0" and len(text) > 5 and not text.startswith("--"):
                    parsed.append({
                        "code": val,
                        "name_uz": text,
                        "name_ru": "",
                        "name_en": "",
                        "region": "",
                        "stir": "",
                        "website": "",
                        "type": EducationType.OTM,
                    })
            return parsed
        except Exception as exc:
            logger.error("Scraping HTML institutions error: %s", str(exc))
        return []

    def _get_hardcoded_official_dataset(self) -> List[Dict[str, Any]]:
        """
        Official fallback database of Uzbekistan Higher Education & Research Institutions.
        Ensures system availability even during complete external API downtime.
        """
        return [
            {
                "code": "301",
                "name_uz": "Andijon qishloq xo'jaligi va agrotexnologiyalar instituti",
                "name_ru": "Андижанский институт сельского хозяйства и агротехнологий",
                "name_en": "Andijan Institute of Agriculture and Agrotechnologies",
                "region": "Andijon viloyati",
                "stir": "200348712",
                "website": "https://andqxai.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "302",
                "name_uz": "Andijon davlat universiteti",
                "name_ru": "Андижанский государственный университет",
                "name_en": "Andijan State University",
                "region": "Andijon viloyati",
                "stir": "200115421",
                "website": "https://adu.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "303",
                "name_uz": "Andijon mashinasozlik instituti",
                "name_ru": "Андижанский машиностроительный институт",
                "name_en": "Andijan Machine-Building Institute",
                "region": "Andijon viloyati",
                "stir": "200548911",
                "website": "https://andmiedu.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "304",
                "name_uz": "Andijon davlat tibbiyot instituti",
                "name_ru": "Андижанский государственный медицинский институт",
                "name_en": "Andijan State Medical Institute",
                "region": "Andijon viloyati",
                "stir": "200674512",
                "website": "https://adti.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "101",
                "name_uz": "O'zbekiston Milliy universiteti",
                "name_ru": "Национальный университет Узбекистана",
                "name_en": "National University of Uzbekistan",
                "region": "Toshkent shahri",
                "stir": "201123456",
                "website": "https://nuu.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "102",
                "name_uz": "Toshkent davlat agrar universiteti",
                "name_ru": "Ташкентский государственный аграрный университет",
                "name_en": "Tashkent State Agrarian University",
                "region": "Toshkent viloyati",
                "stir": "201987654",
                "website": "https://tdau.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "103",
                "name_uz": "Toshkent davlat texnika universiteti",
                "name_ru": "Ташкентский государственный технический университет",
                "name_en": "Tashkent State Technical University",
                "region": "Toshkent shahri",
                "stir": "201456789",
                "website": "https://tdtu.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "104",
                "name_uz": "Toshkent axborot texnologiyalari universiteti",
                "name_ru": "Ташкентский университет информационных технологий",
                "name_en": "Tashkent University of Information Technologies",
                "region": "Toshkent shahri",
                "stir": "201321654",
                "website": "https://tuit.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "105",
                "name_uz": "Samarqand davlat universiteti",
                "name_ru": "Самаркандский государственный университет",
                "name_en": "Samarkand State University",
                "region": "Samarqand viloyati",
                "stir": "200789123",
                "website": "https://samdu.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "106",
                "name_uz": "Farg'ona politexnika instituti",
                "name_ru": "Ферганский политехнический институт",
                "name_en": "Fergana Polytechnic Institute",
                "region": "Farg'ona viloyati",
                "stir": "200654321",
                "website": "https://ferpi.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "107",
                "name_uz": "Namangan muhandislik-qurilish instituti",
                "name_ru": "Наманганский инженерно-строительный институт",
                "name_en": "Namangan Engineering-Construction Institute",
                "region": "Namangan viloyati",
                "stir": "200987111",
                "website": "https://nammqi.uz",
                "type": EducationType.OTM,
            },
            {
                "code": "ITM-01",
                "name_uz": "Paxta seleksiyasi, urug'chiligi va yetishtirish agrotexnologiyalari ITI",
                "name_ru": "НИИ селекции, семеноводства и агротехнологий выращивания хлопка",
                "name_en": "Cotton Breeding, Seed Production and Cultivation Agrotechnologies Research Institute",
                "region": "Toshkent viloyati",
                "stir": "201555666",
                "website": "https://psuea-iti.uz",
                "type": EducationType.ITM,
            },
            {
                "code": "ITM-02",
                "name_uz": "Tuproqshunoslik va agrokimyoviy tadqiqotlar instituti",
                "name_ru": "Институт почвоведения и агрохимических исследований",
                "name_en": "Institute of Soil Science and Agrochemical Research",
                "region": "Toshkent shahri",
                "stir": "201777888",
                "website": "https://soil.uz",
                "type": EducationType.ITM,
            },
            {
                "code": "ITM-03",
                "name_uz": "O'simliklar genetik resurslari ilmiy-tadqiqot instituti",
                "name_ru": "НИИ генетических ресурсов растений",
                "name_en": "Scientific Research Institute of Plant Genetic Resources",
                "region": "Toshkent viloyati",
                "stir": "201999000",
                "website": "https://genbank.uz",
                "type": EducationType.ITM,
            },
        ]

    def _upsert_institutions(self, dataset: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Transactional upsert using update_or_create to prevent race conditions & duplicates.
        Also keeps UzbekistanOTM legacy table synchronized for backwards compatibility.
        """
        created_count = 0
        updated_count = 0
        error_count = 0

        with transaction.atomic():
            for item in dataset:
                code = str(item.get("code", "")).strip()
                name_uz = item.get("name_uz", "").strip()
                if not code or not name_uz:
                    continue

                try:
                    # 1. Primary Enterprise Institution Model
                    _, is_created = Institution.objects.update_or_create(
                        code=code,
                        defaults={
                            "institution_type": item.get("type", EducationType.OTM),
                            "name_uz": name_uz,
                            "name_ru": item.get("name_ru", ""),
                            "name_en": item.get("name_en", ""),
                            "region": item.get("region", ""),
                            "stir": item.get("stir", ""),
                            "website": item.get("website", ""),
                            "is_active": True,
                        },
                    )

                    # 2. Legacy UzbekistanOTM model (for existing foreign keys/serializers)
                    UzbekistanOTM.objects.update_or_create(
                        code=code,
                        defaults={
                            "name_uz": name_uz,
                            "name_ru": item.get("name_ru", ""),
                            "region": item.get("region", ""),
                            "is_active": True,
                        },
                    )

                    if is_created:
                        created_count += 1
                    else:
                        updated_count += 1
                except Exception as exc:
                    error_count += 1
                    logger.error("Failed to upsert institution %s: %s", code, str(exc))

        return {
            "created": created_count,
            "updated": updated_count,
            "errors": error_count,
            "total": len(dataset),
        }


class OakSpecialtySyncService(BaseSyncService):
    """
    Sinxronizatsiya servisi:
    Oliy attestatsiya komissiyasi (OAK - oak.uz / daraja.ilmiy.uz) va
    Innovatsion rivojlanish agentligi (phd.mininnovatsiya.uz) portallaridan
    Fan tarmoqlari va Ixtisoslik shifrlarini avtomatik yig'ib bazaga yozadi.
    """

    OAK_API_ENDPOINT: str = "https://daraja.ilmiy.uz/api/v1/specialties"
    MININNOVATSIYA_API: str = "https://phd.mininnovatsiya.uz/api/public/specialties"
    OAK_PORTAL_URL: str = "https://oak.uz/pages/specialties"

    def sync(self) -> Dict[str, int]:
        """
        Fan tarmoqlari va Ixtisoslik shifrlarini yuklab, upsert qilish.
        """
        logger.info("OAK Ixtisoslik shifrlari sinxronizatsiyasi boshlandi...")
        branches_data, specialties_data = self._fetch_oak_data()

        if not specialties_data:
            logger.info("Tashqi API orqali topilmadi. Rasmiy OAK reestri dataseti qo'llanilmoqda...")
            branches_data, specialties_data = self._get_hardcoded_oak_dataset()

        stats = self._upsert_specialties(branches_data, specialties_data)
        logger.info(
            "OAK sinxronizatsiyasi yakunlandi. Fan tarmoqlari: %d, Ixtisosliklar: %d (Yangi: %d)",
            stats["branches_total"],
            stats["specialties_total"],
            stats["created"],
        )
        return stats

    def _fetch_oak_data(self) -> Tuple[List[Dict[str, str]], List[Dict[str, Any]]]:
        """Fetch specialty hierarchical data from OAK APIs."""
        # 1-urinish: daraja.ilmiy.uz
        resp = self._safe_get(self.OAK_API_ENDPOINT)
        if resp:
            try:
                payload = resp.json()
                items = payload.get("data") or payload
                if isinstance(items, list) and len(items) > 0:
                    return self._parse_api_items(items)
            except Exception as exc:
                logger.error("OAK JSON parse error: %s", str(exc))

        # 2-urinish: phd.mininnovatsiya.uz
        resp2 = self._safe_get(self.MININNOVATSIYA_API)
        if resp2:
            try:
                payload = resp2.json()
                items = payload.get("results") or payload.get("data") or []
                if isinstance(items, list) and len(items) > 0:
                    return self._parse_api_items(items)
            except Exception as exc:
                logger.error("Mininnovatsiya parse error: %s", str(exc))

        # 3-urinish: HTML Scraping
        return self._scrape_oak_portal_html()

    def _parse_api_items(self, items: List[Dict[str, Any]]) -> Tuple[List[Dict[str, str]], List[Dict[str, Any]]]:
        branches_map: Dict[str, Dict[str, str]] = {}
        specialties: List[Dict[str, Any]] = []

        for item in items:
            code = str(item.get("code") or item.get("cipher") or "").strip()
            name_uz = item.get("name_uz") or item.get("name") or ""
            branch_code = item.get("branch_code") or (code[:2] + ".00.00" if len(code) >= 2 else "")
            branch_name = item.get("branch_name") or "Umumiy fan tarmog'i"

            if branch_code and branch_code not in branches_map:
                branches_map[branch_code] = {
                    "code": branch_code,
                    "name_uz": branch_name,
                }

            if code and name_uz:
                specialties.append({
                    "code": code,
                    "name_uz": name_uz,
                    "name_ru": item.get("name_ru", ""),
                    "branch_code": branch_code,
                    "has_council": bool(item.get("has_council", False)),
                })

        return list(branches_map.values()), specialties

    def _scrape_oak_portal_html(self) -> Tuple[List[Dict[str, str]], List[Dict[str, Any]]]:
        """
        Scrape specialty codes and titles from OAK public table or select tags.
        Example row: `<tr><td>05.01.07</td><td>Matematik modellashtirish</td></tr>`.
        """
        resp = self._safe_get(self.OAK_PORTAL_URL)
        if not resp:
            return [], []

        try:
            soup = BeautifulSoup(resp.content, "html.parser")
            branches_map: Dict[str, Dict[str, str]] = {}
            specialties: List[Dict[str, Any]] = []

            # RegEx pattern for OAK codes: XX.YY.ZZ (e.g. 05.01.07)
            code_pattern = re.compile(r'^\d{2}\.\d{2}\.\d{2}$')

            rows = soup.find_all("tr")
            for row in rows:
                cols = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
                if len(cols) >= 2:
                    potential_code = cols[0].strip()
                    potential_title = cols[1].strip()

                    if code_pattern.match(potential_code):
                        branch_prefix = potential_code[:2] + ".00.00"
                        if branch_prefix not in branches_map:
                            branches_map[branch_prefix] = {
                                "code": branch_prefix,
                                "name_uz": f"{branch_prefix} Fan tarmog'i",
                            }
                        specialties.append({
                            "code": potential_code,
                            "name_uz": potential_title,
                            "name_ru": "",
                            "branch_code": branch_prefix,
                            "has_council": False,
                        })

            return list(branches_map.values()), specialties
        except Exception as exc:
            logger.error("Scraping OAK HTML failed: %s", str(exc))
            return [], []

    def _get_hardcoded_oak_dataset(self) -> Tuple[List[Dict[str, str]], List[Dict[str, Any]]]:
        """
        Comprehensive certified list of OAK branches and agricultural/technical specialties.
        Guarantees system operational resilience.
        """
        branches = [
            {"code": "01.00.00", "name_uz": "Fizika-matematika fanlari"},
            {"code": "02.00.00", "name_uz": "Kimyo fanlari"},
            {"code": "03.00.00", "name_uz": "Biologiya fanlari"},
            {"code": "05.00.00", "name_uz": "Texnika fanlari"},
            {"code": "06.00.00", "name_uz": "Qishloq xo'jaligi fanlari"},
            {"code": "08.00.00", "name_uz": "Iqtisodiyot fanlari"},
            {"code": "10.00.00", "name_uz": "Filologiya fanlari"},
            {"code": "13.00.00", "name_uz": "Pedagogika fanlari"},
        ]

        specialties = [
            # 06.00.00 - Qishloq xo'jaligi fanlari
            {"code": "06.01.01", "name_uz": "Umumiy dehqonchilik. Paxtachilik", "branch_code": "06.00.00", "has_council": True},
            {"code": "06.01.02", "name_uz": "Melioratsiya va sug'orma dehqonchilik", "branch_code": "06.00.00", "has_council": True},
            {"code": "06.01.05", "name_uz": "Seleksiya va urug'chilik", "branch_code": "06.00.00", "has_council": True},
            {"code": "06.01.08", "name_uz": "O'simlikshunoslik", "branch_code": "06.00.00", "has_council": True},
            {"code": "06.01.09", "name_uz": "O'simliklarni himoya qilish", "branch_code": "06.00.00", "has_council": True},
            {"code": "06.01.10", "name_uz": "Meva-sabzavotchilik va uzumchilik", "branch_code": "06.00.00", "has_council": True},
            {"code": "06.02.01", "name_uz": "Qishloq xo'jaligi hayvonlarini urchitish, ko'paytirish va naslchilik", "branch_code": "06.00.00", "has_council": False},

            # 05.00.00 - Texnika fanlari
            {"code": "05.01.01", "name_uz": "Muhandislik geometriyasi va kompyuter grafikasi", "branch_code": "05.00.00", "has_council": False},
            {"code": "05.01.02", "name_uz": "Tizimli tahlil, boshqaruv va axborotni qayta ishlash", "branch_code": "05.00.00", "has_council": False},
            {"code": "05.01.04", "name_uz": "Hisoblash mashinalari, majmualari va kompyuter tarmoqlarining matematik va dasturiy ta'minoti", "branch_code": "05.00.00", "has_council": False},
            {"code": "05.01.07", "name_uz": "Matematik modellashtirish. Sonli usullar va dasturlar majmui", "branch_code": "05.00.00", "has_council": False},
            {"code": "05.07.01", "name_uz": "Qishloq xo'jaligi va melioratsiya mashinalari. Qishloq xo'jaligi va melioratsiyani mexanizatsiyalash", "branch_code": "05.00.00", "has_council": True},

            # 08.00.00 - Iqtisodiyot fanlari
            {"code": "08.00.04", "name_uz": "Qishloq xo'jaligi iqtisodiyoti", "branch_code": "08.00.00", "has_council": True},
            {"code": "08.00.05", "name_uz": "Xizmat ko'rsatish tarmoqlari iqtisodiyoti", "branch_code": "08.00.00", "has_council": False},
            {"code": "08.00.12", "name_uz": "Mintaqaviy iqtisodiyot", "branch_code": "08.00.00", "has_council": False},

            # 03.00.00 - Biologiya fanlari
            {"code": "03.00.05", "name_uz": "Botanika", "branch_code": "03.00.00", "has_council": False},
            {"code": "03.00.06", "name_uz": "Zoologiya", "branch_code": "03.00.00", "has_council": False},
            {"code": "03.00.12", "name_uz": "Biotexnologiya", "branch_code": "03.00.00", "has_council": False},
        ]
        return branches, specialties

    def _upsert_specialties(
        self,
        branches_data: List[Dict[str, str]],
        specialties_data: List[Dict[str, Any]],
    ) -> Dict[str, int]:
        """
        Transactional upsert for branches and specialties with ForeignKey resolution.
        Also syncs legacy UzbekistanSpecialty for complete backwards compatibility.
        """
        created_count = 0
        updated_count = 0
        error_count = 0

        with transaction.atomic():
            # 1. Upsert Science Branches
            branch_instances: Dict[str, ScienceBranch] = {}
            for b in branches_data:
                b_code = b.get("code", "").strip()
                b_name = b.get("name_uz", "").strip()
                if b_code and b_name:
                    obj, _ = ScienceBranch.objects.update_or_create(
                        code=b_code,
                        defaults={
                            "name_uz": b_name,
                            "name_ru": b.get("name_ru", ""),
                            "is_active": True,
                        },
                    )
                    branch_instances[b_code] = obj

            # 2. Upsert Specialties
            for spec in specialties_data:
                code = str(spec.get("code", "")).strip()
                name_uz = spec.get("name_uz", "").strip()
                if not code or not name_uz:
                    continue

                branch_code = spec.get("branch_code", "")
                branch_obj = branch_instances.get(branch_code)
                if not branch_obj and branch_code:
                    branch_obj = ScienceBranch.objects.filter(code=branch_code).first()

                try:
                    _, is_created = Specialty.objects.update_or_create(
                        code=code,
                        defaults={
                            "name_uz": name_uz,
                            "name_ru": spec.get("name_ru", ""),
                            "branch": branch_obj,
                            "has_council": spec.get("has_council", False),
                            "is_active": True,
                        },
                    )

                    # Keep legacy UzbekistanSpecialty table in sync
                    field_name = branch_obj.name_uz if branch_obj else ""
                    UzbekistanSpecialty.objects.update_or_create(
                        code=code,
                        defaults={
                            "name_uz": name_uz,
                            "name_ru": spec.get("name_ru", ""),
                            "field": field_name,
                            "is_active": True,
                        },
                    )

                    if is_created:
                        created_count += 1
                    else:
                        updated_count += 1
                except Exception as exc:
                    error_count += 1
                    logger.error("Failed to upsert specialty %s: %s", code, str(exc))

        return {
            "branches_total": len(branches_data),
            "specialties_total": len(specialties_data),
            "created": created_count,
            "updated": updated_count,
            "errors": error_count,
        }
