"""Idempotent column adds for booking handoff fields (dev / existing DBs)."""

from sqlalchemy import text


async def ensure_booking_handoff_columns(conn) -> None:
    statements = [
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS handoff_status VARCHAR(32) NOT NULL DEFAULT 'none'",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS handoff_requested_at TIMESTAMPTZ",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS handoff_resolved_at TIMESTAMPTZ",
        "CREATE INDEX IF NOT EXISTS ix_bookings_handoff_status ON bookings (handoff_status)",
    ]
    for stmt in statements:
        await conn.execute(text(stmt))
