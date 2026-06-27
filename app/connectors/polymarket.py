"""Polymarket (Gamma API) connector.

Endpoint: GET {base}/markets?active=true&closed=false&limit=...  (public, no key)
GOTCHA: `outcomes`, `outcomePrices`, `clobTokenIds` come back as JSON-ENCODED
STRINGS, not arrays — json.loads() them before indexing. We take the YES price
from outcomePrices (located by matching the "Yes" outcome label, which also
neutralizes inverted Yes/No ordering at the source). Server-side volume ordering
gives us the top-N directly.
"""

from __future__ import annotations

import json
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
from app.taxonomy import infer_category, infer_country, infer_theme

logger = logging.getLogger("connectors.polymarket")


class PolymarketConnector:
    venue = "polymarket"

    def __init__(self) -> None:
        self.base_url = settings.polymarket_base_url.rstrip("/")
        self.limit = settings.fetch_limit

    async def fetch(self) -> list[CanonicalMarket]:
        try:
            raw = await self._fetch_raw()
        except Exception as exc:  # noqa: BLE001 — log + re-raise; refresh_once isolates
            logger.warning("polymarket fetch failed: %s", exc)
            raise

        markets: list[CanonicalMarket] = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            try:
                normalized = self._normalize(item)
            except Exception as exc:  # noqa: BLE001 — one bad row can't drop the batch
                logger.warning("skipping bad polymarket market: %s", exc)
                continue
            if normalized is not None:
                markets.append(normalized)
        return markets

    async def _fetch_raw(self) -> list[dict]:
        """Volume-ordered fetch. Gamma caps a page at 100, so we offset-paginate."""
        page_size = 100
        collected: list[dict] = []
        async with make_async_client(
            settings.http_timeout_seconds, settings.user_agent
        ) as client:
            offset = 0
            while len(collected) < self.limit:
                params = {
                    "active": "true",
                    "closed": "false",
                    "limit": page_size,
                    "offset": offset,
                    "order": "volumeNum",
                    "ascending": "false",
                }
                resp = await client.get(f"{self.base_url}/markets", params=params)
                resp.raise_for_status()
                payload = resp.json()
                # Gamma returns a bare list; tolerate a {"data": [...]} envelope too.
                page = payload.get("data") if isinstance(payload, dict) else payload
                page = page or []
                collected.extend(page)
                if len(page) < page_size:
                    break
                offset += page_size
        return collected[: self.limit]

    def _normalize(self, item: dict) -> CanonicalMarket | None:
        if item.get("closed") is True or item.get("active") is False:
            return None

        condition_id = item.get("conditionId") or item.get("id")
        question = item.get("question")
        if not condition_id or not question:
            return None

        prices = self._yes_no_prices(item)
        if prices is None:
            return None  # not a clean binary Yes/No market or no price
        yes_price, no_price = prices

        event = (item.get("events") or [{}])[0] if item.get("events") else {}
        event_slug = event.get("slug")
        event_ticker = event.get("ticker")
        market_slug = item.get("slug")
        # Link to the SPECIFIC market, not just its event — otherwise every
        # per-outcome market in a multi-outcome event collapses to one URL.
        if event_slug and market_slug:
            deep_link = f"https://polymarket.com/event/{event_slug}/{market_slug}"
        elif event_slug:
            deep_link = f"https://polymarket.com/event/{event_slug}"
        elif market_slug:
            deep_link = f"https://polymarket.com/market/{market_slug}"
        else:
            deep_link = None

        resolution = item.get("description") or item.get("resolutionSource") or None

        return CanonicalMarket(
            id=canonical_id(self.venue, str(condition_id)),
            venue=self.venue,
            venue_market_id=str(condition_id),
            question=question,
            resolution_criteria=resolution,
            yes_price=yes_price,
            no_price=no_price,
            category=infer_category(question, event_ticker, market_slug),
            tags=[],
            country=infer_country(question, event_ticker),
            theme=infer_theme(question, event_ticker),
            close_time=parse_dt(item.get("endDate") or item.get("endDateIso")),
            volume=safe_float(item.get("volumeNum")) or safe_float(item.get("volume")),
            liquidity=safe_float(item.get("liquidityNum"))
            or safe_float(item.get("liquidity")),
            deep_link=deep_link,
            updated_at=parse_dt(item.get("updatedAt") or item.get("updatedAtIso")),
        )

    @classmethod
    def _yes_no_prices(cls, item: dict) -> tuple[float, float] | None:
        outcomes = cls._as_list(item.get("outcomes"))
        prices = cls._as_list(item.get("outcomePrices"))
        if not outcomes or not prices or len(outcomes) != len(prices):
            return None

        labels = [str(o).strip().lower() for o in outcomes]
        if "yes" not in labels or "no" not in labels or len(labels) != 2:
            return None  # only handle clean binary Yes/No markets for now

        yes_idx = labels.index("yes")
        no_idx = labels.index("no")
        yes_price = clamp_price(safe_float(prices[yes_idx]))
        no_price = clamp_price(safe_float(prices[no_idx]))
        # Prices should sum to ~1; trust YES and derive NO if they drift badly.
        if abs((yes_price + no_price) - 1.0) > 0.05:
            no_price = clamp_price(1.0 - yes_price)
        return yes_price, no_price

    @staticmethod
    def _as_list(value: object) -> list:
        """Gamma encodes arrays as JSON strings; decode defensively."""
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
            except (json.JSONDecodeError, ValueError):
                return []
            return parsed if isinstance(parsed, list) else []
        return []
