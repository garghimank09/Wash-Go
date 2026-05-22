from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, BookingStatus
from app.models.partner_earning import (
    PARTNER_SHARE_RATE,
    PartnerEarning,
    PartnerEarningStatus,
    partner_share_cents,
)
from app.models.user import User, UserRole
from app.models.washer import Washer
from app.schemas.partner_earning_schema import PartnerEarningsDayPoint, PartnerEarningsSummary
from app.utils.exceptions import ForbiddenError, NotFoundError


async def _get_washer_for_user(db: AsyncSession, user: User) -> Washer:
    result = await db.execute(select(Washer).where(Washer.user_id == user.id))
    washer = result.scalar_one_or_none()
    if washer is None:
        raise NotFoundError("Washer profile not found")
    return washer


async def record_earning_on_accept(
    db: AsyncSession, booking: Booking, washer: Washer
) -> PartnerEarning | None:
    """Create partner earning row when a washer accepts a paid booking (idempotent)."""
    existing = await db.execute(
        select(PartnerEarning).where(PartnerEarning.booking_id == booking.id)
    )
    if existing.scalar_one_or_none() is not None:
        return None

    now = datetime.now(timezone.utc)
    row = PartnerEarning(
        booking_id=booking.id,
        washer_id=washer.id,
        gross_cents=booking.price_cents,
        partner_cents=partner_share_cents(booking.price_cents),
        status=PartnerEarningStatus.pending_weekly,
        earned_at=now,
    )
    db.add(row)
    return row


async def _backfill_earnings_for_washer(db: AsyncSession, washer_id) -> None:
    """Sync earnings for accepted jobs that pre-date the partner_earnings table."""
    stmt = (
        select(Booking)
        .where(
            Booking.washer_id == washer_id,
            Booking.status.in_(
                (
                    BookingStatus.confirmed,
                    BookingStatus.in_progress,
                    BookingStatus.completed,
                )
            ),
        )
        .outerjoin(PartnerEarning, PartnerEarning.booking_id == Booking.id)
        .where(PartnerEarning.id.is_(None))
    )
    result = await db.execute(stmt)
    for booking in result.scalars().unique().all():
        earned_at = booking.updated_at or booking.created_at
        if earned_at and earned_at.tzinfo is None:
            earned_at = earned_at.replace(tzinfo=timezone.utc)
        db.add(
            PartnerEarning(
                booking_id=booking.id,
                washer_id=washer_id,
                gross_cents=booking.price_cents,
                partner_cents=partner_share_cents(booking.price_cents),
                status=PartnerEarningStatus.pending_weekly,
                earned_at=earned_at or datetime.now(timezone.utc),
            )
        )


async def get_partner_earnings_summary(
    db: AsyncSession, user: User
) -> PartnerEarningsSummary:
    if user.role != UserRole.washer:
        raise ForbiddenError("Only partners can view earnings")

    washer = await _get_washer_for_user(db, user)
    await _backfill_earnings_for_washer(db, washer.id)
    await db.commit()

    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=7)

    lifetime_result = await db.execute(
        select(
            func.coalesce(func.sum(PartnerEarning.partner_cents), 0),
            func.count(PartnerEarning.id),
        ).where(PartnerEarning.washer_id == washer.id)
    )
    lifetime_cents, lifetime_jobs = lifetime_result.one()

    week_result = await db.execute(
        select(
            func.coalesce(func.sum(PartnerEarning.partner_cents), 0),
            func.count(PartnerEarning.id),
        ).where(
            PartnerEarning.washer_id == washer.id,
            PartnerEarning.earned_at >= week_start,
        )
    )
    week_cents, week_jobs = week_result.one()

    pending_result = await db.scalar(
        select(func.coalesce(func.sum(PartnerEarning.partner_cents), 0)).where(
            PartnerEarning.washer_id == washer.id,
            PartnerEarning.status == PartnerEarningStatus.pending_weekly,
        )
    )

    rows_result = await db.execute(
        select(PartnerEarning).where(
            PartnerEarning.washer_id == washer.id,
            PartnerEarning.earned_at >= week_start,
        )
    )
    earnings = list(rows_result.scalars().all())

    series: list[PartnerEarningsDayPoint] = []
    for i in range(6, -1, -1):
        d = now - timedelta(days=i)
        day_start = d.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_rows = [
            e
            for e in earnings
            if day_start <= (e.earned_at if e.earned_at.tzinfo else e.earned_at.replace(tzinfo=timezone.utc)) < day_end
        ]
        series.append(
            PartnerEarningsDayPoint(
                day=day_start.strftime("%a"),
                cents=sum(e.partner_cents for e in day_rows),
                jobs=len(day_rows),
            )
        )

    return PartnerEarningsSummary(
        share_percent=int(PARTNER_SHARE_RATE * 100),
        week_partner_cents=int(week_cents or 0),
        lifetime_partner_cents=int(lifetime_cents or 0),
        pending_weekly_cents=int(pending_result or 0),
        week_jobs=int(week_jobs or 0),
        lifetime_jobs=int(lifetime_jobs or 0),
        series=series,
    )
