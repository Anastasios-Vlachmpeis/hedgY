"""Connector protocol + small shared parsing helpers.

A connector is any object with `venue: str` and an async `fetch()` returning a
list of `CanonicalMarket`. A connector logs and then RE-RAISES venue errors; the
orchestrator (`refresh_once`) provides isolation via
`asyncio.gather(..., return_exceptions=True)` and records the error per venue in
`/health`. So one venue failing never takes down the other — the boundary is the
gather, not the connector. Within a venue, a single malformed market is skipped
(per-item guard) rather than dropping the whole batch.
"""

from __future__ import annotations

import logging
import math
from datetime import datetime, timezone
from typing import Protocol, runtime_checkable

import httpx

from app.models import CanonicalMarket

logger = logging.getLogger("connectors")


@runtime_checkable
class Connector(Protocol):
    venue: str

    async def fetch(self) -> list[CanonicalMarket]:
        """Return normalized markets. MAY raise on venue errors; the orchestrator
        isolates failures via asyncio.gather(return_exceptions=True)."""
        ...


def canonical_id(venue: str, venue_market_id: str) -> str:
    return f"{venue}:{venue_market_id}"


def safe_float(value: object, default: float = 0.0) -> float:
    """Parse Kalshi/Polymarket numeric-or-string fields without throwing.

    Non-finite results (NaN/inf, e.g. from a literal 'NaN' string) collapse to
    `default` so they cannot poison downstream math or violate price bounds.
    """
    if value is None:
        return default
    try:
        result = float(value)
    except (TypeError, ValueError):
        return default
    return result if math.isfinite(result) else default


def clamp_price(value: float) -> float:
    """Keep a probability price inside [0, 1] (defends against bad upstream data)."""
    if not math.isfinite(value):
        return 0.0
    if value < 0.0:
        return 0.0
    if value > 1.0:
        return 1.0
    return value


def parse_dt(value: object) -> datetime | None:
    """Parse an ISO-8601 timestamp (with or without trailing 'Z') to aware UTC."""
    if not value or not isinstance(value, str):
        return None
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(text)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def make_async_client(timeout_seconds: float, user_agent: str) -> httpx.AsyncClient:
    return httpx.AsyncClient(
        timeout=httpx.Timeout(timeout_seconds),
        headers={"User-Agent": user_agent, "Accept": "application/json"},
        follow_redirects=True,
    )
