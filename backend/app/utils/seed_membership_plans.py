"""Seed default membership plans when the table is empty (dev / first deploy)."""

import logging

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.membership import MembershipPlan

logger = logging.getLogger(__name__)

DEFAULT_PLANS: list[dict] = [
    {
        "slug": "spark",
        "name": "Spark",
        "description": "Starter monthly wash bundle",
        "price_cents": 49900,
        "currency": "INR",
        "duration_days": 30,
        "features": [
            "2 washes / month",
            "Standard scheduling",
            "Email support",
        ],
        "washes_included": 2,
        "sort_order": 0,
        "is_popular": False,
    },
    {
        "slug": "gleam",
        "name": "Gleam",
        "description": "Most popular for regular drivers",
        "price_cents": 99900,
        "currency": "INR",
        "duration_days": 30,
        "features": [
            "5 washes / month",
            "Priority washers",
            "In-app AI summaries",
        ],
        "washes_included": 5,
        "sort_order": 1,
        "is_popular": True,
    },
    {
        "slug": "apex_fleet",
        "name": "Apex Fleet",
        "description": "Fleet & power users",
        "price_cents": 249900,
        "currency": "INR",
        "duration_days": 30,
        "features": [
            "12 washes / month",
            "Dedicated account manager",
            "Fleet analytics",
        ],
        "washes_included": 12,
        "sort_order": 2,
        "is_popular": False,
    },
]

WASHES_BY_SLUG = {p["slug"]: p["washes_included"] for p in DEFAULT_PLANS}


async def ensure_membership_plan_columns(conn) -> None:
    """Add columns introduced after first deploy (idempotent)."""
    statements = [
        "ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS slug VARCHAR(64)",
        "ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS is_popular BOOLEAN NOT NULL DEFAULT false",
        "ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'INR'",
        "ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS washes_included INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE user_memberships ADD COLUMN IF NOT EXISTS washes_remaining INTEGER NOT NULL DEFAULT 0",
    ]
    for stmt in statements:
        await conn.execute(text(stmt))
    for slug, washes in WASHES_BY_SLUG.items():
        await conn.execute(
            text(
                "UPDATE membership_plans SET washes_included = :washes "
                "WHERE slug = :slug AND (washes_included IS NULL OR washes_included = 0)"
            ),
            {"slug": slug, "washes": washes},
        )
    await conn.execute(
        text(
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_membership_plans_slug "
            "ON membership_plans (slug) WHERE slug IS NOT NULL"
        )
    )


async def seed_membership_plans_if_empty(db: AsyncSession) -> None:
    count = await db.scalar(select(func.count()).select_from(MembershipPlan))
    if count and count > 0:
        return
    for spec in DEFAULT_PLANS:
        db.add(MembershipPlan(**spec))
    await db.commit()
    logger.info("Seeded %s default membership plans", len(DEFAULT_PLANS))
