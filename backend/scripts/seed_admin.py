"""Create or refresh default admin user."""

import asyncio

from app.database.database import async_session_maker
from app.services import user_service


async def main() -> None:
    async with async_session_maker() as db:
        await user_service.ensure_default_admin(db)
    print("Admin user ready:", "admin@gmail.com")


if __name__ == "__main__":
    asyncio.run(main())
