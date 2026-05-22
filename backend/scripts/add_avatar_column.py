"""One-off: add users.avatar_storage_name if missing (existing DBs). Safe to re-run."""

import asyncio

from sqlalchemy import text

from app.database.database import engine


async def main() -> None:
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_storage_name VARCHAR(255)"
            )
        )
        await conn.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS home_address VARCHAR(500)")
        )
    print("profile columns ready")


if __name__ == "__main__":
    asyncio.run(main())
