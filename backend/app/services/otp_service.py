import asyncio
import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.models.auth_otp import AuthOtp, OtpPurpose
from app.services import twilio_service, user_service
from app.utils.demo_accounts import is_demo_account
from app.utils.exceptions import ValidationError

logger = logging.getLogger(__name__)


def _hash_code(email: str, purpose: str, code: str) -> str:
    payload = f"{email.lower()}:{purpose}:{code}:{settings.SECRET_KEY}"
    return hashlib.sha256(payload.encode()).hexdigest()


def _generate_code() -> str:
    return "".join(str(secrets.randbelow(10)) for _ in range(settings.OTP_LENGTH))


async def _resolve_otp_context(
    db: AsyncSession,
    *,
    email: str | None,
    phone: str | None,
    purpose: OtpPurpose,
) -> tuple[str, object | None, str]:
    """Returns (otp_email, account_or_none, sms_phone_digits)."""

    if purpose == OtpPurpose.signup:
        if not email:
            raise ValidationError("Email is required for signup")
        if not phone:
            raise ValidationError("Phone number is required for signup")
        normalized = email.strip().lower()
        if await user_service.get_user_by_email(db, normalized):
            raise ValidationError("Email already registered")
        if await user_service.is_phone_registered(db, phone):
            raise ValidationError("Phone number already registered")
        return normalized, None, phone

    if not phone:
        raise ValidationError("Phone number is required")

    account = await user_service.get_user_by_phone(db, phone)
    if account is None:
        raise ValidationError("No account found for this phone number")
    if not (account.phone and str(account.phone).strip()):
        raise ValidationError("No mobile number on this account.")

    return account.email.lower(), account, account.phone


async def send_otp(
    db: AsyncSession,
    purpose: OtpPurpose,
    *,
    email: str | None = None,
    phone: str | None = None,
    role_hint: str | None = None,
) -> dict:
    del role_hint  # reserved for future SMS templates

    otp_email, account, sms_phone = await _resolve_otp_context(
        db, email=email, phone=phone, purpose=purpose
    )

    if is_demo_account(email=otp_email, phone=phone):
        if purpose == OtpPurpose.password_reset:
            raise ValidationError("Demo accounts cannot reset password. Use Demo1234.")
        return {
            "sent": False,
            "demo_skip": True,
            "message": "Demo accounts do not require SMS verification.",
            "expires_in_seconds": 0,
            "delivery_target": None,
            "account_email": otp_email,
        }

    cooldown = timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)
    recent = await db.execute(
        select(AuthOtp)
        .where(
            AuthOtp.email == otp_email,
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
            AuthOtp.email == otp_email,
            AuthOtp.purpose == purpose,
            AuthOtp.consumed_at.is_(None),
        )
    )

    code = _generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    db.add(
        AuthOtp(
            email=otp_email,
            purpose=purpose,
            code_hash=_hash_code(otp_email, purpose.value, code),
            expires_at=expires_at,
        )
    )
    await db.commit()

    try:
        to_e164 = twilio_service.normalize_phone_e164(sms_phone)
    except ValueError as exc:
        raise ValidationError("Invalid phone number. Enter a valid 10-digit mobile.") from exc

    delivery_target = twilio_service.mask_phone_e164(to_e164)
    try:
        sms_sent = await asyncio.to_thread(
            twilio_service.send_otp_sms,
            to_e164,
            code,
            purpose=purpose.value,
        )
    except RuntimeError as exc:
        raise ValidationError(str(exc)) from exc

    message = (
        f"Verification code sent via SMS to {delivery_target}."
        if sms_sent
        else "Verification code generated. Check server logs (Twilio not configured)."
    )

    return {
        "sent": True,
        "demo_skip": False,
        "message": message,
        "expires_in_seconds": settings.OTP_EXPIRE_MINUTES * 60,
        "delivery_target": delivery_target,
        "account_email": otp_email,
    }


async def require_valid_otp(
    db: AsyncSession,
    email: str,
    purpose: OtpPurpose,
    otp_code: str | None,
    *,
    phone: str | None = None,
) -> None:
    normalized = email.strip().lower()

    if is_demo_account(email=normalized, phone=phone):
        return

    if not otp_code or not otp_code.strip():
        raise ValidationError("Verification code is required")

    code = otp_code.strip()
    if len(code) != settings.OTP_LENGTH or not code.isdigit():
        raise ValidationError(f"Enter the {settings.OTP_LENGTH}-digit verification code")

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
