from sqlalchemy import exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.models.user import User, UserRole
from app.models.washer import Washer
from app.schemas.booking_sync_schema import BookingSyncState


async def get_bookings_sync_state(db: AsyncSession, user: User) -> BookingSyncState:
    """Aggregate version for visible bookings + (for washers) open dispatch offers."""
    if user.role == UserRole.washer:
        wr = await db.execute(select(Washer).where(Washer.user_id == user.id))
        washer = wr.scalar_one_or_none()
        if washer is None:
            return BookingSyncState(version="washer:none:0:offers:0", count=0, updated_at=None)

        assigned = await db.execute(
            select(func.count(Booking.id), func.max(Booking.updated_at)).where(
                Booking.washer_id == washer.id
            )
        )
        a_count, a_updated = assigned.one()

        paid = exists(
            select(Payment.id).where(
                Payment.booking_id == Booking.id,
                Payment.status == PaymentStatus.captured,
            )
        )
        offers = await db.execute(
            select(func.count(Booking.id), func.max(Booking.updated_at)).where(
                Booking.status == BookingStatus.pending,
                Booking.washer_id.is_(None),
                paid,
            )
        )
        o_count, o_updated = offers.one()

        n = int(a_count or 0)
        o_n = int(o_count or 0)
        latest = a_updated
        if o_updated and (latest is None or o_updated > latest):
            latest = o_updated
        ts = latest.isoformat() if latest else "none"
        version = f"washer:{washer.id}:{n}:{o_n}:{ts}"
        return BookingSyncState(version=version, count=n + o_n, updated_at=latest)

    stmt = select(func.count(Booking.id), func.max(Booking.updated_at))
    if user.role != UserRole.admin:
        stmt = stmt.where(Booking.customer_id == user.id)

    result = await db.execute(stmt)
    count, max_updated = result.one()
    n = int(count or 0)
    ts = max_updated.isoformat() if max_updated else "none"

    if user.role == UserRole.admin:
        w_result = await db.execute(
            select(func.count(Washer.id), func.max(Washer.updated_at))
        )
        w_count, w_updated = w_result.one()
        w_n = int(w_count or 0)
        w_ts = w_updated.isoformat() if w_updated else "none"
        latest = max_updated
        if w_updated and (latest is None or w_updated > latest):
            latest = w_updated
        version = f"admin:{n}:{ts}:fleet:{w_n}:{w_ts}"
        return BookingSyncState(version=version, count=n + w_n, updated_at=latest)

    version = f"{user.role.value}:{n}:{ts}"
    return BookingSyncState(version=version, count=n, updated_at=max_updated)
