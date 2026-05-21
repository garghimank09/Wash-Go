from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user_schema import CustomerProfileRead, CustomerProfileUpdate
from app.services.avatar_service import save_user_avatar


def _to_read(user: User) -> CustomerProfileRead:
    return CustomerProfileRead(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        avatar_url=user.avatar_url,
    )


async def get_customer_profile(_db: AsyncSession, user: User) -> CustomerProfileRead:
    return _to_read(user)


async def update_customer_profile(
    db: AsyncSession, user: User, payload: CustomerProfileUpdate
) -> CustomerProfileRead:
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        user.phone = payload.phone.strip() or None

    await db.commit()
    await db.refresh(user)
    return _to_read(user)


async def upload_customer_avatar(
    db: AsyncSession, user: User, upload: UploadFile
) -> CustomerProfileRead:
    await save_user_avatar(user, upload)
    await db.commit()
    await db.refresh(user)
    return _to_read(user)
