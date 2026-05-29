"""Shared demo accounts — OTP verification is skipped for these emails or phones."""

DEMO_EMAILS: frozenset[str] = frozenset(
    {
        "admin@washgo.demo",
        "customer@washgo.demo",
        "partner@washgo.demo",
    }
)

DEMO_PHONES: frozenset[str] = frozenset(
    {
        "9876543210",  # admin
        "9876543211",  # customer
        "9876543212",  # partner
    }
)


def _normalize_phone_digits(phone: str) -> str:
    import re

    digits = re.sub(r"\D", "", phone or "")
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    return digits


def is_demo_email(email: str) -> bool:
    return email.strip().lower() in DEMO_EMAILS


def is_demo_phone(phone: str) -> bool:
    return _normalize_phone_digits(phone) in DEMO_PHONES


def is_demo_account(*, email: str | None = None, phone: str | None = None) -> bool:
    if email and is_demo_email(email):
        return True
    if phone and is_demo_phone(phone):
        return True
    return False
