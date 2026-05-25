from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.geocode_schema import GeocodeRead, ReverseGeocodeRead
from app.services import geocode_service

router = APIRouter(prefix="/geocode", tags=["Geocode"])


@router.get("", response_model=GeocodeRead)
async def geocode_address_query(
    address: Annotated[str, Query(min_length=3, max_length=500)],
    _: Annotated[User, Depends(get_current_active_user)],
) -> GeocodeRead:
    """Resolve a service address to coordinates (India / Delhi NCR biased)."""
    result = await geocode_service.geocode_for_preview(address.strip())
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not find that address. Try adding city/state or set the pin on the map.",
        )
    lat, lng, approximate = result
    return GeocodeRead(
        lat=lat,
        lng=lng,
        found=not approximate,
        approximate=approximate,
    )


@router.get("/reverse", response_model=ReverseGeocodeRead)
async def reverse_geocode_query(
    lat: Annotated[float, Query(ge=-90, le=90)],
    lng: Annotated[float, Query(ge=-180, le=180)],
    _: Annotated[User, Depends(get_current_active_user)],
) -> ReverseGeocodeRead:
    """Resolve map coordinates to a service address (for pin / current location)."""
    address = await geocode_service.reverse_geocode_coords(lat, lng)
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not resolve an address for this location. Try moving the pin or type the address manually.",
        )
    return ReverseGeocodeRead(address=address, lat=lat, lng=lng)
