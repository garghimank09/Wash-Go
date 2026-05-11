from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.booking import Booking, BookingStatus
from app.models.car import Car
from app.models.user import User, UserRole
from app.models.washer import Washer
from app.schemas.booking_schema import (
    BookingCreate,
    BookingDetailRead,
    BookingTimelineStep,
    WasherPublic,
)
from app.utils.exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationError


async def _get_car_owned(db: AsyncSession, car_id: UUID, owner_id: UUID) -> Car:
    result = await db.execute(select(Car).where(Car.id == car_id, Car.owner_id == owner_id))
    car = result.scalar_one_or_none()
    if car is None:
        raise NotFoundError("Car not found")
    return car


async def _get_washer_if_requested(db: AsyncSession, washer_id: UUID | None) -> Washer | None:
    if washer_id is None:
        return None
    result = await db.execute(select(Washer).where(Washer.id == washer_id))
    washer = result.scalar_one_or_none()
    if washer is None:
        raise NotFoundError("Washer not found")
    if not washer.is_available:
        raise ValidationError("Washer is not available")
    return washer


async def create_booking(db: AsyncSession, customer: User, data: BookingCreate) -> Booking:
    await _get_car_owned(db, data.car_id, customer.id)
    await _get_washer_if_requested(db, data.washer_id)

    booking = Booking(
        customer_id=customer.id,
        car_id=data.car_id,
        washer_id=data.washer_id,
        status=BookingStatus.pending,
        scheduled_at=data.scheduled_at,
        service_address=data.service_address.strip(),
        latitude=data.latitude,
        longitude=data.longitude,
        price_cents=data.price_cents,
        currency=data.currency,
        notes=data.notes.strip() if data.notes else None,
    )
    db.add(booking)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ConflictError("Could not create booking") from None
    await db.refresh(booking)
    return booking


async def list_bookings_for_user(db: AsyncSession, user: User) -> list[Booking]:
    stmt = select(Booking).options(selectinload(Booking.car), selectinload(Booking.washer))

    if user.role == UserRole.admin:
        stmt = stmt.order_by(Booking.scheduled_at.desc())
    elif user.role == UserRole.washer:
        wr = await db.execute(select(Washer).where(Washer.user_id == user.id))
        washer = wr.scalar_one_or_none()
        if washer is None:
            return []
        stmt = stmt.where(Booking.washer_id == washer.id).order_by(Booking.scheduled_at.desc())
    else:
        stmt = stmt.where(Booking.customer_id == user.id).order_by(Booking.scheduled_at.desc())

    result = await db.execute(stmt)
    return list(result.scalars().unique().all())


def _status_rank(status: BookingStatus) -> int:
    order = {
        BookingStatus.pending: 0,
        BookingStatus.confirmed: 1,
        BookingStatus.in_progress: 2,
        BookingStatus.completed: 3,
        BookingStatus.cancelled: -1,
    }
    return order.get(status, 0)


def _build_timeline(booking: Booking) -> list[BookingTimelineStep]:
    if booking.status == BookingStatus.cancelled:
        return [
            BookingTimelineStep(
                key="placed",
                label="Booking placed",
                done=True,
                at=booking.created_at,
            ),
            BookingTimelineStep(
                key="cancelled",
                label="Cancelled",
                done=True,
                at=booking.updated_at,
            ),
        ]

    rank = _status_rank(booking.status)
    return [
        BookingTimelineStep(
            key="placed",
            label="Booking placed",
            done=True,
            at=booking.created_at,
        ),
        BookingTimelineStep(
            key="confirmed",
            label="Washer confirmed",
            done=rank >= 1,
            at=booking.updated_at if rank >= 1 else None,
        ),
        BookingTimelineStep(
            key="in_progress",
            label="Wash in progress",
            done=rank >= 2,
            at=booking.updated_at if rank >= 2 else None,
        ),
        BookingTimelineStep(
            key="completed",
            label="Completed",
            done=rank >= 3,
            at=booking.updated_at if rank >= 3 else None,
        ),
    ]


def _estimate_eta_minutes(booking: Booking) -> int | None:
    now = datetime.now(UTC)
    if booking.status in (BookingStatus.completed, BookingStatus.cancelled):
        return None
    if booking.status == BookingStatus.in_progress:
        return max(8, min(35, 20))
    if booking.scheduled_at:
        sched = booking.scheduled_at
        if sched.tzinfo is None:
            sched = sched.replace(tzinfo=UTC)
        delta = sched - now
        if delta.total_seconds() > 0:
            return max(5, int(delta.total_seconds() // 60))
    return None


async def get_booking_detail(db: AsyncSession, user: User, booking_id: UUID) -> BookingDetailRead:
    stmt = (
        select(Booking)
        .where(Booking.id == booking_id)
        .options(
            selectinload(Booking.car),
            selectinload(Booking.washer).selectinload(Washer.user),
        )
    )
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")

    if user.role == UserRole.admin:
        pass
    elif user.role == UserRole.washer:
        wr = await db.execute(select(Washer).where(Washer.user_id == user.id))
        washer = wr.scalar_one_or_none()
        if washer is None or booking.washer_id != washer.id:
            raise ForbiddenError("Not allowed to view this booking")
    else:
        if booking.customer_id != user.id:
            raise ForbiddenError("Not allowed to view this booking")

    washer_out: WasherPublic | None = None
    if booking.washer and booking.washer.user:
        washer_out = WasherPublic(
            id=booking.washer.id,
            full_name=booking.washer.user.full_name,
            rating_avg=float(booking.washer.rating_avg),
            service_area=booking.washer.service_area,
        )

    car = booking.car
    car_label = f"{car.make} {car.model}" if car else None

    return BookingDetailRead(
        id=booking.id,
        customer_id=booking.customer_id,
        car_id=booking.car_id,
        washer_id=booking.washer_id,
        status=booking.status,
        scheduled_at=booking.scheduled_at,
        service_address=booking.service_address,
        latitude=booking.latitude,
        longitude=booking.longitude,
        price_cents=booking.price_cents,
        currency=booking.currency,
        notes=booking.notes,
        created_at=booking.created_at,
        car_label=car_label,
        washer=washer_out,
        eta_minutes=_estimate_eta_minutes(booking),
        timeline=_build_timeline(booking),
    )
