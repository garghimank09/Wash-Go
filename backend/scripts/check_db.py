"""One-off connectivity check: loads backend .env and pings PostgreSQL."""
import asyncio
import sys
from pathlib import Path

# Allow `python scripts/check_db.py` from repo without PYTHONPATH
_root = Path(__file__).resolve().parents[1]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from sqlalchemy import text

from app.database.database import engine


async def main() -> None:
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            val = result.scalar()
        await engine.dispose()
    except Exception as e:
        print("DB_FAIL", type(e).__name__, str(e)[:200])
        sys.exit(1)
    print("DB_OK", val)


if __name__ == "__main__":
    asyncio.run(main())
