"""
Align public.users password column with SQLAlchemy model (hashed_password in Python).

Run from repo root or backend/:
  python scripts/fix_users_password_column.py

If your table used 'password' or 'password_hash', this renames it to 'hashed_password'.
If 'hashed_password' already exists, does nothing.
"""
import asyncio
import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[1]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.config.settings import settings


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.connect() as conn:
        r = await conn.execute(
            text(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'users'
                ORDER BY ordinal_position
                """
            )
        )
        cols = {row[0] for row in r.fetchall()}
        print("users columns:", sorted(cols))

        if "hashed_password" in cols:
            print("OK: hashed_password already exists.")
            await conn.commit()
            await engine.dispose()
            return

        if "password" in cols:
            await conn.execute(text('ALTER TABLE users RENAME COLUMN "password" TO hashed_password'))
            await conn.commit()
            print("Renamed column password -> hashed_password")
            await engine.dispose()
            return

        if "password_hash" in cols:
            await conn.execute(text('ALTER TABLE users RENAME COLUMN password_hash TO hashed_password'))
            await conn.commit()
            print("Renamed column password_hash -> hashed_password")
            await engine.dispose()
            return

        print(
            "No password / password_hash / hashed_password column found. "
            "Either drop table users (dev) and restart API to recreate, or add hashed_password manually."
        )
    await engine.dispose()
    sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
