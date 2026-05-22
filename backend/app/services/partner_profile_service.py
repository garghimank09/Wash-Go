from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.washer import Washer
from app.schemas.partner_schema import PartnerProfileRead, PartnerProfileUpdate
from app.services.avatar_service import save_user_avatar
from app.services.booking_service import _get_washer_profile_for_user


def _to_read(user: User, washer: Washer) -> PartnerProfileRead:
    return PartnerProfileRead(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        avatar_url=user.avatar_url,
        service_area=washer.service_area,
        bio=washer.bio,
        washer_id=washer.id,
    )


async def get_partner_profile(db: AsyncSession, user: User) -> PartnerProfileRead:
    washer = await _get_washer_profile_for_user(db, user)
    return _to_read(user, washer)


async def update_partner_profile(
    db: AsyncSession, user: User, payload: PartnerProfileUpdate
) -> PartnerProfileRead:
    washer = await _get_washer_profile_for_user(db, user)

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        user.phone = payload.phone.strip() or None
    if payload.service_area is not None:
        washer.service_area = payload.service_area.strip() or None
    if payload.bio is not None:
        washer.bio = payload.bio.strip() or None

    await db.commit()
    await db.refresh(user)
    await db.refresh(washer)
    return _to_read(user, washer)


async def upload_partner_avatar(
    db: AsyncSession, user: User, upload: UploadFile
) -> PartnerProfileRead:
    washer = await _get_washer_profile_for_user(db, user)
    await save_user_avatar(user, upload)
    await db.commit()
    await db.refresh(user)
    await db.refresh(washer)
    return _to_read(user, washer)
