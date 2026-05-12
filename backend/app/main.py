from contextlib import asynccontextmanager

import app.models  # noqa: F401 — register ORM mappers before metadata operations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.database.database import Base, engine
from app.routes import assistant_routes, auth_routes, booking_routes, cars_routes, pricing_routes, user_routes
from app.utils.exceptions import register_exception_handlers


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.ENVIRONMENT == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
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

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(cars_routes.router)
app.include_router(booking_routes.router)
app.include_router(pricing_routes.router)
app.include_router(assistant_routes.router)


@app.get("/health", tags=["System"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "washgo-api"}
