"""Google Maps Platform — Geocoding API (server-side)."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"


def is_configured() -> bool:
    key = (settings.GOOGLE_MAPS_API_KEY or "").strip()
    return len(key) > 0


async def _geocode_request(params: dict[str, Any]) -> dict[str, Any] | None:
    key = (settings.GOOGLE_MAPS_API_KEY or "").strip()
    if not key:
        return None
    params = {**params, "key": key}
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(12.0)) as client:
            response = await client.get(_GEOCODE_URL, params=params)
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError, TypeError) as exc:
        logger.warning("Google Geocoding request failed: %s", exc)
        return None
    if not isinstance(payload, dict):
        return None
    status = payload.get("status")
    if status not in ("OK", "ZERO_RESULTS"):
        logger.warning("Google Geocoding status=%s error=%s", status, payload.get("error_message"))
    return payload


_ADDRESS_TYPE_PRIORITY = (
    "street_address",
    "premise",
    "subpremise",
    "establishment",
    "point_of_interest",
    "route",
    "neighborhood",
    "sublocality",
    "locality",
)


def _pick_best_formatted_address(results: list[dict[str, Any]]) -> str | None:
    for preferred in _ADDRESS_TYPE_PRIORITY:
        for row in results:
            types = row.get("types") or []
            if preferred in types:
                formatted = (row.get("formatted_address") or "").strip()
                if len(formatted) >= 5:
                    return formatted
    if results:
        formatted = (results[0].get("formatted_address") or "").strip()
        if len(formatted) >= 5:
            return formatted
    return None


def _pick_best_forward_location(results: list[dict[str, Any]]) -> tuple[float, float] | None:
    for preferred in ("street_address", "premise", "route", "locality"):
        for row in results:
            if preferred in (row.get("types") or []):
                loc = row.get("geometry", {}).get("location") or {}
                try:
                    return float(loc["lat"]), float(loc["lng"])
                except (KeyError, TypeError, ValueError):
                    continue
    if results:
        loc = results[0].get("geometry", {}).get("location") or {}
        try:
            return float(loc["lat"]), float(loc["lng"])
        except (KeyError, TypeError, ValueError):
            return None
    return None


async def geocode_address(address: str) -> tuple[float, float] | None:
    """Forward geocode: address → (lat, lng)."""
    trimmed = (address or "").strip()
    if len(trimmed) < 3:
        return None
    payload = await _geocode_request(
        {
            "address": trimmed,
            "region": "in",
            "language": "en",
        }
    )
    if not payload or payload.get("status") != "OK":
        return None
    results = payload.get("results") or []
    return _pick_best_forward_location(results)


async def reverse_geocode(lat: float, lng: float) -> str | None:
    """Reverse geocode: coordinates → formatted address."""
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        return None

    latlng = f"{lat},{lng}"
    # Try precise rooftop match first, then broader search.
    param_sets: list[dict[str, Any]] = [
        {"latlng": latlng, "language": "en", "region": "in", "location_type": "ROOFTOP"},
        {"latlng": latlng, "language": "en", "region": "in"},
    ]
    for params in param_sets:
        payload = await _geocode_request(params)
        if not payload or payload.get("status") != "OK":
            continue
        results = payload.get("results") or []
        formatted = _pick_best_formatted_address(results)
        if formatted:
            return formatted
    return None
