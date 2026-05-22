import asyncio
import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.models.auth_otp import AuthOtp, OtpPurpose
from app.services import email_service, user_service
from app.utils.demo_accounts import is_demo_email
from app.utils.exceptions import ValidationError

logger = logging.getLogger(__name__)


def _hash_code(email: str, purpose: str, code: str) -> str:
    payload = f"{email.lower()}:{purpose}:{code}:{settings.SECRET_KEY}"
    return hashlib.sha256(payload.encode()).hexdigest()


def _generate_code() -> str:
    return "".join(str(secrets.randbelow(10)) for _ in range(settings.OTP_LENGTH))


async def send_otp(
    db: AsyncSession,
    email: str,
    purpose: OtpPurpose,
    *,
    role_hint: str | None = None,
) -> dict:
    normalized = email.strip().lower()

    if is_demo_email(normalized):
        if purpose == OtpPurpose.password_reset:
            raise ValidationError("Demo accounts cannot reset password. Use Demo1234.")
        return {
            "sent": False,
            "demo_skip": True,
            "message": "Demo accounts do not require email verification.",
            "expires_in_seconds": 0,
        }

    if purpose == OtpPurpose.signup:
        existing = await user_service.get_user_by_email(db, normalized)
        if existing is not None:
            raise ValidationError("Email already registered")
    elif purpose in (OtpPurpose.login, OtpPurpose.password_reset):
        existing = await user_service.get_user_by_email(db, normalized)
        if existing is None:
            raise ValidationError("No account found for this email")

    cooldown = timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)
    recent = await db.execute(
        select(AuthOtp)
        .where(
            AuthOtp.email == normalized,
            AuthOtp.purpose == purpose,
            AuthOtp.consumed_at.is_(None),
        )
        .order_by(AuthOtp.created_at.desc())
        .limit(1)
    )
    last = recent.scalar_one_or_none()
    if last is not None:
        created = last.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) - created < cooldown:
            wait = int(
                (cooldown - (datetime.now(timezone.utc) - created)).total_seconds()
            )
            raise ValidationError(f"Please wait {max(wait, 1)} seconds before requesting a new code")

    await db.execute(
        delete(AuthOtp).where(
            AuthOtp.email == normalized,
            AuthOtp.purpose == purpose,
            AuthOtp.consumed_at.is_(None),
        )
    )

    code = _generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    row = AuthOtp(
        email=normalized,
        purpose=purpose,
        code_hash=_hash_code(normalized, purpose.value, code),
        expires_at=expires_at,
    )
    db.add(row)
    await db.commit()

    try:
        smtp_sent = await asyncio.to_thread(
            email_service.send_otp_email,
            normalized,
            code,
            purpose=purpose.value,
            role_hint=role_hint,
        )
    except Exception as exc:
        logger.exception("OTP email delivery failed for %s", normalized)
        raise ValidationError(
            "Could not send verification email. Check SMTP settings or try again later."
        ) from exc
    message = (
        "Verification code sent to your email."
        if smtp_sent
        else "Verification code generated. Check server logs (SMTP not configured)."
    )

    return {
        "sent": True,
        "demo_skip": False,
        "message": message,
        "expires_in_seconds": settings.OTP_EXPIRE_MINUTES * 60,
    }


async def require_valid_otp(
    db: AsyncSession,
    email: str,
    purpose: OtpPurpose,
    otp_code: str | None,
) -> None:
    normalized = email.strip().lower()

    if is_demo_email(normalized):
        return

    if not otp_code or not otp_code.strip():
        raise ValidationError("Verification code is required")

    code = otp_code.strip()
    if len(code) != settings.OTP_LENGTH or not code.isdigit():
        raise ValidationError(f"Enter the {settings.OTP_LENGTH}-digit code from your email")

    result = await db.execute(
        select(AuthOtp)
        .where(
            AuthOtp.email == normalized,
            AuthOtp.purpose == purpose,
            AuthOtp.consumed_at.is_(None),
        )
        .order_by(AuthOtp.created_at.desc())
        .limit(1)
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise ValidationError("No verification code found. Request a new code.")

    expires = row.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires:
        raise ValidationError("Verification code expired. Request a new code.")

    expected = _hash_code(normalized, purpose.value, code)
    if not secrets.compare_digest(row.code_hash, expected):
        raise ValidationError("Invalid verification code")

    row.consumed_at = datetime.now(timezone.utc)
    await db.commit()
