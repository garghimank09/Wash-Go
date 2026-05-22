from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.pricing_schema import PricingCalculateRequest, PricingCalculateResponse
from app.services.wash_tier_service import get_active_wash_tier_by_slug

router = APIRouter(prefix="/pricing", tags=["Pricing"])

_SIZE_MULT: dict[str, float] = {
    "compact": 1.0,
    "sedan": 1.15,
    "suv": 1.35,
}


@router.post("/calculate", response_model=PricingCalculateResponse)
async def calculate_price(
    payload: PricingCalculateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_active_user)],
) -> PricingCalculateResponse:
    tier = await get_active_wash_tier_by_slug(db, payload.package_id.strip().lower())
    if tier is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown or inactive wash tier: {payload.package_id}",
        )
    mult = _SIZE_MULT.get(payload.vehicle_size)
    if mult is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown vehicle size: {payload.vehicle_size}",
        )
    estimated = int(round(tier.price_cents * mult))
    return PricingCalculateResponse(
        estimated_price_cents=estimated,
        currency="INR",
        package_id=tier.slug,
        vehicle_size=payload.vehicle_size,
        notes="Estimate from wash tier base price and vehicle size multiplier.",
    )
