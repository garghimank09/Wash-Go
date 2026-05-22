"""Async LLM calls for WashGo assistant (Ollama or OpenAI)."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

WASHGO_SYSTEM_PROMPT = """You are WashGo Assistant, a helpful in-app guide for the WashGo car wash platform.

WashGo lets customers:
- Add vehicles (make, model, year, license plate) under My Cars.
- Book on-demand washes (pick package, vehicle size, service address, date/time).
- View and track bookings (pending, confirmed, in progress, completed, cancelled).
- See estimated prices from the booking flow (packages: basic, deluxe, super_deluxe, premium; sizes: compact, sedan, SUV).

Rules:
- Be concise, friendly, and practical. Use short paragraphs or bullet lists when helpful.
- If the user asks for account-specific data you cannot see, explain they can find it in the app (Dashboard, Bookings, Cars) or support.
- Never invent prices; say estimates depend on package and vehicle size chosen in the booking form.
- Do not claim you can charge cards, dispatch washers, or change live booking state — the app and operations team do that."""

MAX_CONTEXT_MESSAGES = 24


class AssistantLLMError(Exception):
    """Raised when the configured LLM provider cannot return a reply."""


def _messages_for_provider(history: list[dict[str, str]]) -> list[dict[str, str]]:
    trimmed = history[-MAX_CONTEXT_MESSAGES:]
    return [{"role": "system", "content": WASHGO_SYSTEM_PROMPT}, *trimmed]


async def _ollama_chat(messages: list[dict[str, str]]) -> tuple[str, str]:
    base = settings.OLLAMA_BASE_URL.rstrip("/")
    url = f"{base}/api/chat"
    body: dict[str, Any] = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
    }
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(120.0)) as client:
            r = await client.post(url, json=body)
            r.raise_for_status()
            data = r.json()
    except httpx.ConnectError as e:
        logger.warning("Ollama connect error: %s", e)
        raise AssistantLLMError(
            "Cannot reach Ollama. Install from https://ollama.com, run `ollama serve`, "
            f"and pull a model: `ollama pull {settings.OLLAMA_MODEL}`."
        ) from e
    except httpx.HTTPStatusError as e:
        logger.warning("Ollama HTTP error: %s %s", e.response.status_code, e.response.text)
        detail = e.response.text[:500] if e.response.text else str(e)
        raise AssistantLLMError(f"Ollama error ({e.response.status_code}): {detail}") from e
    except httpx.RequestError as e:
        logger.warning("Ollama request error: %s", e)
        raise AssistantLLMError(f"Ollama request failed: {e}") from e

    msg = data.get("message") or {}
    content = (msg.get("content") or "").strip()
    model = str(data.get("model") or settings.OLLAMA_MODEL)
    if not content:
        raise AssistantLLMError("Ollama returned an empty reply. Try another model or prompt.")
    return content, model


async def _openai_chat(messages: list[dict[str, str]]) -> tuple[str, str]:
    key = settings.OPENAI_API_KEY
    if not key or not key.strip():
        raise AssistantLLMError("OPENAI_API_KEY is not set. Add it to .env or use AI_PROVIDER=ollama.")

    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {key.strip()}", "Content-Type": "application/json"}
    body = {
        "model": settings.OPENAI_MODEL,
        "messages": messages,
        "temperature": 0.4,
    }
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(120.0)) as client:
            r = await client.post(url, json=body, headers=headers)
            r.raise_for_status()
            data = r.json()
    except httpx.HTTPStatusError as e:
        err_text = e.response.text[:800] if e.response is not None else ""
        code = e.response.status_code if e.response is not None else "?"
        logger.warning("OpenAI HTTP error: %s %s", code, err_text)
        raise AssistantLLMError(f"OpenAI error ({code}): {err_text or str(e)}") from e
    except httpx.RequestError as e:
        logger.warning("OpenAI request error: %s", e)
        raise AssistantLLMError(f"OpenAI request failed: {e}") from e

    choices = data.get("choices") or []
    if not choices:
        raise AssistantLLMError("OpenAI returned no choices.")
    msg = choices[0].get("message") or {}
    content = (msg.get("content") or "").strip()
    model = str(data.get("model") or settings.OPENAI_MODEL)
    if not content:
        raise AssistantLLMError("OpenAI returned an empty reply.")
    return content, model


async def complete_chat(history: list[dict[str, str]]) -> tuple[str, str]:
    """
    Run one assistant turn. `history` must be prior turns only (user/assistant), no leading system
    (system is injected here). Client-sent system roles should be stripped by the caller.
    """
    messages = _messages_for_provider(history)
    provider = settings.AI_PROVIDER.lower().strip()
    if provider == "openai":
        return await _openai_chat(messages)
    if provider == "ollama":
        return await _ollama_chat(messages)
    raise AssistantLLMError(f"Unknown AI_PROVIDER: {settings.AI_PROVIDER!r}. Use 'ollama' or 'openai'.")
