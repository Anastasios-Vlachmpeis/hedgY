"""Runtime settings. Override any field via an env var of the same name."""

from __future__ import annotations

import os

from pydantic import BaseModel, Field


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def _env_int(name: str, default: int, lo: int, hi: int) -> int:
    raw = os.getenv(name)
    value = int(raw) if raw and raw.strip() else default
    return int(_clamp(value, lo, hi))


def _env_float(name: str, default: float, lo: float, hi: float) -> float:
    raw = os.getenv(name)
    value = float(raw) if raw and raw.strip() else default
    return _clamp(value, lo, hi)


def _env_str(name: str, default: str) -> str:
    raw = os.getenv(name)
    return raw if raw and raw.strip() else default


class Settings(BaseModel):
    # Refresh loop
    refresh_interval_seconds: int = Field(default=60, ge=5)

    # Per-venue fetch shaping
    fetch_limit: int = Field(default=150, ge=1, le=5000)        # top-N markets per venue
    kalshi_event_pages: int = Field(default=10, ge=1, le=50)    # event pages (200/page)
    http_timeout_seconds: float = Field(default=10.0, gt=0.0, le=120.0)
    user_agent: str = "paris-prediction-aggregator/0.1 (+read-only)"

    # Endpoints (read-only, no API key required)
    kalshi_base_url: str = "https://external-api.kalshi.com/trade-api/v2"
    polymarket_base_url: str = "https://gamma-api.polymarket.com"

    # Matching
    match_threshold: float = Field(default=0.85, ge=0.0, le=1.0)  # difflib ratio cutoff

    @classmethod
    def load(cls) -> "Settings":
        # Env values are clamped to safe ranges BEFORE validation so a config typo
        # (e.g. REFRESH_INTERVAL_SECONDS=0 → tight venue-hammering loop) cannot slip
        # through; the Field bounds still guard any direct programmatic construction.
        return cls(
            refresh_interval_seconds=_env_int("REFRESH_INTERVAL_SECONDS", 60, 5, 86_400),
            fetch_limit=_env_int("FETCH_LIMIT", 150, 1, 5000),
            kalshi_event_pages=_env_int("KALSHI_EVENT_PAGES", 10, 1, 50),
            http_timeout_seconds=_env_float("HTTP_TIMEOUT_SECONDS", 10.0, 1.0, 120.0),
            user_agent=_env_str("USER_AGENT", "paris-prediction-aggregator/0.1 (+read-only)"),
            kalshi_base_url=_env_str("KALSHI_BASE_URL", "https://external-api.kalshi.com/trade-api/v2"),
            polymarket_base_url=_env_str("POLYMARKET_BASE_URL", "https://gamma-api.polymarket.com"),
            match_threshold=_env_float("MATCH_THRESHOLD", 0.85, 0.0, 1.0),
        )


settings = Settings.load()
