from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.booking import Booking
from app.models.membership import MembershipPlan
from app.models.notification import Notification
from app.models.user import User, UserRole
from app.models.washer import Washer
from app.utils.exceptions import NotFoundError


async def create_notification(
    db: AsyncSession,
    *,
    user_id: UUID,
    title: str,
    body: str,
    notification_type: str,
    data: dict | None = None,
) -> Notification:
    row = Notification(
        user_id=user_id,
        title=title[:200],
        body=body[:2000],
        notification_type=notification_type,
        data=data,
        read=False,
    )
    db.add(row)
    return row


async def _notify_users(
    db: AsyncSession,
    user_ids: list[UUID],
    *,
    title: str,
    body: str,
    notification_type: str,
    data: dict | None = None,
) -> None:
    seen: set[UUID] = set()
    for uid in user_ids:
        if uid in seen:
            continue
        seen.add(uid)
        await create_notification(
            db,
            user_id=uid,
            title=title,
            body=body,
            notification_type=notification_type,
            data=data,
        )


async def _user_ids_by_roles(db: AsyncSession, *roles: UserRole) -> list[UUID]:
    result = await db.execute(
        select(User.id).where(User.role.in_(roles), User.is_active.is_(True))
    )
    return list(result.scalars().all())


def _format_inr(cents: int) -> str:
    return f"₹{cents / 100:,.2f}"


async def notify_new_paid_booking(
    db: AsyncSession, booking: Booking, customer: User
) -> None:
    """Alert partners (and admins) when a customer completes demo payment for a wash."""
    amount = _format_inr(booking.price_cents)
    customer_name = customer.full_name or "A customer"
    address = (booking.service_address or "").strip()
    if len(address) > 80:
        address = f"{address[:77]}…"

    title = "New paid wash booking"
    body = (
        f"{customer_name} paid {amount} for a wash"
        + (f" at {address}" if address else "")
        + ". Accept it in Offers."
    )
    data = {
        "booking_id": str(booking.id),
        "path": "/partner/requests",
    }

    partner_ids = await _user_ids_by_roles(db, UserRole.washer)
    await _notify_users(
        db,
        partner_ids,
        title=title,
        body=body,
        notification_type="booking_paid",
        data=data,
    )

    admin_data = {**data, "path": "/admin/bookings"}
    admin_ids = await _user_ids_by_roles(db, UserRole.admin)
    await _notify_users(
        db,
        admin_ids,
        title="New paid booking",
        body=f"{customer_name} paid {amount} — view in Bookings.",
        notification_type="booking_paid",
        data=admin_data,
    )


async def notify_membership_subscribed(
    db: AsyncSession,
    customer: User,
    plan: MembershipPlan,
) -> None:
    """Alert admins and confirm with the customer after membership demo checkout."""
    customer_name = customer.full_name or "A customer"
    plan_name = plan.name
    washes = plan.washes_included
    price = _format_inr(plan.price_cents)

    admin_ids = await _user_ids_by_roles(db, UserRole.admin)
    await _notify_users(
        db,
        admin_ids,
        title="New membership plan",
        body=f"{customer_name} subscribed to {plan_name} ({price}/mo, {washes} washes).",
        notification_type="membership_subscribed",
        data={"plan_slug": plan.slug, "path": "/admin/membership-plans"},
    )

    await create_notification(
        db,
        user_id=customer.id,
        title="Membership activated",
        body=f"You're on {plan_name} with {washes} washes this month. View credits in Profile.",
        notification_type="membership_active",
        data={"plan_slug": plan.slug, "path": "/profile"},
    )


async def notify_handoff_requested(db: AsyncSession, booking: Booking) -> None:
    """Alert the customer that their wash is ready for review."""
    await create_notification(
        db,
        user_id=booking.customer_id,
        title="Your wash is ready for review",
        body="Your washer finished the service. Confirm completion or report an issue in the app.",
        notification_type="wash_ready_for_review",
        data={
            "booking_id": str(booking.id),
            "path": f"/booking/{booking.id}",
        },
    )


async def notify_handoff_confirmed(db: AsyncSession, booking: Booking) -> None:
    """Alert the assigned washer that the customer confirmed completion."""
    if not booking.washer_id:
        return
    result = await db.execute(
        select(Washer).where(Washer.id == booking.washer_id).options(selectinload(Washer.user))
    )
    washer = result.scalar_one_or_none()
    if washer is None or washer.user is None:
        return
    await create_notification(
        db,
        user_id=washer.user_id,
        title="Customer confirmed completion",
        body="The customer approved the wash. Job marked complete — payout will settle.",
        notification_type="wash_customer_confirmed",
        data={
            "booking_id": str(booking.id),
            "path": f"/(partner)/job/{booking.id}",
        },
    )


async def notify_handoff_issue_reported(
    db: AsyncSession, booking: Booking, reason_key: str
) -> None:
    """Alert washer and admins when a customer reports a handoff issue."""
    data_base = {
        "booking_id": str(booking.id),
        "reason_key": reason_key,
    }
    if booking.washer_id:
        wr = await db.execute(
            select(Washer).where(Washer.id == booking.washer_id)
        )
        washer = wr.scalar_one_or_none()
        if washer is not None:
            await create_notification(
                db,
                user_id=washer.user_id,
                title="Customer reported an issue",
                body="The customer flagged a concern with the wash. Support may follow up.",
                notification_type="wash_issue_reported",
                data={**data_base, "path": f"/(partner)/job/{booking.id}"},
            )
    admin_ids = await _user_ids_by_roles(db, UserRole.admin)
    await _notify_users(
        db,
        admin_ids,
        title="Wash handoff issue reported",
        body=f"A customer reported an issue ({reason_key.replace('_', ' ')}) on booking {str(booking.id)[:8]}.",
        notification_type="wash_issue_reported",
        data={**data_base, "path": "/admin/bookings"},
    )


async def notify_customer_booking_milestone(
    db: AsyncSession,
    booking: Booking,
    *,
    service_phase: str,
) -> None:
    from app.schemas.service_phase import MILESTONE_NOTIFY

    copy = MILESTONE_NOTIFY.get(service_phase)
    if copy is None:
        return
    title, body = copy
    await create_notification(
        db,
        user_id=booking.customer_id,
        title=title,
        body=body,
        notification_type="booking_milestone",
        data={
            "booking_id": str(booking.id),
            "service_phase": service_phase,
            "path": f"/bookings/{booking.id}",
        },
    )


async def list_notifications_for_user(
    db: AsyncSession, user_id: UUID, *, limit: int = 40
) -> tuple[list[Notification], int]:
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    items = list(result.scalars().all())
    unread = await db.scalar(
        select(func.count())
        .select_from(Notification)
        .where(Notification.user_id == user_id, Notification.read.is_(False))
    )
    return items, int(unread or 0)


async def mark_notification_read(
    db: AsyncSession, user_id: UUID, notification_id: UUID
) -> Notification:
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise NotFoundError("Notification not found")
    row.read = True
    await db.commit()
    await db.refresh(row)
    return row


async def mark_all_notifications_read(db: AsyncSession, user_id: UUID) -> int:
    result = await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.read.is_(False))
        .values(read=True)
    )
    await db.commit()
    return int(result.rowcount or 0)
