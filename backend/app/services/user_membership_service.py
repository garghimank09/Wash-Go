from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.membership import MembershipPlan, UserMembership, UserMembershipStatus
from app.models.user import User, UserRole
from app.schemas.user_membership_schema import UserMembershipRead
from app.services.membership_plan_service import get_plan_by_slug
from app.services.notification_service import notify_membership_subscribed
from app.utils.exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationError


async def get_active_membership_for_user(
    db: AsyncSession, user_id
) -> UserMembership | None:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(UserMembership)
        .where(
            UserMembership.user_id == user_id,
            UserMembership.status == UserMembershipStatus.active,
            UserMembership.ends_at > now,
            UserMembership.washes_remaining > 0,
        )
        .options(selectinload(UserMembership.plan))
        .order_by(UserMembership.ends_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_current_membership_display(
    db: AsyncSession, user: User
) -> UserMembership | None:
    """Latest active membership for profile (may have 0 washes left)."""
    if user.role != UserRole.customer:
        return None
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(UserMembership)
        .where(
            UserMembership.user_id == user.id,
            UserMembership.status == UserMembershipStatus.active,
            UserMembership.ends_at > now,
        )
        .options(selectinload(UserMembership.plan))
        .order_by(UserMembership.ends_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


def membership_to_read(row: UserMembership) -> UserMembershipRead:
    plan = row.plan
    return UserMembershipRead(
        id=row.id,
        plan_slug=plan.slug if plan else "",
        plan_name=plan.name if plan else "Membership",
        status=row.status.value,
        washes_remaining=row.washes_remaining,
        washes_included=plan.washes_included if plan else 0,
        price_cents=plan.price_cents if plan else 0,
        currency=plan.currency if plan else "INR",
        features=list(plan.features) if plan and plan.features else [],
        starts_at=row.starts_at,
        ends_at=row.ends_at,
        is_popular=bool(plan.is_popular) if plan else False,
    )


async def subscribe_customer_demo(
    db: AsyncSession, user: User, plan_slug: str
) -> UserMembershipRead:
    if user.role != UserRole.customer:
        raise ForbiddenError("Only customer accounts can subscribe to membership plans")

    plan = await get_plan_by_slug(db, plan_slug.strip().lower())
    if plan is None or not plan.is_active:
        raise NotFoundError("Membership plan not found")

    if plan.washes_included < 1:
        raise ValidationError("This plan has no washes configured")

    now = datetime.now(timezone.utc)

    active_result = await db.execute(
        select(UserMembership)
        .where(
            UserMembership.user_id == user.id,
            UserMembership.status == UserMembershipStatus.active,
            UserMembership.ends_at > now,
        )
    )
    for existing in active_result.scalars().all():
        existing.status = UserMembershipStatus.cancelled

    row = UserMembership(
        user_id=user.id,
        plan_id=plan.id,
        starts_at=now,
        ends_at=now + timedelta(days=plan.duration_days),
        status=UserMembershipStatus.active,
        washes_remaining=plan.washes_included,
        auto_renew=False,
    )
    db.add(row)
    await notify_membership_subscribed(db, user, plan)
    await db.commit()
    result = await db.execute(
        select(UserMembership)
        .where(UserMembership.id == row.id)
        .options(selectinload(UserMembership.plan))
    )
    row = result.scalar_one()
    return membership_to_read(row)


async def consume_wash_credit(db: AsyncSession, user: User) -> bool:
    """Decrement one wash from active membership. Returns True if a credit was used."""
    if user.role != UserRole.customer:
        return False
    membership = await get_active_membership_for_user(db, user.id)
    if membership is None:
        return False
    membership.washes_remaining -= 1
    if membership.washes_remaining < 0:
        membership.washes_remaining = 0
    return True
