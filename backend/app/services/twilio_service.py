"""Send OTP SMS via Twilio REST API."""

from __future__ import annotations

import logging
import re

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

_PURPOSE_COPY = {
    "signup": "complete your WashGo registration",
    "login": "sign in to WashGo",
    "password_reset": "reset your WashGo password",
}


def normalize_phone_e164(phone: str | None) -> str:
    """Normalize stored phone to E.164 (India +91 when 10 digits)."""
    if not phone or not str(phone).strip():
        raise ValueError("Phone number is required")

    raw = str(phone).strip()
    if raw.startswith("+"):
        digits = re.sub(r"\D", "", raw)
        if len(digits) < 10:
            raise ValueError("Invalid phone number")
        return f"+{digits}"

    digits = re.sub(r"\D", "", raw)
    if digits.startswith("91") and len(digits) == 12:
        return f"+{digits}"
    if len(digits) == 10:
        return f"+91{digits}"
    raise ValueError("Invalid phone number")


def mask_phone_e164(e164: str) -> str:
    """Display-safe mask, e.g. +91 •••••3210."""
    digits = re.sub(r"\D", "", e164)
    if len(digits) < 4:
        return "your phone"
    last4 = digits[-4:]
    if digits.startswith("91") and len(digits) >= 12:
        return f"+91 •••••{last4}"
    return f"•••••{last4}"


def send_otp_sms(to_e164: str, code: str, *, purpose: str) -> bool:
    """
    Send OTP via Twilio SMS.
    Returns True when Twilio accepted the message.
    When Twilio is not configured, logs the code (dev) and returns False.
    """
    action = _PURPOSE_COPY.get(purpose, "verify your account")
    body = f"Your WashGo verification code is {code}. Use it to {action}. Expires in {settings.OTP_EXPIRE_MINUTES} min."

    sid = (settings.TWILIO_ACCOUNT_SID or "").strip()
    token = (settings.TWILIO_AUTH_TOKEN or "").strip()
    from_number = (settings.TWILIO_FROM_NUMBER or "").strip()

    if not sid or not token or not from_number:
        logger.warning(
            "[OTP SMS — Twilio not configured] to=%s purpose=%s code=%s",
            to_e164,
            purpose,
            code,
        )
        return False

    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                url,
                auth=(sid, token),
                data={"To": to_e164, "From": from_number, "Body": body},
            )
            response.raise_for_status()
        logger.info("OTP SMS sent to %s (purpose=%s)", mask_phone_e164(to_e164), purpose)
        return True
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:500] if exc.response is not None else str(exc)
        logger.error("Twilio HTTP error for %s: %s", mask_phone_e164(to_e164), detail)
        raise RuntimeError("Could not send SMS. Check Twilio credentials and phone number.") from exc
    except Exception as exc:
        logger.exception("Failed to send OTP SMS to %s", mask_phone_e164(to_e164))
        raise RuntimeError("Could not send SMS. Try again later.") from exc
