from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import exists, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.services.notification_service import notify_customer_booking_milestone, notify_new_paid_booking
from app.services.partner_earning_service import record_earning_on_accept
from app.services.user_membership_service import consume_wash_credit
from app.models.car import Car
from app.models.user import User, UserRole
from app.models.washer import Washer
from app.schemas.service_phase import VALID_SERVICE_PHASES, phase_rank
from app.schemas.booking_schema import (
    BookingAdminRead,
    BookingAssignBody,
    BookingCancelBody,
    BookingCreate,
    BookingMilestoneUpdate,
    BookingDetailRead,
    BookingPhotoSummary,
    BookingOfferRead,
    BookingRescheduleBody,
    BookingStatusUpdate,
    BookingTimelineStep,
    WasherAdminFleetRead,
    WasherDispatchRead,
    WasherPublic,
)
from app.services import geocode_service
from app.services.booking_photo_service import _photo_media_url
from app.utils.exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationError


async def _get_car_owned(db: AsyncSession, car_id: UUID, owner_id: UUID) -> Car:
    result = await db.execute(select(Car).where(Car.id == car_id, Car.owner_id == owner_id))
    car = result.scalar_one_or_none()
    if car is None:
        raise NotFoundError("Car not found")
    return car


async def _get_washer_profile_for_user(db: AsyncSession, user: User) -> Washer:
    result = await db.execute(select(Washer).where(Washer.user_id == user.id))
    washer = result.scalar_one_or_none()
    if washer is None:
        raise ForbiddenError("Washer profile not found")
    return washer


async def _get_washer_for_user(db: AsyncSession, user: User) -> Washer:
    washer = await _get_washer_profile_for_user(db, user)
    if not washer.is_available:
        raise ValidationError("Washer is not available")
    return washer


async def _apply_service_phase(
    db: AsyncSession,
    booking: Booking,
    new_phase: str,
    *,
    notify: bool = True,
) -> None:
    if new_phase not in VALID_SERVICE_PHASES:
        raise ValidationError("Invalid service phase")
    old_rank = phase_rank(booking.service_phase)
    new_rank = phase_rank(new_phase)
    if new_rank < old_rank and booking.service_phase is not None:
        return
    if booking.service_phase == new_phase:
        return

    booking.service_phase = new_phase
    if new_phase == "completed":
        booking.status = BookingStatus.completed
    elif new_phase == "wash_in_progress" and booking.status == BookingStatus.confirmed:
        booking.status = BookingStatus.in_progress

    if notify and new_rank > old_rank:
        await notify_customer_booking_milestone(db, booking, service_phase=new_phase)


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

    lat_f = float(data.latitude) if data.latitude is not None else None
    lng_f = float(data.longitude) if data.longitude is not None else None
    resolved = await geocode_service.resolve_service_coords(
        data.service_address.strip(),
        lat_f,
        lng_f,
    )
    lat = Decimal(str(round(resolved[0], 7)))
    lng = Decimal(str(round(resolved[1], 7)))

    booking = Booking(
        customer_id=customer.id,
        car_id=data.car_id,
        washer_id=data.washer_id,
        status=BookingStatus.pending,
        scheduled_at=data.scheduled_at,
        service_address=data.service_address.strip(),
        latitude=lat,
        longitude=lng,
        price_cents=data.price_cents,
        currency=data.currency,
        notes=data.notes.strip() if data.notes else None,
        service_phase="awaiting_acceptance",
    )
    db.add(booking)
    await db.flush()
    db.add(
        Payment(
            booking_id=booking.id,
            amount_cents=data.price_cents,
            currency=data.currency,
            status=PaymentStatus.captured,
            provider="demo",
            external_id=f"demo-{booking.id}",
        )
    )
    await consume_wash_credit(db, customer)
    await notify_new_paid_booking(db, booking, customer)
    await notify_customer_booking_milestone(db, booking, service_phase="awaiting_acceptance")
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ConflictError("Could not create booking") from None
    await db.refresh(booking)
    return booking


def _city_from_address(address: str) -> str:
    part = (address or "").split(",")[0].strip()
    return part[:80] if part else "—"


def _booking_to_admin_read(booking: Booking) -> BookingAdminRead:
    customer = booking.customer
    washer_user = booking.washer.user if booking.washer else None
    return BookingAdminRead(
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
        customer_name=customer.full_name if customer else None,
        washer_name=washer_user.full_name if washer_user else None,
        city=_city_from_address(booking.service_address),
        created_at=booking.created_at,
        updated_at=booking.updated_at,
    )


async def list_bookings_admin(db: AsyncSession) -> list[BookingAdminRead]:
    stmt = (
        select(Booking)
        .options(
            selectinload(Booking.customer),
            selectinload(Booking.washer).selectinload(Washer.user),
        )
        .order_by(Booking.scheduled_at.desc())
    )
    result = await db.execute(stmt)
    rows = list(result.scalars().unique().all())
    return [_booking_to_admin_read(b) for b in rows]


async def list_washers_for_dispatch(db: AsyncSession) -> list[WasherDispatchRead]:
    stmt = (
        select(Washer)
        .options(selectinload(Washer.user))
        .where(Washer.is_available.is_(True))
        .order_by(Washer.rating_avg.desc())
    )
    result = await db.execute(stmt)
    washers = list(result.scalars().unique().all())
    out: list[WasherDispatchRead] = []
    for w in washers:
        if not w.user:
            continue
        out.append(
            WasherDispatchRead(
                id=w.id,
                full_name=w.user.full_name,
                service_area=w.service_area,
                is_available=w.is_available,
                rating_avg=float(w.rating_avg),
            )
        )
    return out


async def list_washers_admin_fleet(db: AsyncSession) -> list[WasherAdminFleetRead]:
    """All washers for admin dashboards (online + offline)."""
    stmt = (
        select(Washer)
        .options(selectinload(Washer.user))
        .order_by(Washer.is_available.desc(), Washer.rating_avg.desc())
    )
    result = await db.execute(stmt)
    washers = list(result.scalars().unique().all())

    now = datetime.now(timezone.utc)
    since_7d = now - timedelta(days=7)
    active_statuses = (BookingStatus.confirmed, BookingStatus.in_progress)

    stats: dict[UUID, tuple[int, int]] = {}
    b_result = await db.execute(select(Booking).where(Booking.washer_id.isnot(None)))
    for b in b_result.scalars().all():
        if b.washer_id is None:
            continue
        active, c7 = stats.get(b.washer_id, (0, 0))
        if b.status in active_statuses:
            active += 1
        if b.status == BookingStatus.completed and b.updated_at and b.updated_at >= since_7d:
            c7 += 1
        stats[b.washer_id] = (active, c7)

    out: list[WasherAdminFleetRead] = []
    for w in washers:
        if not w.user:
            continue
        active_jobs, completed7d = stats.get(w.id, (0, 0))
        out.append(
            WasherAdminFleetRead(
                id=w.id,
                full_name=w.user.full_name,
                service_area=w.service_area,
                is_available=w.is_available,
                rating_avg=float(w.rating_avg),
                active_jobs=active_jobs,
                completed7d=completed7d,
                updated_at=w.updated_at,
            )
        )
    return out


async def assign_booking_by_admin(
    db: AsyncSession, booking_id: UUID, payload: BookingAssignBody
) -> Booking:
    result = await db.execute(select(Washer).where(Washer.id == payload.washer_id))
    washer = result.scalar_one_or_none()
    if washer is None:
        raise NotFoundError("Washer not found")

    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")
    if booking.status == BookingStatus.cancelled:
        raise ValidationError("Cannot assign a cancelled booking")
    if booking.status == BookingStatus.completed:
        raise ValidationError("Cannot assign a completed booking")

    booking.washer_id = washer.id
    if booking.status == BookingStatus.pending:
        booking.status = BookingStatus.confirmed
    await db.commit()
    await db.refresh(booking)
    return booking


async def list_bookings_for_user(db: AsyncSession, user: User) -> list[Booking]:
    stmt = select(Booking).options(selectinload(Booking.car), selectinload(Booking.washer))

    if user.role == UserRole.admin:
        # Full list is only via GET /bookings?scope=admin (admin console).
        return []
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
    now = datetime.now(timezone.utc)
    if booking.status in (BookingStatus.completed, BookingStatus.cancelled):
        return None
    if booking.status == BookingStatus.in_progress:
        return max(8, min(35, 20))
    if booking.scheduled_at:
        sched = booking.scheduled_at
        if sched.tzinfo is None:
            sched = sched.replace(tzinfo=timezone.utc)
        delta = sched - now
        if delta.total_seconds() > 0:
            return max(5, int(delta.total_seconds() // 60))
    return None


async def _get_booking_for_customer_mutation(
    db: AsyncSession, user: User, booking_id: UUID
) -> Booking:
    stmt = select(Booking).where(Booking.id == booking_id)
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")
    if user.role != UserRole.customer or booking.customer_id != user.id:
        raise ForbiddenError("Not allowed to modify this booking")
    return booking


async def cancel_booking_for_customer(
    db: AsyncSession, user: User, booking_id: UUID, payload: BookingCancelBody
) -> Booking:
    booking = await _get_booking_for_customer_mutation(db, user, booking_id)
    if booking.status != BookingStatus.pending:
        raise ValidationError(
            "Only bookings that are still open before washer acceptance can be cancelled here."
        )
    booking.status = BookingStatus.cancelled
    detail = (payload.reason_detail or "").strip()
    reason_line = f"{payload.reason_key}"
    if detail:
        reason_line += f" | {detail}"
    suffix = f"\n[Customer cancel] {reason_line}"
    combined = (booking.notes or "").strip() + suffix
    if len(combined) > 2000:
        combined = combined[-2000:]
    booking.notes = combined or None
    await db.commit()
    await db.refresh(booking)
    return booking


async def reschedule_booking_for_customer(
    db: AsyncSession, user: User, booking_id: UUID, payload: BookingRescheduleBody
) -> Booking:
    booking = await _get_booking_for_customer_mutation(db, user, booking_id)
    if booking.status != BookingStatus.pending:
        raise ValidationError("Only open bookings can be rescheduled.")
    booking.scheduled_at = payload.scheduled_at
    await db.commit()
    await db.refresh(booking)
    return booking


async def list_open_offers(db: AsyncSession, user: User) -> list[BookingOfferRead]:
    if user.role != UserRole.washer:
        raise ForbiddenError("Only washers can view dispatch offers")
    await _get_washer_profile_for_user(db, user)

    paid = exists(
        select(Payment.id).where(
            Payment.booking_id == Booking.id,
            Payment.status == PaymentStatus.captured,
        )
    )
    stmt = (
        select(Booking)
        .where(
            Booking.status == BookingStatus.pending,
            Booking.washer_id.is_(None),
            paid,
        )
        .options(selectinload(Booking.car), selectinload(Booking.customer))
        .order_by(Booking.scheduled_at.asc())
        .limit(50)
    )
    result = await db.execute(stmt)
    rows = list(result.scalars().unique().all())
    offers: list[BookingOfferRead] = []
    for b in rows:
        car = b.car
        car_label = f"{car.make} {car.model}" if car else None
        cust = b.customer
        offers.append(
            BookingOfferRead(
                id=b.id,
                scheduled_at=b.scheduled_at,
                service_address=b.service_address,
                price_cents=b.price_cents,
                currency=b.currency,
                notes=b.notes,
                car_label=car_label,
                customer_name=cust.full_name if cust else None,
            )
        )
    return offers


async def accept_booking(db: AsyncSession, user: User, booking_id: UUID) -> Booking:
    washer = await _get_washer_for_user(db, user)
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")
    if booking.status != BookingStatus.pending or booking.washer_id is not None:
        raise ConflictError("Booking is no longer available")
    booking.washer_id = washer.id
    booking.status = BookingStatus.confirmed
    await _apply_service_phase(db, booking, "washer_accepted")
    await record_earning_on_accept(db, booking, washer)
    await db.commit()
    await db.refresh(booking)
    return booking


async def update_booking_status_for_washer(
    db: AsyncSession, user: User, booking_id: UUID, payload: BookingStatusUpdate
) -> Booking:
    washer = await _get_washer_for_user(db, user)
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")
    if booking.washer_id != washer.id:
        raise ForbiddenError("Not assigned to this booking")

    target = payload.status
    current = booking.status

    allowed: dict[BookingStatus, set[BookingStatus]] = {
        BookingStatus.confirmed: {BookingStatus.in_progress, BookingStatus.completed},
        BookingStatus.in_progress: {BookingStatus.completed},
    }
    if current not in allowed or target not in allowed[current]:
        raise ValidationError(f"Cannot change status from {current.value} to {target.value}")

    if target == BookingStatus.in_progress:
        phase = booking.service_phase or ""
        if phase not in ("arrival_approved", "wash_in_progress"):
            raise ValidationError(
                "Customer must approve the arrival check-in photo before you can start the wash"
            )

    booking.status = target
    if target == BookingStatus.completed:
        await _apply_service_phase(db, booking, "completed", notify=True)
    elif target == BookingStatus.in_progress:
        await _apply_service_phase(db, booking, "wash_in_progress", notify=True)
    await db.commit()
    await db.refresh(booking)
    return booking


async def update_booking_milestone_for_washer(
    db: AsyncSession, user: User, booking_id: UUID, payload: BookingMilestoneUpdate
) -> Booking:
    washer = await _get_washer_for_user(db, user)
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")
    if booking.washer_id != washer.id:
        raise ForbiddenError("Not assigned to this booking")

    new_phase = payload.service_phase.strip()
    if new_phase == "wash_in_progress" and booking.service_phase not in (
        "arrival_approved",
        "wash_in_progress",
    ):
        raise ValidationError(
            "Customer must approve the arrival check-in photo before starting the wash"
        )

    await _apply_service_phase(db, booking, new_phase)
    await db.commit()
    await db.refresh(booking)
    return booking


async def approve_arrival_for_customer(
    db: AsyncSession, user: User, booking_id: UUID
) -> Booking:
    result = await db.execute(
        select(Booking)
        .where(Booking.id == booking_id)
        .options(selectinload(Booking.photos))
    )
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")
    if booking.customer_id != user.id:
        raise ForbiddenError("Not allowed to approve this booking")

    from app.models.booking_photo import BookingPhotoKind

    has_arrival = any(p.kind == BookingPhotoKind.arrival for p in booking.photos)
    if not has_arrival:
        raise ValidationError("No arrival check-in photo to approve yet")

    if booking.service_phase != "awaiting_arrival_approval":
        if booking.service_phase in ("arrival_approved", "wash_in_progress", "completed"):
            return booking
        raise ValidationError("Arrival photo is not waiting for your approval")

    await _apply_service_phase(db, booking, "arrival_approved", notify=True)
    await db.commit()
    await db.refresh(booking)
    return booking


async def get_booking_detail(db: AsyncSession, user: User, booking_id: UUID) -> BookingDetailRead:
    stmt = (
        select(Booking)
        .where(Booking.id == booking_id)
        .options(
            selectinload(Booking.car),
            selectinload(Booking.customer),
            selectinload(Booking.washer).selectinload(Washer.user),
            selectinload(Booking.photos),
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
    customer = booking.customer
    customer_name = customer.full_name if customer else None
    customer_phone = customer.phone if customer else None

    return BookingDetailRead(
        id=booking.id,
        customer_id=booking.customer_id,
        car_id=booking.car_id,
        washer_id=booking.washer_id,
        status=booking.status,
        service_phase=booking.service_phase,
        scheduled_at=booking.scheduled_at,
        service_address=booking.service_address,
        latitude=booking.latitude,
        longitude=booking.longitude,
        price_cents=booking.price_cents,
        currency=booking.currency,
        notes=booking.notes,
        created_at=booking.created_at,
        car_label=car_label,
        customer_name=customer_name,
        customer_phone=customer_phone,
        washer=washer_out,
        eta_minutes=_estimate_eta_minutes(booking),
        timeline=_build_timeline(booking),
        photos=[
            BookingPhotoSummary(
                id=p.id,
                kind=p.kind.value,
                url=_photo_media_url(p.booking_id, p.storage_name),
                created_at=p.created_at,
            )
            for p in sorted(booking.photos, key=lambda x: x.kind.value)
        ],
    )
