"""
Create tables + seed demo data on local and/or Render Postgres.

Reads DATABASE_URL_LOCAL, DATABASE_URL_RENDER, and DATABASE_TARGET from backend/.env.

Usage (from backend/):
  .\\.venv\\Scripts\\python.exe scripts\\bootstrap_databases.py
  .\\.venv\\Scripts\\python.exe scripts\\bootstrap_databases.py --local
  .\\.venv\\Scripts\\python.exe scripts\\bootstrap_databases.py --render
  .\\.venv\\Scripts\\python.exe scripts\\bootstrap_databases.py --both
"""
from __future__ import annotations

import argparse
import asyncio
import logging
import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[1]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

import app.models  # noqa: F401
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.config.database_url import normalize_database_url
from app.config.settings import Settings
from app.database.database import Base
from app.utils.ensure_user_columns import ensure_user_profile_columns
from app.utils.seed_demo_users import seed_demo_users
from app.utils.seed_membership_plans import ensure_membership_plan_columns, seed_membership_plans_if_empty
from app.utils.seed_wash_tiers import seed_wash_tiers_if_empty

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


async def bootstrap_one(label: str, raw_url: str) -> None:
    url = normalize_database_url(raw_url)
    logger.info("=== %s ===", label)
    engine = create_async_engine(
        url,
        echo=False,
        pool_pre_ping=True,
        connect_args={"timeout": 15},
    )
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_membership_plan_columns(conn)
        await ensure_user_profile_columns(conn)
        await conn.execute(
            text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_phase VARCHAR(64)")
        )
        await conn.execute(
            text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS arrival_condition_notes TEXT")
        )

    try:
        async with engine.begin() as conn:
            await conn.execute(text("ALTER TYPE otp_purpose ADD VALUE IF NOT EXISTS 'password_reset'"))
    except Exception:
        logger.debug("otp_purpose enum skip (%s)", label, exc_info=True)

    async with session_factory() as db:
        await seed_wash_tiers_if_empty(db)
        await seed_membership_plans_if_empty(db)
        emails = await seed_demo_users(db)
        logger.info("%s demo users: %s", label, ", ".join(emails))

    async with engine.connect() as conn:
        count = await conn.execute(text("SELECT COUNT(*) FROM users"))
        user_total = count.scalar()
    await engine.dispose()
    logger.info("%s OK — %s users total", label, user_total)


async def main(targets: list[str]) -> None:
    settings = Settings()
    jobs: list[tuple[str, str]] = []

    if "local" in targets:
        jobs.append(("local", settings.DATABASE_URL_LOCAL))
    if "render" in targets:
        if not settings.DATABASE_URL_RENDER:
            logger.error("DATABASE_URL_RENDER is not set in .env")
            sys.exit(1)
        jobs.append(("render", settings.DATABASE_URL_RENDER))

    if not jobs:
        logger.error("No database targets selected")
        sys.exit(1)

    for label, url in jobs:
        await bootstrap_one(label, url)

    active = settings.DATABASE_TARGET
    print(f"\nBOOTSTRAP_DONE ({', '.join(t for t, _ in jobs)})")
    print(f"API uses DATABASE_TARGET={active} -> {settings.DATABASE_URL.split('@')[-1]}")


def parse_args() -> list[str]:
    parser = argparse.ArgumentParser(description="Bootstrap WashGo Postgres databases")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--local", action="store_true", help="Local DB only")
    group.add_argument("--render", action="store_true", help="Render DB only")
    group.add_argument("--both", action="store_true", help="Both (default)")
    args = parser.parse_args()
    if args.local:
        return ["local"]
    if args.render:
        return ["render"]
    return ["local", "render"]


if __name__ == "__main__":
    asyncio.run(main(parse_args()))
