from typing import Annotated

from fastapi import APIRouter, Query

from app.schemas.places_schema import PlaceAutocompleteResponse, PlaceSuggestion
from app.services import places_service

router = APIRouter(prefix="/places", tags=["Places"])


@router.get("/autocomplete", response_model=PlaceAutocompleteResponse)
async def place_autocomplete(
    input: Annotated[str, Query(min_length=2, max_length=200)],
    session_token: Annotated[str | None, Query(max_length=64)] = None,
) -> PlaceAutocompleteResponse:
    """Public place suggestions for partner service area (Google Places API, India-biased)."""
    rows = await places_service.places_autocomplete(input, session_token=session_token)
    return PlaceAutocompleteResponse(
        suggestions=[PlaceSuggestion(**r) for r in rows],
    )
