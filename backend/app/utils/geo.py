import math
import re

# Delhi NCR service area defaults (Wash-Go India-first)
DELHI_CENTER = (28.6139, 77.2090)
OKHLA_PHASE2 = (28.5244, 77.2786)

# Rough India bounding box
INDIA_LAT = (6.0, 37.0)
INDIA_LNG = (68.0, 98.0)

MAX_LOCAL_ROUTE_KM = 45.0

_INDIA_HINTS = re.compile(
    r"\b(india|delhi|new\s*delhi|okhla|noida|gurugram|gurgaon|ghaziabad|faridabad|ncr|"
    r"greater\s*noida|dwarka|saket|rohini|janakpuri|phase\s*[-]?\s*\d)\b",
    re.IGNORECASE,
)


def looks_like_india(address: str) -> bool:
    return bool(_INDIA_HINTS.search(address or ""))


def is_in_india_bounds(lat: float, lng: float) -> bool:
    return INDIA_LAT[0] <= lat <= INDIA_LAT[1] and INDIA_LNG[0] <= lng <= INDIA_LNG[1]


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlng / 2) ** 2
    return 2 * r * math.asin(min(1.0, math.sqrt(a)))


def fallback_coords_for_address(address: str) -> tuple[float, float]:
    """India-aware default when geocoding fails."""
    low = (address or "").lower()
    if "okhla" in low:
        return OKHLA_PHASE2
    if looks_like_india(address):
        return DELHI_CENTER
    return DELHI_CENTER
