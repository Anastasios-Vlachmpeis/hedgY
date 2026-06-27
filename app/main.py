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
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

from app.account import account_service, place_alpaca_order, stock_price
from app.config import settings
from app.connectors import KalshiConnector, PolymarketConnector
from app.connectors.base import Connector
from app.matching import cluster
from app.models import HealthResponse, UnifiedMarket, UnifiedMarketDetail
from app.store import store
from structuring.service import suggest_hedges

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


@app.get("/suggestions")
def suggestions(
    notional: float = Query(default=10_000.0, gt=0, le=10_000_000),
) -> list[dict]:
    """Live hedge suggestions (P2 structuring).

    Matches each starter template to a live unified market, sizes the hedge, and
    returns one suggestion per template (``matched=False`` when no live market is
    found). Wraps ``structuring.service.suggest_hedges`` over the current store
    snapshot. Read-only / suggestion-only, like the rest of the service.
    """
    markets = [m.model_dump() for m in store.list_unified()]
    return suggest_hedges(markets, notional=notional)


# --------------------------------------------------------------------------- #
# Paper-trading account (the $1000 wallet).                                     #
# Stocks execute on Alpaca paper; predictions fill in-app at live odds.         #
# --------------------------------------------------------------------------- #
class DepositRequest(BaseModel):
    amount: float = Field(default=settings.default_deposit, gt=0, le=10_000_000)


class OrderRequest(BaseModel):
    kind: Literal["stock", "prediction"]
    action: Literal["buy", "sell"] = "buy"
    notionalUsd: float = Field(gt=0, le=10_000_000)
    symbol: str | None = None      # stocks
    market_id: str | None = None   # predictions (unified market id)
    side: Literal["YES", "NO"] | None = None  # predictions


def _prediction_price(market_id: str, side: str) -> tuple[float | None, str | None]:
    """(live side price, question) for a unified market id, from the live store."""
    detail = store.get_unified_detail(market_id)
    if detail is None:
        return None, None
    quote = detail.best_yes if side == "YES" else detail.best_no
    return (quote.price if quote else None), detail.canonical_question


def _mark(position: dict) -> float | None:
    """Current price for a held position (stock → Alpaca, prediction → store)."""
    if position["kind"] == "stock":
        return stock_price(position["symbol"])
    price, _ = _prediction_price(position["market_id"], position["side"])
    return price


@app.get("/account")
def get_account() -> dict:
    return account_service.account(_mark)


@app.get("/positions")
def get_positions() -> list[dict]:
    return account_service.positions_marked(_mark)


@app.get("/trades")
def get_trades() -> list[dict]:
    return account_service.trades()


@app.post("/account/deposit")
def deposit(req: DepositRequest) -> dict:
    account_service.deposit(req.amount)
    return account_service.account(_mark)


@app.post("/account/reset")
def reset_account() -> dict:
    account_service.reset()
    return account_service.account(_mark)


@app.post("/orders")
def create_order(req: OrderRequest) -> dict:
    if req.kind == "stock":
        if not req.symbol:
            raise HTTPException(status_code=422, detail="stock order requires 'symbol'")
        price = stock_price(req.symbol)
        if price is None:
            raise HTTPException(status_code=503, detail=f"no live price for {req.symbol}")
        order_id = place_alpaca_order(req.symbol, req.notionalUsd, req.action)
        try:
            return account_service.place_order(
                kind="stock", action=req.action, notional=req.notionalUsd, price=price,
                symbol=req.symbol.upper(), label=req.symbol.upper(), alpaca_order_id=order_id,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    # prediction
    if not req.market_id or req.side not in ("YES", "NO"):
        raise HTTPException(status_code=422, detail="prediction order requires 'market_id' and side YES|NO")
    price, question = _prediction_price(req.market_id, req.side)
    if price is None:
        raise HTTPException(status_code=503, detail="no live price for that market/side")
    try:
        return account_service.place_order(
            kind="prediction", action=req.action, notional=req.notionalUsd, price=price,
            market_id=req.market_id, side=req.side, label=question,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/")
async def root() -> dict:
    return {
        "service": "prediction-market-aggregator",
        "mode": "read-only (suggestions only)",
        "endpoints": [
            "/markets", "/markets/{id}", "/suggestions", "/health",
            "/account", "/positions", "/trades",
            "/account/deposit", "/account/reset", "/orders",
        ],
        "has_data": store.has_data,
    }
