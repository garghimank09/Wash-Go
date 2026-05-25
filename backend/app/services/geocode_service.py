import logging
import re
from typing import Any

import httpx

from app.services import google_maps_service
from app.utils.geo import (
    fallback_coords_for_address,
    haversine_km,
    is_in_india_bounds,
    looks_like_india,
)

logger = logging.getLogger(__name__)

_NOMINATIM = "https://nominatim.openstreetmap.org/search"
_NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse"
_USER_AGENT = "WashGo/1.0 (dev; contact@washgo.local)"

# Delhi NCR viewbox (left, top, right, bottom) — bias results
_DELHI_VIEWBOX = "76.8,28.9,77.6,28.4"

_MAX_VARIANTS = 8


def _query_variants(address: str) -> list[str]:
    base = (address or "").strip()
    if len(base) < 3:
        return []
    seen: set[str] = set()
    variants: list[str] = []

    def add(q: str) -> None:
        if len(variants) >= _MAX_VARIANTS:
            return
        q = re.sub(r"\s+", " ", q).strip()
        if q and q.lower() not in seen:
            seen.add(q.lower())
            variants.append(q)

    parts = [p.strip() for p in re.split(r"[,،]", base) if p.strip()]
    india = looks_like_india(base)
    low = base.lower()

    # Long Google-style strings: try locality-first (house numbers rarely match OSM).
    if len(base) > 60 and len(parts) >= 2:
        for n in (2, 3, 4):
            if len(parts) >= n:
                add(", ".join(parts[-n:]))
        for segment in reversed(parts):
            if re.search(
                r"okhla|phase\s*[-]?\s*\d|industrial|colony|pocket|delhi|noida",
                segment,
                re.IGNORECASE,
            ):
                add(f"{segment}, New Delhi, India")

    add(base)

    if india:
        if "okhla" in low:
            phase = re.search(r"okhla\s*phase\s*[-]?\s*([ivx\d]+)", low, re.IGNORECASE)
            if phase:
                add(f"Okhla Phase {phase.group(1)}, New Delhi, India")
            add("Okhla Phase II, New Delhi, India")
            add("Okhla Industrial Estate, New Delhi, India")
            add("Okhla, New Delhi, India")
        if not re.search(r"\bindia\b", base, re.IGNORECASE):
            tail = ", ".join(parts[-2:]) if len(parts) >= 2 else base
            add(f"{tail}, New Delhi, Delhi, India")
            add(f"{tail}, India")

    return variants


async def _nominatim_search(
    query: str,
    *,
    countrycodes: str | None = None,
    viewbox: str | None = None,
) -> tuple[float, float] | None:
    params: dict[str, Any] = {"q": query, "format": "json", "limit": 3, "addressdetails": 0}
    if countrycodes:
        params["countrycodes"] = countrycodes
    if viewbox:
        params["viewbox"] = viewbox
        params["bounded"] = 1
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(12.0)) as client:
            response = await client.get(
                _NOMINATIM,
                params=params,
                headers={"User-Agent": _USER_AGENT},
            )
            response.raise_for_status()
            rows = response.json()
    except (httpx.HTTPError, ValueError, TypeError) as exc:
        logger.warning("nominatim search failed for %r: %s", query[:80], exc)
        return None
    if not rows:
        return None
    for row in rows:
        try:
            lat = float(row["lat"])
            lng = float(row["lon"])
        except (KeyError, TypeError, ValueError):
            continue
        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            continue
        if countrycodes == "in" and not is_in_india_bounds(lat, lng):
            continue
        return lat, lng
    return None


async def _photon_search(query: str) -> tuple[float, float] | None:
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
            response = await client.get(
                "https://photon.komoot.io/api/",
                params={"q": query, "limit": 3, "lang": "en"},
            )
            response.raise_for_status()
            features = response.json().get("features") or []
    except (httpx.HTTPError, ValueError, TypeError) as exc:
        logger.warning("photon search failed for %r: %s", query[:80], exc)
        return None
    for feat in features:
        coords = feat.get("geometry", {}).get("coordinates")
        if not coords or len(coords) < 2:
            continue
        lng, lat = float(coords[0]), float(coords[1])
        if looks_like_india(query) and not is_in_india_bounds(lat, lng):
            continue
        return lat, lng
    return None


async def geocode_address(address: str) -> tuple[float, float] | None:
    """Resolve address to (lat, lng), biased for India / Delhi NCR."""
    india = looks_like_india(address)
    variants = _query_variants(address)
    if len((address or "").strip()) > 60:
        variants = sorted(variants, key=len)

    for query in variants:
        coords = await _nominatim_search(query, countrycodes="in" if india else None)
        if coords:
            return coords

    if india:
        for query in variants[:5]:
            coords = await _nominatim_search(query, countrycodes="in", viewbox=_DELHI_VIEWBOX)
            if coords:
                return coords
        for query in variants[:4]:
            coords = await _photon_search(query)
            if coords:
                return coords

    return None


def _format_reverse_address(payload: dict[str, Any]) -> str:
    """Build a readable single-line address from Nominatim reverse JSON."""
    display = (payload.get("display_name") or "").strip()
    addr = payload.get("address")
    if not isinstance(addr, dict):
        return display

    parts: list[str] = []

    def add(val: Any) -> None:
        if not val:
            return
        s = str(val).strip()
        if not s:
            return
        if parts and parts[-1].lower() == s.lower():
            return
        parts.append(s)

    # Street-level first (most useful for service drop-off).
    add(addr.get("house_number"))
    add(addr.get("house_name"))
    add(addr.get("building"))
    add(addr.get("amenity"))
    add(addr.get("shop"))
    add(addr.get("road") or addr.get("pedestrian") or addr.get("footway") or addr.get("residential"))

    for key in (
        "quarter",
        "neighbourhood",
        "suburb",
        "locality",
        "hamlet",
        "village",
        "town",
        "city_district",
        "district",
        "city",
        "state_district",
        "state",
        "postcode",
        "country",
    ):
        add(addr.get(key))

    if parts:
        return ", ".join(parts)
    return display


def _format_photon_reverse(props: dict[str, Any]) -> str:
    parts: list[str] = []

    def add(val: Any) -> None:
        if not val:
            return
        s = str(val).strip()
        if not s:
            return
        if parts and parts[-1].lower() == s.lower():
            return
        parts.append(s)

    add(props.get("housenumber"))
    add(props.get("street") or props.get("name"))
    add(props.get("district") or props.get("locality") or props.get("suburb"))
    add(props.get("city") or props.get("county"))
    add(props.get("state"))
    add(props.get("postcode"))
    add(props.get("country"))
    return ", ".join(parts)


async def _nominatim_reverse(lat: float, lng: float, *, zoom: int = 19) -> str | None:
    params: dict[str, Any] = {
        "lat": lat,
        "lon": lng,
        "format": "json",
        "addressdetails": 1,
        "zoom": zoom,
        "accept-language": "en",
    }
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(12.0)) as client:
            response = await client.get(
                _NOMINATIM_REVERSE,
                params=params,
                headers={"User-Agent": _USER_AGENT},
            )
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError, TypeError) as exc:
        logger.warning("nominatim reverse failed for %s,%s: %s", lat, lng, exc)
        return None

    if not isinstance(payload, dict):
        return None
    formatted = _format_reverse_address(payload).strip()
    return formatted if len(formatted) >= 5 else None


async def _photon_reverse(lat: float, lng: float) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
            response = await client.get(
                "https://photon.komoot.io/reverse",
                params={"lat": lat, "lon": lng, "lang": "en"},
            )
            response.raise_for_status()
            features = response.json().get("features") or []
    except (httpx.HTTPError, ValueError, TypeError) as exc:
        logger.warning("photon reverse failed for %s,%s: %s", lat, lng, exc)
        return None

    best: tuple[float, str] | None = None
    for feat in features[:5]:
        props = feat.get("properties") or {}
        coords = feat.get("geometry", {}).get("coordinates")
        if not coords or len(coords) < 2:
            continue
        feat_lng, feat_lat = float(coords[0]), float(coords[1])
        dist_km = haversine_km(lat, lng, feat_lat, feat_lng)
        formatted = _format_photon_reverse(props).strip()
        if len(formatted) < 5:
            continue
        if best is None or dist_km < best[0]:
            best = (dist_km, formatted)

    return best[1] if best else None


async def reverse_geocode_coords(lat: float, lng: float) -> str | None:
    """Resolve map pin coordinates to a service address string."""
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        return None

    if google_maps_service.is_configured():
        google_addr = await google_maps_service.reverse_geocode(lat, lng)
        if google_addr:
            return google_addr

    # High zoom first for street-level; fall back for sparse OSM areas.
    for zoom in (19, 18, 17):
        result = await _nominatim_reverse(lat, lng, zoom=zoom)
        if result:
            return result

    if is_in_india_bounds(lat, lng):
        photon = await _photon_reverse(lat, lng)
        if photon:
            return photon

    return None


async def geocode_for_preview(address: str) -> tuple[float, float, bool] | None:
    """
    Resolve address for booking UI.
    Returns (lat, lng, approximate). approximate=True when using area fallback.
    """
    trimmed = (address or "").strip()
    if len(trimmed) < 3:
        return None

    if google_maps_service.is_configured():
        google_coords = await google_maps_service.geocode_address(trimmed)
        if google_coords:
            return google_coords[0], google_coords[1], False

    coords = await geocode_address(trimmed)
    if coords:
        return coords[0], coords[1], False

    if looks_like_india(trimmed):
        lat, lng = fallback_coords_for_address(trimmed)
        return lat, lng, True

    return None


async def resolve_service_coords(
    address: str,
    latitude: float | None,
    longitude: float | None,
) -> tuple[float, float]:
    """
    Return best (lat, lng) for a service address.
    Re-geocodes when stored coords disagree with an India address.
    """
    lat, lng = latitude, longitude
    if lat is not None and lng is not None:
        if looks_like_india(address) and not is_in_india_bounds(float(lat), float(lng)):
            lat, lng = None, None
        else:
            return float(lat), float(lng)

    if google_maps_service.is_configured():
        google_coords = await google_maps_service.geocode_address(address)
        if google_coords:
            return google_coords

    coords = await geocode_address(address)
    if coords:
        return coords
    return fallback_coords_for_address(address)
