from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = Field(
        ...,
        description="Async SQLAlchemy URL, e.g. postgresql+asyncpg://user:pass@localhost:5432/washgo",
    )
    SECRET_KEY: str = Field(..., min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    ENVIRONMENT: str = "development"
    # Allow any authenticated user to call admin console APIs in non-production (matches VITE_ADMIN_UI_DEMO).
    ADMIN_UI_DEMO_ALLOW: bool = True
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    AI_PROVIDER: str = "ollama"
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    CORS_ORIGINS: str = "*"
    BOOKING_SYNC_POLL_SECONDS: float = 4.0
    UPLOAD_DIR: str = "uploads"
    BOOKING_PHOTO_MAX_BYTES: int = 5 * 1024 * 1024
    # Email verification links point here (no trailing slash).
    FRONTEND_BASE_URL: str = "http://127.0.0.1:5173"
    EMAIL_VERIFY_TOKEN_MINUTES: int = 60 * 48
    OTP_LENGTH: int = 6
    OTP_EXPIRE_MINUTES: int = 10
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    # Optional SMTP — if SMTP_HOST is unset, OTP codes are logged only (dev-friendly).
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM: str | None = None
    GOOGLE_MAPS_API_KEY: str | None = None

    @field_validator("DATABASE_URL")
    @classmethod
    def ensure_async_driver(cls, v: str) -> str:
        if v.startswith("postgresql://") and "+asyncpg" not in v:
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
