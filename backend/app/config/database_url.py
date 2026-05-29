"""Normalize Postgres URLs for asyncpg (local + Render)."""


def normalize_database_url(raw: str) -> str:
    url = (raw or "").strip()
    if not url:
        return url
    if url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if "render.com" in url and "ssl=" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}ssl=require"
    return url
