"""In-memory market store.

Concurrency model: the background poller builds a brand-new immutable `Snapshot`
and swaps it in with a single attribute assignment (atomic in CPython). Readers
grab the current snapshot reference once and work off it, so they never observe a
half-updated state and never need a lock. An asyncio lock only serializes writers
(there is just one poller today, but this keeps a manual refresh safe).
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime

from app.config import settings
from app.models import (
    CanonicalMarket,
    HealthResponse,
    UnifiedMarket,
    UnifiedMarketDetail,
    VenueHealth,
)


@dataclass(frozen=True)
class Snapshot:
    markets_by_id: dict[str, CanonicalMarket] = field(default_factory=dict)
    unified: tuple[UnifiedMarket, ...] = ()
    unified_by_id: dict[str, UnifiedMarket] = field(default_factory=dict)
    venue_counts: dict[str, int] = field(default_factory=dict)
    venue_errors: dict[str, str | None] = field(default_factory=dict)
    last_refresh: datetime | None = None


class MarketStore:
    def __init__(self) -> None:
        self._snapshot: Snapshot = Snapshot()
        self.write_lock = asyncio.Lock()

    # ---- writes -----------------------------------------------------------
    def replace(
        self,
        canonical_markets: list[CanonicalMarket],
        unified: list[UnifiedMarket],
        venue_counts: dict[str, int],
        venue_errors: dict[str, str | None],
        last_refresh: datetime,
    ) -> None:
        markets_by_id = {m.id: m for m in canonical_markets}
        unified_by_id = {u.id: u for u in unified}
        self._snapshot = Snapshot(
            markets_by_id=markets_by_id,
            unified=tuple(unified),
            unified_by_id=unified_by_id,
            venue_counts=dict(venue_counts),
            venue_errors=dict(venue_errors),
            last_refresh=last_refresh,
        )

    # ---- reads ------------------------------------------------------------
    def list_unified(
        self,
        category: str | None = None,
        country: str | None = None,
        theme: str | None = None,
    ) -> list[UnifiedMarket]:
        snap = self._snapshot
        results = list(snap.unified)

        def keep(u: UnifiedMarket) -> bool:
            if category and (u.category or "").lower() != category.lower():
                return False
            if country and (u.country or "").lower() != country.lower():
                return False
            if theme and (u.theme or "").lower() != theme.lower():
                return False
            return True

        if category or country or theme:
            results = [u for u in results if keep(u)]
        return results

    def get_unified_detail(self, unified_id: str) -> UnifiedMarketDetail | None:
        snap = self._snapshot
        unified = snap.unified_by_id.get(unified_id)
        if unified is None:
            return None
        member_markets = [
            snap.markets_by_id[mid]
            for mid in unified.members
            if mid in snap.markets_by_id
        ]
        return UnifiedMarketDetail(
            **unified.model_dump(),
            member_markets=member_markets,
        )

    def health(self) -> HealthResponse:
        snap = self._snapshot
        venues = {
            venue: VenueHealth(
                market_count=count,
                last_error=snap.venue_errors.get(venue),
            )
            for venue, count in snap.venue_counts.items()
        }
        return HealthResponse(
            status="ok",
            last_refresh=snap.last_refresh,
            refresh_interval_seconds=settings.refresh_interval_seconds,
            total_canonical_markets=len(snap.markets_by_id),
            total_unified_markets=len(snap.unified),
            venues=venues,
        )

    @property
    def has_data(self) -> bool:
        return bool(self._snapshot.markets_by_id)


store = MarketStore()
