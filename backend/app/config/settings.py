from functools import lru_cache

from pydantic import Field, field_validator, model_validator
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
    # JWT + session cookie lifetime (default 7 days — stay signed in until logout or expiry).
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    AUTH_COOKIE_SECURE: bool = False
    AUTH_COOKIE_SAMESITE: str = "lax"
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
    # Default admin account (created/updated on API startup when ADMIN_SEED_ENABLED=true).
    ADMIN_SEED_ENABLED: bool = True
    ADMIN_SEED_EMAIL: str = "admin@gmail.com"
    ADMIN_SEED_PASSWORD: str = "Admin@123"
    ADMIN_SEED_FULL_NAME: str = "WashGo Admin"
    # Email verification links point here (no trailing slash).
    FRONTEND_BASE_URL: str = "http://127.0.0.1:5173"
    EMAIL_VERIFY_TOKEN_MINUTES: int = 60 * 48
    OTP_LENGTH: int = 6
    OTP_EXPIRE_MINUTES: int = 10
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    # Twilio SMS OTP (all roles — login, signup, password reset).
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_FROM_NUMBER: str | None = None
    # Google Maps Platform — Geocoding on server; Maps/Places use VITE_* on frontend.
    GOOGLE_MAPS_API_KEY: str | None = None

    @field_validator("DATABASE_URL")
    @classmethod
    def ensure_async_driver(cls, v: str) -> str:
        if v.startswith("postgresql://") and "+asyncpg" not in v:
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @model_validator(mode="after")
    def prefer_openai_when_key_present(self) -> "Settings":
        """Use OpenAI when a key is configured and provider was left on Ollama default."""
        key = (self.OPENAI_API_KEY or "").strip()
        provider = self.AI_PROVIDER.lower().strip()
        if key and provider == "ollama":
            self.AI_PROVIDER = "openai"
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
