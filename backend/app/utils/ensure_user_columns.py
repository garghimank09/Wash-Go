"""Add user profile columns on existing databases (safe to re-run)."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection


async def ensure_user_profile_columns(conn: AsyncConnection) -> None:
    statements = (
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_storage_name VARCHAR(255)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS home_address VARCHAR(500)",
    )
    for stmt in statements:
        await conn.execute(text(stmt))
