import logging
from contextlib import asynccontextmanager
from pathlib import Path

import app.models  # noqa: F401 — register ORM mappers before metadata operations

logger = logging.getLogger(__name__)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.settings import settings
from sqlalchemy import text

from app.database.database import Base, async_session_maker, engine
from app.routes import (
    assistant_routes,
    auth_routes,
    booking_routes,
    cars_routes,
    geocode_routes,
    places_routes,
    partner_routes,
    pricing_routes,
    user_routes,
    membership_plan_routes,
    user_membership_routes,
    notification_routes,
    wash_tier_routes,
)
from app.utils.seed_demo_users import seed_demo_users
from app.utils.seed_membership_plans import ensure_membership_plan_columns, seed_membership_plans_if_empty
from app.utils.seed_wash_tiers import seed_wash_tiers_if_empty
from app.utils.exceptions import register_exception_handlers


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.ENVIRONMENT == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await ensure_membership_plan_columns(conn)
            await conn.execute(
                text(
                    "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_phase VARCHAR(64)"
                )
            )
        try:
            async with engine.begin() as conn:
                await conn.execute(
                    text("ALTER TYPE otp_purpose ADD VALUE IF NOT EXISTS 'password_reset'")
                )
        except Exception:
            logger.debug("otp_purpose enum already includes password_reset or DB is fresh", exc_info=True)
        async with async_session_maker() as db:
            await seed_wash_tiers_if_empty(db)
            await seed_membership_plans_if_empty(db)
            await seed_demo_users(db)
    yield
    await engine.dispose()


app = FastAPI(
    title="WashGo API",
    description="AI-powered on-demand car washing platform — Day 1 backend foundation.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

_cors = settings.CORS_ORIGINS.strip()
_allow_origins = ["*"] if _cors == "*" else [o.strip() for o in _cors.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

_upload_root = Path(settings.UPLOAD_DIR)
_upload_root.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(_upload_root)), name="media")

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(cars_routes.router)
app.include_router(booking_routes.router)
app.include_router(partner_routes.router)
app.include_router(pricing_routes.router)
app.include_router(wash_tier_routes.router)
app.include_router(membership_plan_routes.router)
app.include_router(user_membership_routes.router)
app.include_router(notification_routes.router)
app.include_router(geocode_routes.router)
app.include_router(places_routes.router)
app.include_router(assistant_routes.router)


@app.get("/health", tags=["System"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "washgo-api"}
