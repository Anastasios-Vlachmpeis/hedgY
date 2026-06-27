"""Kalshi connector.

We read the EVENTS endpoint (not /markets) because that is where the
human-readable question lives:

    GET {base}/events?status=open&with_nested_markets=true&limit=...

Each event carries a clean `title` + `category` and nests its markets. A market's
`title` is usually the full question; for multi-outcome events the candidate sits
in `yes_sub_title`, which we append so each outcome is a distinct, matchable
question (and so 7 "Who will the next Pope be?" markets don't collapse into one).
Reading /markets directly instead surfaces multivariate parlay combos whose
titles are junk for cross-venue matching.

Prices are fixed-point dollar STRINGS in *_dollars fields ("0.5500"). YES + NO
sum to 1, so we derive a single fair yes_price and set no = 1 - yes. We keep the
top-N markets by volume for a fast demo load. No API key required.
"""

from __future__ import annotations

import logging

from app.config import settings
from app.connectors.base import (
    canonical_id,
    clamp_price,
    make_async_client,
    parse_dt,
    safe_float,
)
from app.models import CanonicalMarket
from app.taxonomy import infer_category, infer_country, infer_theme, map_native_category

logger = logging.getLogger("connectors.kalshi")

_ACTIVE_STATUSES = {"active", "open"}


class KalshiConnector:
    venue = "kalshi"

    def __init__(self) -> None:
        self.base_url = settings.kalshi_base_url.rstrip("/")
        self.event_pages = settings.kalshi_event_pages
        self.keep_top = settings.fetch_limit

    async def fetch(self) -> list[CanonicalMarket]:
        try:
            events = await self._fetch_events()
        except Exception as exc:  # noqa: BLE001 — log + re-raise; refresh_once isolates
            logger.warning("kalshi fetch failed: %s", exc)
            raise

        markets: list[CanonicalMarket] = []
        for event in events:
            if not isinstance(event, dict):
                continue
            for raw_market in event.get("markets") or []:
                if not isinstance(raw_market, dict):
                    continue
                try:
                    normalized = self._normalize(event, raw_market)
                except Exception as exc:  # noqa: BLE001 — one bad row can't drop the batch
                    logger.warning("skipping bad kalshi market: %s", exc)
                    continue
                if normalized is not None:
                    markets.append(normalized)

        markets.sort(key=lambda m: m.volume, reverse=True)
        return markets[: self.keep_top]

    async def _fetch_events(self) -> list[dict]:
        """Cursor-paginate the events feed with a hard page cap."""
        collected: list[dict] = []
        cursor: str | None = None

        async with make_async_client(
            settings.http_timeout_seconds, settings.user_agent
        ) as client:
            for _ in range(self.event_pages):
                params: dict[str, object] = {
                    "status": "open",
                    "with_nested_markets": "true",
                    "limit": 200,
                }
                if cursor:
                    params["cursor"] = cursor
                resp = await client.get(f"{self.base_url}/events", params=params)
                resp.raise_for_status()
                payload = resp.json()
                page = payload.get("events") or []
                collected.extend(page)
                cursor = payload.get("cursor") or None
                if not cursor or not page:
                    break
        return collected

    def _normalize(self, event: dict, item: dict) -> CanonicalMarket | None:
        # Skip multivariate / combo parlay markets — their titles are leg lists.
        if item.get("mve_selected_legs") or "MVE" in (item.get("event_ticker") or ""):
            return None
        if item.get("status") not in _ACTIVE_STATUSES:
            return None

        ticker = item.get("ticker")
        if not ticker:
            return None

        question = self._build_question(event, item)
        if not question:
            return None

        yes_price = self._derive_yes_price(item)
        if yes_price is None:
            return None  # provisional/illiquid market with no real price signal
        no_price = clamp_price(1.0 - yes_price)

        event_ticker = event.get("event_ticker") or item.get("event_ticker")
        native_category = event.get("category")
        rules = item.get("rules_primary") or ""
        secondary = item.get("rules_secondary") or ""
        resolution = (rules + ("\n\n" + secondary if secondary else "")).strip() or None

        category = infer_category(question, ticker, event_ticker) or map_native_category(
            native_category
        )

        return CanonicalMarket(
            id=canonical_id(self.venue, ticker),
            venue=self.venue,
            venue_market_id=ticker,
            question=question,
            resolution_criteria=resolution,
            yes_price=yes_price,
            no_price=no_price,
            category=category,
            tags=[],
            country=infer_country(question, event_ticker),
            theme=infer_theme(question, event_ticker),
            close_time=parse_dt(item.get("close_time")),
            volume=safe_float(item.get("volume_fp")) or safe_float(item.get("volume")),
            liquidity=safe_float(item.get("liquidity_dollars"))
            or safe_float(item.get("liquidity")),
            deep_link=f"https://kalshi.com/markets/{event_ticker}" if event_ticker else None,
            updated_at=parse_dt(item.get("updated_time") or event.get("last_updated_ts")),
        )

    @staticmethod
    def _build_question(event: dict, item: dict) -> str:
        """Full question text: market title, plus the outcome label when needed."""
        title = (item.get("title") or event.get("title") or "").strip()
        sub = (item.get("yes_sub_title") or "").strip()
        multi = len(event.get("markets") or []) > 1
        if multi and sub and sub.lower() not in title.lower():
            return f"{title} {sub}".strip()
        return title

    @staticmethod
    def _derive_yes_price(item: dict) -> float | None:
        """Single fair YES price from bid/ask/last; None if no real signal."""
        yes_bid = safe_float(item.get("yes_bid_dollars"))
        yes_ask = safe_float(item.get("yes_ask_dollars"))
        last = safe_float(item.get("last_price_dollars"))

        if yes_bid > 0.0 and yes_ask > 0.0:
            price = (yes_bid + yes_ask) / 2.0
        elif last > 0.0:
            price = last
        elif yes_ask > 0.0:
            price = yes_ask
        elif yes_bid > 0.0:
            price = yes_bid
        else:
            return None
        return clamp_price(price)
