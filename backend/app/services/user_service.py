from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.password_handler import hash_password
from app.config.settings import settings
from app.models.car import Car
from app.models.user import User, UserRole
from app.models.washer import Washer
from app.schemas.car_schema import CarCreate
from app.schemas.user_schema import PartnerSignup, UserCreate
from app.utils.exceptions import ConflictError, NotFoundError


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    if await get_user_by_email(db, data.email):
        raise ConflictError("Email already registered")

    user = User(
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        full_name=data.full_name.strip(),
        phone=data.phone.strip() if data.phone else None,
        role=UserRole.customer,
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ConflictError("Email already registered") from None
    await db.refresh(user)
    return user


async def create_partner_user(db: AsyncSession, data: PartnerSignup) -> User:
    if await get_user_by_email(db, data.email):
        raise ConflictError("Email already registered")

    user = User(
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        full_name=data.full_name.strip(),
        phone=data.phone.strip() if data.phone else None,
        role=UserRole.washer,
    )
    db.add(user)
    await db.flush()

    washer = Washer(
        user_id=user.id,
        service_area=data.service_area.strip() if data.service_area else None,
        rating_avg=Decimal("0.00"),
        is_available=True,
    )
    db.add(washer)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ConflictError("Email already registered") from None
    await db.refresh(user)
    return user


async def create_car_for_user(db: AsyncSession, owner: User, data: CarCreate) -> Car:
    car = Car(
        owner_id=owner.id,
        make=data.make.strip(),
        model=data.model.strip(),
        year=data.year,
        license_plate=data.license_plate,
        color=data.color.strip() if data.color else None,
    )
    db.add(car)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ConflictError("License plate already registered for this account") from None
    await db.refresh(car)
    return car


async def list_cars_for_user(db: AsyncSession, owner: User) -> list[Car]:
    result = await db.execute(select(Car).where(Car.owner_id == owner.id).order_by(Car.created_at.desc()))
    return list(result.scalars().all())


async def ensure_default_admin(db: AsyncSession) -> None:
    """Create or refresh the seeded admin user (email/password from settings)."""
    if not settings.ADMIN_SEED_ENABLED:
        return
    email = settings.ADMIN_SEED_EMAIL.strip().lower()
    if not email or not settings.ADMIN_SEED_PASSWORD:
        return

    user = await get_user_by_email(db, email)
    hashed = hash_password(settings.ADMIN_SEED_PASSWORD)
    if user is None:
        user = User(
            email=email,
            hashed_password=hashed,
            full_name=settings.ADMIN_SEED_FULL_NAME.strip() or "Admin",
            role=UserRole.admin,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
    else:
        user.role = UserRole.admin
        user.hashed_password = hashed
        user.full_name = settings.ADMIN_SEED_FULL_NAME.strip() or user.full_name
        user.is_active = True

    await db.commit()


async def delete_car_for_user(db: AsyncSession, owner: User, car_id: UUID) -> None:
    result = await db.execute(select(Car).where(Car.id == car_id, Car.owner_id == owner.id))
    car = result.scalar_one_or_none()
    if car is None:
        raise NotFoundError("Car not found")
    await db.delete(car)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ConflictError(
            "Cannot delete a car that has bookings. Cancel or complete related bookings first."
        ) from None
