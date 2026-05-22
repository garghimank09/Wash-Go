import logging

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete"
_FIELD_MASK = "suggestions.placePrediction.placeId,suggestions.placePrediction.text"


def _parse_suggestions(data: dict) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    for suggestion in data.get("suggestions") or []:
        pred = suggestion.get("placePrediction")
        if not pred:
            continue
        place_id = pred.get("placeId")
        text_block = pred.get("text") or {}
        description = text_block.get("text")
        if place_id and description:
            out.append({"place_id": str(place_id), "description": str(description)})
    return out[:8]


async def _autocomplete_request(body: dict, key: str) -> list[dict[str, str]]:
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": _FIELD_MASK,
    }
    async with httpx.AsyncClient(timeout=httpx.Timeout(8.0)) as client:
        response = await client.post(_AUTOCOMPLETE_URL, json=body, headers=headers)
        data = response.json()
        if response.status_code >= 400:
            err = data.get("error", {})
            logger.warning(
                "places autocomplete (new) http=%s status=%s message=%s",
                response.status_code,
                err.get("status"),
                err.get("message"),
            )
            return []
        return _parse_suggestions(data)


async def places_autocomplete(input_text: str, *, session_token: str | None = None) -> list[dict[str, str]]:
    """
    Google Places Autocomplete (New), biased to India.
    Returns [{ place_id, description }, ...].
    Requires Places API (New) enabled on the Google Cloud project.
    """
    key = (settings.GOOGLE_MAPS_API_KEY or "").strip()
    if not key:
        return []

    trimmed = (input_text or "").strip()
    if len(trimmed) < 2:
        return []

    base: dict = {
        "input": trimmed,
        "includedRegionCodes": ["in"],
        "languageCode": "en",
    }
    if session_token:
        base["sessionToken"] = session_token

    try:
        # Prefer regions/localities for service-area picker; fall back to all place types in India.
        rows = await _autocomplete_request({**base, "includedPrimaryTypes": ["(regions)"]}, key)
        if rows:
            return rows
        return await _autocomplete_request(base, key)
    except (httpx.HTTPError, ValueError, TypeError) as exc:
        logger.warning("places autocomplete (new) failed: %s", exc)
        return []
