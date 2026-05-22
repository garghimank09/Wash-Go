"""Shared demo account emails — OTP and email verification are skipped for these."""

DEMO_EMAILS: frozenset[str] = frozenset(
    {
        "admin@washgo.demo",
        "customer@washgo.demo",
        "partner@washgo.demo",
    }
)


def is_demo_email(email: str) -> bool:
    return email.strip().lower() in DEMO_EMAILS
