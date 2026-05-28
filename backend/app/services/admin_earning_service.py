from datetime import datetime, timedelta, timezone

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.booking import Booking, BookingStatus
from app.models.partner_earning import PARTNER_SHARE_RATE, PartnerEarning, PartnerEarningStatus
from app.models.user import User
from app.models.washer import Washer
from app.schemas.admin_earning_schema import AdminEarningsOverview, AdminPartnerPayoutRow
from app.services.partner_earning_service import _backfill_earnings_for_washer


async def _ensure_all_partner_earnings_backfilled(db: AsyncSession) -> None:
    """One-time style sync so admin totals include jobs accepted before the ledger existed."""
    result = await db.execute(select(Washer.id))
    for washer_id in result.scalars().all():
        await _backfill_earnings_for_washer(db, washer_id)
    await db.commit()


async def get_admin_earnings_overview(db: AsyncSession) -> AdminEarningsOverview:
    await _ensure_all_partner_earnings_backfilled(db)

    now = datetime.now(timezone.utc)
    since_30d = now - timedelta(days=30)

    customer_30d = await db.execute(
        select(
            func.coalesce(func.sum(Booking.price_cents), 0),
            func.count(Booking.id),
        ).where(
            Booking.status == BookingStatus.completed,
            Booking.scheduled_at >= since_30d,
        )
    )
    customer_paid_30d_cents, _ = customer_30d.one()

    customer_lifetime = await db.scalar(
        select(func.coalesce(func.sum(Booking.price_cents), 0)).where(
            Booking.status == BookingStatus.completed
        )
    )

    gross_30d = await db.scalar(
        select(func.coalesce(func.sum(PartnerEarning.gross_cents), 0)).where(
            PartnerEarning.earned_at >= since_30d
        )
    )
    gross_lifetime = await db.scalar(
        select(func.coalesce(func.sum(PartnerEarning.gross_cents), 0))
    )

    partner_30d = await db.scalar(
        select(func.coalesce(func.sum(PartnerEarning.partner_cents), 0)).where(
            PartnerEarning.earned_at >= since_30d
        )
    )
    partner_lifetime = await db.scalar(
        select(func.coalesce(func.sum(PartnerEarning.partner_cents), 0))
    )

    pending = await db.scalar(
        select(func.coalesce(func.sum(PartnerEarning.partner_cents), 0)).where(
            PartnerEarning.status == PartnerEarningStatus.pending_weekly
        )
    )
    paid_out = await db.scalar(
        select(func.coalesce(func.sum(PartnerEarning.partner_cents), 0)).where(
            PartnerEarning.status == PartnerEarningStatus.paid
        )
    )

    pending_status = PartnerEarningStatus.pending_weekly
    paid_status = PartnerEarningStatus.paid

    partner_rows_result = await db.execute(
        select(
            Washer.id,
            User.full_name,
            func.count(PartnerEarning.id),
            func.coalesce(func.sum(PartnerEarning.gross_cents), 0),
            func.coalesce(func.sum(PartnerEarning.partner_cents), 0),
            func.coalesce(
                func.sum(
                    case(
                        (PartnerEarning.status == pending_status, PartnerEarning.partner_cents),
                        else_=0,
                    )
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    case(
                        (PartnerEarning.status == paid_status, PartnerEarning.partner_cents),
                        else_=0,
                    )
                ),
                0,
            ),
        )
        .join(PartnerEarning, PartnerEarning.washer_id == Washer.id)
        .join(User, User.id == Washer.user_id)
        .group_by(Washer.id, User.full_name)
        .order_by(func.sum(PartnerEarning.partner_cents).desc())
    )

    partners = [
        AdminPartnerPayoutRow(
            washer_id=row[0],
            partner_name=row[1] or "Partner",
            jobs=int(row[2] or 0),
            gross_cents=int(row[3] or 0),
            partner_cents=int(row[4] or 0),
            pending_cents=int(row[5] or 0),
            paid_cents=int(row[6] or 0),
        )
        for row in partner_rows_result.all()
    ]

    gross_30d_i = int(gross_30d or 0)
    gross_lifetime_i = int(gross_lifetime or 0)
    partner_30d_i = int(partner_30d or 0)
    partner_lifetime_i = int(partner_lifetime or 0)

    return AdminEarningsOverview(
        share_percent=int(PARTNER_SHARE_RATE * 100),
        customer_paid_30d_cents=int(customer_paid_30d_cents or 0),
        customer_paid_lifetime_cents=int(customer_lifetime or 0),
        gross_accepted_30d_cents=gross_30d_i,
        gross_accepted_lifetime_cents=gross_lifetime_i,
        partner_payouts_30d_cents=partner_30d_i,
        partner_payouts_lifetime_cents=partner_lifetime_i,
        platform_fees_30d_cents=max(0, gross_30d_i - partner_30d_i),
        platform_fees_lifetime_cents=max(0, gross_lifetime_i - partner_lifetime_i),
        pending_settlement_cents=int(pending or 0),
        paid_out_cents=int(paid_out or 0),
        partners=partners,
    )
