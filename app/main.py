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
    order_type: Literal["market", "limit"] = "market"  # stocks
    limit_price: float | None = None                   # stocks (limit only)
    market_id: str | None = None   # predictions (unified market id)
    side: Literal["YES", "NO"] | None = None  # predictions
    venue: str | None = None       # predictions: bet at this venue's price (kalshi|polymarket)


class CombinedEquityLeg(BaseModel):
    symbol: str
    notionalUsd: float = Field(gt=0, le=10_000_000)
    action: Literal["buy", "sell"] = "buy"
    order_type: Literal["market", "limit"] = "market"
    limit_price: float | None = None


class CombinedHedgeLeg(BaseModel):
    market_id: str
    side: Literal["YES", "NO"]
    notionalUsd: float = Field(gt=0, le=10_000_000)
    venue: str | None = None
    # Curated combos (the /hedge analyst pairs) carry no live market: the caller
    # supplies the contract price (0..1) and a human label directly.
    price: float | None = Field(default=None, ge=0, le=1)
    label: str | None = None


class CombinedOrderRequest(BaseModel):
    """An equity exposure paired with a prediction-market hedge, placed as one
    grouped position (both legs share a group_id in the ledger)."""

    equity: CombinedEquityLeg
    hedge: CombinedHedgeLeg


def _prediction_price(market_id: str, side: str, venue: str | None = None) -> tuple[float | None, str | None]:
    """(live side price, question) for a unified market id, from the live store.

    When `venue` is given, price at THAT venue's member market; otherwise use the
    best price across venues.
    """
    detail = store.get_unified_detail(market_id)
    if detail is None:
        return None, None
    if venue:
        member = next((m for m in detail.member_markets if m.venue == venue), None)
        if member is not None:
            return (member.yes_price if side == "YES" else member.no_price), detail.canonical_question
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
    summary = account_service.account(_mark)
    account_service.record_equity(summary["equity"])  # throttled — builds the real P&L curve
    return summary


@app.get("/account/history")
def account_history() -> list[dict]:
    return account_service.equity_history()


@app.get("/positions")
def get_positions() -> list[dict]:
    return account_service.positions_marked(_mark)


@app.get("/trades")
def get_trades() -> list[dict]:
    return account_service.trades()


@app.post("/account/deposit")
def deposit(req: DepositRequest) -> dict:
    account_service.deposit(req.amount)
    summary = account_service.account(_mark)
    account_service.record_equity(summary["equity"], force=True)
    return summary


@app.post("/account/reset")
def reset_account() -> dict:
    account_service.reset()
    return account_service.account(_mark)


@app.post("/orders")
def create_order(req: OrderRequest) -> dict:
    if req.kind == "stock":
        if not req.symbol:
            raise HTTPException(status_code=422, detail="stock order requires 'symbol'")
        if req.order_type == "limit":
            if not req.limit_price or req.limit_price <= 0:
                raise HTTPException(status_code=422, detail="limit order requires a positive 'limit_price'")
            price = req.limit_price  # ledger fills at the limit price
        else:
            price = stock_price(req.symbol)
            if price is None:
                raise HTTPException(status_code=503, detail=f"no live price for {req.symbol}")
        order_id = place_alpaca_order(req.symbol, req.notionalUsd, req.action, req.order_type, req.limit_price)
        try:
            result = account_service.place_order(
                kind="stock", action=req.action, notional=req.notionalUsd, price=price,
                symbol=req.symbol.upper(), label=req.symbol.upper(), alpaca_order_id=order_id,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        account_service.record_equity(account_service.account(_mark)["equity"], force=True)
        return result

    # prediction
    if not req.market_id or req.side not in ("YES", "NO"):
        raise HTTPException(status_code=422, detail="prediction order requires 'market_id' and side YES|NO")
    price, question = _prediction_price(req.market_id, req.side, req.venue)
    if price is None:
        raise HTTPException(status_code=503, detail="no live price for that market/side")
    try:
        result = account_service.place_order(
            kind="prediction", action=req.action, notional=req.notionalUsd, price=price,
            market_id=req.market_id, side=req.side, label=question,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    account_service.record_equity(account_service.account(_mark)["equity"], force=True)
    return result


@app.post("/orders/combined")
def create_combined_order(req: CombinedOrderRequest) -> dict:
    """Place an equity leg and a prediction hedge as one grouped position."""
    import uuid

    group_id = f"grp-{uuid.uuid4().hex[:12]}"
    eq, hg = req.equity, req.hedge

    # ── price both legs up front ───────────────────────────────────────────
    if eq.order_type == "limit":
        if not eq.limit_price or eq.limit_price <= 0:
            raise HTTPException(status_code=422, detail="limit order requires a positive 'limit_price'")
        eq_price = eq.limit_price
    else:
        eq_price = stock_price(eq.symbol)
        if eq_price is None:
            raise HTTPException(status_code=503, detail=f"no live price for {eq.symbol}")

    if hg.price is not None and hg.price > 0:
        # Curated combo: trust the caller-supplied contract price + label.
        hg_price, question = hg.price, (hg.label or hg.market_id)
    else:
        hg_price, question = _prediction_price(hg.market_id, hg.side, hg.venue)
        if hg_price is None:
            raise HTTPException(status_code=503, detail="no live price for that market/side")

    # ── pre-check funds so we never half-fill a combined position ──────────
    needed = (eq.notionalUsd if eq.action == "buy" else 0.0) + hg.notionalUsd
    buying_power = account_service.account(_mark)["buying_power"]
    if needed > buying_power + 1e-9:
        raise HTTPException(
            status_code=400,
            detail=f"insufficient funds: need ${needed:,.2f}, have ${buying_power:,.2f}",
        )

    # ── place both legs under the shared group_id ─────────────────────────
    order_id = place_alpaca_order(eq.symbol, eq.notionalUsd, eq.action, eq.order_type, eq.limit_price)
    try:
        equity_res = account_service.place_order(
            kind="stock", action=eq.action, notional=eq.notionalUsd, price=eq_price,
            symbol=eq.symbol.upper(), label=eq.symbol.upper(), alpaca_order_id=order_id, group_id=group_id,
        )
        hedge_res = account_service.place_order(
            kind="prediction", action="buy", notional=hg.notionalUsd, price=hg_price,
            market_id=hg.market_id, side=hg.side, label=question, group_id=group_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    account_service.record_equity(account_service.account(_mark)["equity"], force=True)
    return {"group_id": group_id, "equity": equity_res, "hedge": hedge_res}


@app.get("/")
async def root() -> dict:
    return {
        "service": "prediction-market-aggregator",
        "mode": "read-only (suggestions only)",
        "endpoints": [
            "/markets", "/markets/{id}", "/suggestions", "/health",
            "/account", "/account/history", "/positions", "/trades",
            "/account/deposit", "/account/reset", "/orders",
        ],
        "has_data": store.has_data,
    }
