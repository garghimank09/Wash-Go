"""HttpOnly session cookies — used with Bearer token and CORS credentials."""

from fastapi import Response

from app.config.settings import settings

CUSTOMER_COOKIE = "washgo_access_token"
PARTNER_COOKIE = "washgo_partner_token"


def _cookie_max_age_seconds() -> int:
    return max(60, int(settings.ACCESS_TOKEN_EXPIRE_MINUTES) * 60)


def _cookie_kwargs() -> dict:
    secure = settings.AUTH_COOKIE_SECURE
    samesite = settings.AUTH_COOKIE_SAMESITE.lower()
    if samesite not in ("lax", "strict", "none"):
        samesite = "lax"
    if samesite == "none" and not secure:
        secure = True
    return {
        "httponly": True,
        "secure": secure,
        "samesite": samesite,
        "path": "/",
        "max_age": _cookie_max_age_seconds(),
    }


def set_customer_auth_cookie(response: Response, access_token: str) -> None:
    response.set_cookie(key=CUSTOMER_COOKIE, value=access_token, **_cookie_kwargs())


def set_partner_auth_cookie(response: Response, access_token: str) -> None:
    response.set_cookie(key=PARTNER_COOKIE, value=access_token, **_cookie_kwargs())


def clear_customer_auth_cookie(response: Response) -> None:
    response.delete_cookie(key=CUSTOMER_COOKIE, path="/")


def clear_partner_auth_cookie(response: Response) -> None:
    response.delete_cookie(key=PARTNER_COOKIE, path="/")


def clear_all_auth_cookies(response: Response) -> None:
    clear_customer_auth_cookie(response)
    clear_partner_auth_cookie(response)


def token_from_cookies(cookies: dict) -> str | None:
    return cookies.get(CUSTOMER_COOKIE) or cookies.get(PARTNER_COOKIE)
