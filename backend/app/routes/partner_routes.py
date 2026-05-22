from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_roles
from app.database.database import get_db
from app.models.user import User, UserRole
from app.schemas.partner_earning_schema import PartnerEarningsSummary
from app.schemas.partner_schema import (
    PartnerProfileRead,
    PartnerProfileUpdate,
    WasherAvailabilityRead,
    WasherAvailabilityUpdate,
)
from app.schemas.tracking_schema import WasherLocationUpdate
from app.services import (
    partner_earning_service,
    partner_profile_service,
    partner_service,
    tracking_service,
)

router = APIRouter(prefix="/partner", tags=["Partner"])


@router.get("/earnings", response_model=PartnerEarningsSummary)
async def get_partner_earnings(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
) -> PartnerEarningsSummary:
    return await partner_earning_service.get_partner_earnings_summary(db, current)


@router.get("/availability", response_model=WasherAvailabilityRead)
async def get_partner_availability(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
) -> WasherAvailabilityRead:
    return await partner_service.get_washer_availability(db, current)


@router.patch("/availability", response_model=WasherAvailabilityRead)
async def update_partner_availability(
    payload: WasherAvailabilityUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
) -> WasherAvailabilityRead:
    return await partner_service.update_washer_availability(db, current, payload)


@router.post("/location", status_code=status.HTTP_204_NO_CONTENT)
async def update_partner_location(
    payload: WasherLocationUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
) -> None:
    """Report live GPS from the partner app (called while on active jobs)."""
    await tracking_service.upsert_washer_location(db, current, payload)


@router.get("/profile", response_model=PartnerProfileRead)
async def get_partner_profile(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
) -> PartnerProfileRead:
    return await partner_profile_service.get_partner_profile(db, current)


@router.patch("/profile", response_model=PartnerProfileRead)
async def update_partner_profile(
    payload: PartnerProfileUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
) -> PartnerProfileRead:
    return await partner_profile_service.update_partner_profile(db, current, payload)


@router.post("/profile/avatar", response_model=PartnerProfileRead)
async def upload_partner_avatar(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
    file: UploadFile = File(...),
) -> PartnerProfileRead:
    return await partner_profile_service.upload_partner_avatar(db, current, file)
