from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.membership import MembershipPlan
from app.schemas.membership_plan_schema import MembershipPlanCreate, MembershipPlanUpdate


async def list_active_membership_plans(db: AsyncSession) -> list[MembershipPlan]:
    result = await db.execute(
        select(MembershipPlan)
        .where(MembershipPlan.is_active.is_(True))
        .order_by(MembershipPlan.sort_order.asc(), MembershipPlan.name.asc())
    )
    return list(result.scalars().all())


async def list_all_membership_plans(db: AsyncSession) -> list[MembershipPlan]:
    result = await db.execute(
        select(MembershipPlan).order_by(MembershipPlan.sort_order.asc(), MembershipPlan.name.asc())
    )
    return list(result.scalars().all())


async def get_plan_by_slug(db: AsyncSession, slug: str) -> MembershipPlan | None:
    result = await db.execute(select(MembershipPlan).where(MembershipPlan.slug == slug))
    return result.scalar_one_or_none()


async def create_membership_plan(db: AsyncSession, payload: MembershipPlanCreate) -> MembershipPlan:
    if await get_plan_by_slug(db, payload.slug) is not None:
        raise ValueError("A plan with this slug already exists")
    if payload.is_popular:
        await _clear_popular(db)
    plan = MembershipPlan(
        slug=payload.slug,
        name=payload.name,
        description=payload.description,
        price_cents=payload.price_cents,
        currency=payload.currency,
        duration_days=payload.duration_days,
        features=payload.features,
        washes_included=payload.washes_included,
        sort_order=payload.sort_order,
        is_popular=payload.is_popular,
        is_active=payload.is_active,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan


async def _clear_popular(db: AsyncSession) -> None:
    result = await db.execute(select(MembershipPlan).where(MembershipPlan.is_popular.is_(True)))
    for plan in result.scalars().all():
        plan.is_popular = False


async def update_membership_plan(
    db: AsyncSession, slug: str, payload: MembershipPlanUpdate
) -> MembershipPlan:
    plan = await get_plan_by_slug(db, slug)
    if plan is None:
        raise LookupError("Membership plan not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("is_popular") is True:
        await _clear_popular(db)
    for key, value in data.items():
        setattr(plan, key, value)
    await db.commit()
    await db.refresh(plan)
    return plan


async def deactivate_membership_plan(db: AsyncSession, slug: str) -> MembershipPlan:
    plan = await get_plan_by_slug(db, slug)
    if plan is None:
        raise LookupError("Membership plan not found")
    plan.is_active = False
    plan.is_popular = False
    await db.commit()
    await db.refresh(plan)
    return plan
