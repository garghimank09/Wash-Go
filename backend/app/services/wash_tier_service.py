from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wash_tier import WashTier
from app.schemas.wash_tier_schema import WashTierCreate, WashTierUpdate


async def list_active_wash_tiers(db: AsyncSession) -> list[WashTier]:
    result = await db.execute(
        select(WashTier)
        .where(WashTier.is_active.is_(True))
        .order_by(WashTier.sort_order.asc(), WashTier.name.asc())
    )
    return list(result.scalars().all())


async def list_all_wash_tiers(db: AsyncSession) -> list[WashTier]:
    result = await db.execute(
        select(WashTier).order_by(WashTier.sort_order.asc(), WashTier.name.asc())
    )
    return list(result.scalars().all())


async def get_wash_tier_by_slug(db: AsyncSession, slug: str) -> WashTier | None:
    result = await db.execute(select(WashTier).where(WashTier.slug == slug))
    return result.scalar_one_or_none()


async def get_active_wash_tier_by_slug(db: AsyncSession, slug: str) -> WashTier | None:
    result = await db.execute(
        select(WashTier).where(WashTier.slug == slug, WashTier.is_active.is_(True))
    )
    return result.scalar_one_or_none()


async def create_wash_tier(db: AsyncSession, payload: WashTierCreate) -> WashTier:
    existing = await get_wash_tier_by_slug(db, payload.slug)
    if existing is not None:
        raise ValueError("A tier with this slug already exists")
    tier = WashTier(
        slug=payload.slug,
        name=payload.name,
        description=payload.description,
        price_cents=payload.price_cents,
        features=payload.features,
        badge=payload.badge,
        icon=payload.icon,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )
    db.add(tier)
    await db.commit()
    await db.refresh(tier)
    return tier


async def update_wash_tier(db: AsyncSession, slug: str, payload: WashTierUpdate) -> WashTier:
    tier = await get_wash_tier_by_slug(db, slug)
    if tier is None:
        raise LookupError("Wash tier not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(tier, key, value)
    await db.commit()
    await db.refresh(tier)
    return tier


async def deactivate_wash_tier(db: AsyncSession, slug: str) -> WashTier:
    tier = await get_wash_tier_by_slug(db, slug)
    if tier is None:
        raise LookupError("Wash tier not found")
    tier.is_active = False
    await db.commit()
    await db.refresh(tier)
    return tier
