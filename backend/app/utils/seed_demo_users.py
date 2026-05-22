"""Seed fixed demo accounts for local development (idempotent)."""

import logging
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.password_handler import hash_password
from app.models.user import User, UserRole
from app.models.washer import Washer
from app.services import user_service

logger = logging.getLogger(__name__)

DEMO_PASSWORD = "Demo1234"

DEMO_ACCOUNTS: list[dict] = [
    {
        "email": "admin@washgo.demo",
        "full_name": "Demo Admin",
        "role": UserRole.admin,
        "phone": "9876543210",
        "service_area": None,
    },
    {
        "email": "customer@washgo.demo",
        "full_name": "Demo Customer",
        "role": UserRole.customer,
        "phone": "9876543211",
        "service_area": None,
    },
    {
        "email": "partner@washgo.demo",
        "full_name": "Demo Partner",
        "role": UserRole.washer,
        "phone": "9876543212",
        "service_area": "New Delhi, India",
    },
]


async def _ensure_washer_profile(db: AsyncSession, user: User, service_area: str | None) -> None:
    result = await db.execute(select(Washer).where(Washer.user_id == user.id))
    profile = result.scalar_one_or_none()
    if profile is None:
        db.add(
            Washer(
                user_id=user.id,
                service_area=service_area,
                rating_avg=Decimal("4.85"),
                is_available=True,
            )
        )
    elif service_area and not profile.service_area:
        profile.service_area = service_area


async def seed_demo_users(db: AsyncSession) -> list[str]:
    """
    Create or refresh demo users (@washgo.demo). Returns list of emails touched.
    """
    touched: list[str] = []
    password_hash = hash_password(DEMO_PASSWORD)

    for spec in DEMO_ACCOUNTS:
        email = spec["email"].lower()
        user = await user_service.get_user_by_email(db, email)

        if user is None:
            user = User(
                email=email,
                hashed_password=password_hash,
                full_name=spec["full_name"],
                phone=spec.get("phone"),
                role=spec["role"],
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            await db.flush()
            logger.info("Created demo user %s (%s)", email, spec["role"].value)
        else:
            user.hashed_password = password_hash
            user.full_name = spec["full_name"]
            user.role = spec["role"]
            user.phone = spec.get("phone")
            user.is_active = True
            user.is_verified = True
            logger.info("Refreshed demo user %s (%s)", email, spec["role"].value)

        if spec["role"] == UserRole.washer:
            await _ensure_washer_profile(db, user, spec.get("service_area"))

        touched.append(email)

    await db.commit()
    return touched
