from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.washer import Washer
from app.schemas.partner_schema import WasherAvailabilityRead, WasherAvailabilityUpdate
from app.services.booking_service import _get_washer_profile_for_user
from app.utils.exceptions import NotFoundError


async def get_washer_availability(db: AsyncSession, user: User) -> WasherAvailabilityRead:
    washer = await _get_washer_profile_for_user(db, user)
    return WasherAvailabilityRead(
        washer_id=washer.id,
        full_name=user.full_name,
        service_area=washer.service_area,
        is_available=washer.is_available,
        rating_avg=float(washer.rating_avg),
    )


async def update_washer_availability(
    db: AsyncSession, user: User, payload: WasherAvailabilityUpdate
) -> WasherAvailabilityRead:
    result = await db.execute(
        select(Washer).options(selectinload(Washer.user)).where(Washer.user_id == user.id)
    )
    washer = result.scalar_one_or_none()
    if washer is None:
        raise NotFoundError("Washer profile not found")
    washer.is_available = payload.is_available
    await db.commit()
    await db.refresh(washer)
    return WasherAvailabilityRead(
        washer_id=washer.id,
        full_name=user.full_name,
        service_area=washer.service_area,
        is_available=washer.is_available,
        rating_avg=float(washer.rating_avg),
    )
