"""Ollama integration stub for GenAI features (chatbot, insights, reviews, recommendations)."""

from __future__ import annotations

import logging
from typing import Any

import requests

from app.config.settings import settings

logger = logging.getLogger(__name__)


class OllamaService:
    """
    Thin client for Ollama's `POST /api/generate` endpoint.

    Default base URL: http://localhost:11434
    """

    def __init__(self, base_url: str | None = None, timeout_seconds: int = 120) -> None:
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.timeout_seconds = timeout_seconds

    def generate(self, model: str, prompt: str, **extra: Any) -> dict[str, Any]:
        """
        Run a single non-streaming generation.

        Returns the parsed JSON body from Ollama (includes `response`, `model`, etc.).
        """
        url = f"{self.base_url}/api/generate"
        body: dict[str, Any] = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            **extra,
        }
        try:
            response = requests.post(url, json=body, timeout=self.timeout_seconds)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as exc:
            logger.warning("Ollama request failed: %s", exc)
            raise
