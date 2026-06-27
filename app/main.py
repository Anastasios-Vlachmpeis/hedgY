"""FastAPI app: background refresh poller + read-only routes.

READ-ONLY suggestion service. It pulls live markets from Kalshi and Polymarket,
normalizes + clusters them, and serves best-price-per-group over HTTP. No auth,
no orders, no custody — by design.

Run:  uvicorn app.main:app --reload
"""

from __future__ import annotations

import asyncio
import contextlib
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query

from app.config import settings
from app.connectors import KalshiConnector, PolymarketConnector
from app.connectors.base import Connector
from app.matching import cluster
from app.models import HealthResponse, UnifiedMarket, UnifiedMarketDetail
from app.store import store

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("app")

CONNECTORS: list[Connector] = [KalshiConnector(), PolymarketConnector()]


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


async def refresh_once() -> dict[str, int]:
    """Fetch every venue concurrently, cluster, and swap the store snapshot."""
    results = await asyncio.gather(
        *(c.fetch() for c in CONNECTORS), return_exceptions=True
    )

    all_markets = []
    venue_counts: dict[str, int] = {}
    venue_errors: dict[str, str | None] = {}

    for connector, result in zip(CONNECTORS, results):
        if isinstance(result, BaseException):
            venue_counts[connector.venue] = 0
            venue_errors[connector.venue] = f"{type(result).__name__}: {result}"
            logger.warning("venue '%s' failed to refresh: %s", connector.venue, result)
        else:
            venue_counts[connector.venue] = len(result)
            venue_errors[connector.venue] = None
            all_markets.extend(result)

    unified = cluster(all_markets)
    store.replace(all_markets, unified, venue_counts, venue_errors, _now_utc())
    logger.info(
        "refresh complete: %s canonical, %s unified (%s)",
        len(all_markets),
        len(unified),
        ", ".join(f"{v}={c}" for v, c in venue_counts.items()),
    )
    return venue_counts


async def _poller() -> None:
    while True:
        await asyncio.sleep(settings.refresh_interval_seconds)
        async with store.write_lock:
            try:
                await refresh_once()
            except Exception as exc:  # noqa: BLE001 — keep the loop alive
                logger.exception("scheduled refresh raised: %s", exc)


@contextlib.asynccontextmanager
async def lifespan(_app: FastAPI):
    # Prime the store before serving so the first request has real data.
    async with store.write_lock:
        try:
            await refresh_once()
        except Exception as exc:  # noqa: BLE001 — never block startup on venues
            logger.exception("initial refresh failed (serving empty): %s", exc)

    task = asyncio.create_task(_poller(), name="market-poller")
    try:
        yield
    finally:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task


app = FastAPI(
    title="Prediction Market Aggregator",
    version="0.1.0",
    summary="Read-only cross-venue prediction-market aggregator (suggestions only).",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return store.health()


@app.get("/markets", response_model=list[UnifiedMarket])
async def list_markets(
    category: str | None = Query(default=None),
    country: str | None = Query(default=None),
    theme: str | None = Query(default=None),
) -> list[UnifiedMarket]:
    return store.list_unified(category=category, country=country, theme=theme)


@app.get("/markets/{unified_id:path}", response_model=UnifiedMarketDetail)
async def get_market(unified_id: str) -> UnifiedMarketDetail:
    detail = store.get_unified_detail(unified_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"unified market '{unified_id}' not found")
    return detail


@app.get("/")
async def root() -> dict:
    return {
        "service": "prediction-market-aggregator",
        "mode": "read-only (suggestions only)",
        "endpoints": ["/markets", "/markets/{id}", "/health"],
        "has_data": store.has_data,
    }
