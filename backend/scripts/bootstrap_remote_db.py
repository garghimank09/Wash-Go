"""
Create all tables and seed demo data on a remote Postgres (e.g. Render).

Usage (from backend/):
  set DATABASE_URL=postgresql://user:pass@host/dbname
  .\\.venv\\Scripts\\python.exe scripts/bootstrap_remote_db.py
"""
from __future__ import annotations

import asyncio
import logging
import os
import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[1]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

# Minimal settings for imports (override DATABASE_URL before app loads settings cache).
os.environ.setdefault("SECRET_KEY", "bootstrap-script-key-min-32-chars-long!!")
if "DATABASE_URL" not in os.environ:
    print("ERROR: Set DATABASE_URL to your Postgres connection string.")
    sys.exit(1)

import app.models  # noqa: F401
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database.database import Base
from app.utils.ensure_user_columns import ensure_user_profile_columns
from app.utils.seed_demo_users import seed_demo_users
from app.utils.seed_membership_plans import ensure_membership_plan_columns, seed_membership_plans_if_empty
from app.utils.seed_wash_tiers import seed_wash_tiers_if_empty

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


from app.config.database_url import normalize_database_url


async def bootstrap() -> None:
    url = normalize_database_url(os.environ["DATABASE_URL"])
    engine = create_async_engine(url, echo=False, pool_pre_ping=True)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    logger.info("Creating tables and columns…")
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
        logger.debug("otp_purpose enum skip", exc_info=True)

    async with session_factory() as db:
        await seed_wash_tiers_if_empty(db)
        await seed_membership_plans_if_empty(db)
        emails = await seed_demo_users(db)
        logger.info("Demo users: %s", ", ".join(emails))

    async with engine.connect() as conn:
        tables = await conn.execute(
            text(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
            )
        )
        names = [r[0] for r in tables.fetchall()]
        users = await conn.execute(
            text(
                "SELECT email, role::text, phone FROM users WHERE email LIKE '%@washgo.demo' ORDER BY email"
            )
        )
        demo_rows = users.fetchall()

    await engine.dispose()

    print("BOOTSTRAP_OK")
    print(f"TABLES ({len(names)}):", ", ".join(names))
    print("DEMO_USERS:")
    for email, role, phone in demo_rows:
        print(f"  {role}: {email}  phone={phone}")
    print("PASSWORD (all demo): Demo1234")


if __name__ == "__main__":
    asyncio.run(bootstrap())
