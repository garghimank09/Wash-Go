import logging
import smtplib
from email.message import EmailMessage

from app.config.settings import settings

logger = logging.getLogger(__name__)

_PURPOSE_COPY = {
    "signup": "verify your email and complete registration",
    "login": "sign in to your account",
    "password_reset": "reset your password",
}


def _audience_label(role_hint: str | None) -> str:
    if role_hint == "partner":
        return "WashGo Partner"
    if role_hint == "admin":
        return "WashGo Admin"
    return "WashGo"


def send_otp_email(
    to_email: str,
    code: str,
    *,
    purpose: str,
    role_hint: str | None = None,
) -> bool:
    """
    Send a 6-digit OTP email. Returns True if sent via SMTP, False if only logged (dev).
    """
    brand = _audience_label(role_hint)
    action = _PURPOSE_COPY.get(purpose, "continue")
    subject = f"{brand} — your verification code"
    body = (
        f"Hello,\n\n"
        f"Your {brand} verification code is:\n\n"
        f"  {code}\n\n"
        f"Use this code to {action}. It expires in {settings.OTP_EXPIRE_MINUTES} minutes.\n\n"
        f"If you did not request this, you can ignore this email.\n\n"
        f"— {brand}\n"
    )

    if not settings.SMTP_HOST:
        logger.warning(
            "[OTP email — SMTP not configured] to=%s purpose=%s code=%s",
            to_email,
            purpose,
            code,
        )
        return False

    msg = EmailMessage()
    from_addr = settings.SMTP_FROM or settings.SMTP_USER or "noreply@washgo.app"
    msg["From"] = from_addr
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("OTP email sent to %s (purpose=%s)", to_email, purpose)
        return True
    except Exception:
        logger.exception("Failed to send OTP email to %s", to_email)
        raise
