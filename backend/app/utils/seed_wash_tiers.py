"""Seed default wash tiers when the table is empty (dev / first deploy)."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wash_tier import WashTier

DEFAULT_TIERS: list[dict] = [
    {
        "slug": "basic",
        "name": "Basic",
        "description": "Quick exterior refresh",
        "price_cents": 24900,
        "features": [
            "Exterior rinse & dry",
            "Tyre splash clean",
            "Standard scheduling",
        ],
        "badge": None,
        "icon": "droplets",
        "sort_order": 0,
    },
    {
        "slug": "deluxe",
        "name": "Deluxe",
        "description": "Everyday deep clean",
        "price_cents": 39900,
        "features": [
            "Everything in Basic",
            "Wheel & trim detail",
            "Door jamb wipe",
        ],
        "badge": None,
        "icon": "sparkles",
        "sort_order": 1,
    },
    {
        "slug": "super_deluxe",
        "name": "Super Deluxe",
        "description": "Inside + out shine",
        "price_cents": 49900,
        "features": [
            "Everything in Deluxe",
            "Interior vacuum",
            "Dashboard & console wipe",
            "Window interiors",
        ],
        "badge": "Popular",
        "icon": "star",
        "sort_order": 2,
    },
    {
        "slug": "premium",
        "name": "Premium",
        "description": "Showroom-ready finish",
        "price_cents": 64900,
        "features": [
            "Everything in Super Deluxe",
            "Wax / sealant coat",
            "Tyre dressing",
            "Priority washer match",
        ],
        "badge": "Best value",
        "icon": "crown",
        "sort_order": 3,
    },
]


async def seed_wash_tiers_if_empty(db: AsyncSession) -> int:
    """Insert default tiers when none exist. Returns number of rows inserted."""
    count = await db.scalar(select(func.count()).select_from(WashTier))
    if count and count > 0:
        return 0
    for row in DEFAULT_TIERS:
        db.add(WashTier(**row))
    await db.commit()
    return len(DEFAULT_TIERS)
