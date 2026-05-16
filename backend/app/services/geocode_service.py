import logging
import re
from typing import Any

import httpx

from app.utils.geo import fallback_coords_for_address, is_in_india_bounds, looks_like_india

logger = logging.getLogger(__name__)

_NOMINATIM = "https://nominatim.openstreetmap.org/search"
_USER_AGENT = "WashGo/1.0 (dev; contact@washgo.local)"

# Delhi NCR viewbox (left, top, right, bottom) — bias results
_DELHI_VIEWBOX = "76.8,28.9,77.6,28.4"


def _query_variants(address: str) -> list[str]:
    base = (address or "").strip()
    if len(base) < 3:
        return []
    seen: set[str] = set()
    variants: list[str] = []

    def add(q: str) -> None:
        q = re.sub(r"\s+", " ", q).strip()
        if q and q.lower() not in seen:
            seen.add(q.lower())
            variants.append(q)

    add(base)
    if looks_like_india(base):
        if not re.search(r"\bindia\b", base, re.IGNORECASE):
            add(f"{base}, Okhla, New Delhi, India")
            add(f"{base}, New Delhi, Delhi, India")
            add(f"{base}, India")
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
    for query in _query_variants(address):
        coords = await _nominatim_search(query, countrycodes="in" if india else None)
        if coords:
            return coords
        if india:
            coords = await _nominatim_search(query, countrycodes="in", viewbox=_DELHI_VIEWBOX)
            if coords:
                return coords
            coords = await _photon_search(query)
            if coords:
                return coords
    if india:
        return await _photon_search(_query_variants(address)[0] if _query_variants(address) else address)
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

    coords = await geocode_address(address)
    if coords:
        return coords
    return fallback_coords_for_address(address)
