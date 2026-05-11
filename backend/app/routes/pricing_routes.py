from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.pricing_schema import PricingCalculateRequest, PricingCalculateResponse

router = APIRouter(prefix="/pricing", tags=["Pricing"])

# Base package prices (cents) — MVP static table; replace with rules engine later.
_PACKAGE_BASE: dict[str, int] = {
    "basic": 2499,
    "deluxe": 3999,
    "premium": 5999,
}
_SIZE_MULT: dict[str, float] = {
    "compact": 1.0,
    "sedan": 1.15,
    "suv": 1.35,
}


@router.post("/calculate", response_model=PricingCalculateResponse)
async def calculate_price(
    payload: PricingCalculateRequest,
    _: Annotated[User, Depends(get_current_active_user)],
) -> PricingCalculateResponse:
    base = _PACKAGE_BASE[payload.package_id]
    mult = _SIZE_MULT[payload.vehicle_size]
    estimated = int(round(base * mult))
    return PricingCalculateResponse(
        estimated_price_cents=estimated,
        currency="USD",
        package_id=payload.package_id,
        vehicle_size=payload.vehicle_size,
        notes="MVP estimate; final price set at booking confirmation.",
    )
