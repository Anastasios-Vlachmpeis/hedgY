"""Canonical Pydantic models — the cross-venue contract.

Everything in the service is built off these. Connectors normalize raw venue
payloads INTO `CanonicalMarket`; matching groups them into `UnifiedMarket`.
This is a READ-ONLY suggestion service: no orders, no custody, no settlement.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class CanonicalMarket(BaseModel):
    """One market on one venue, normalized to a shared schema.

    `yes_price` + `no_price` always sum to 1.0 (a single fair price per side).
    """

    id: str = Field(description="Stable id: '{venue}:{venue_market_id}'.")
    venue: str = Field(description="Source venue, e.g. 'kalshi' | 'polymarket'.")
    venue_market_id: str = Field(description="Venue-native id (ticker / conditionId).")
    question: str

    resolution_criteria: str | None = None
    yes_price: float = Field(ge=0.0, le=1.0)
    no_price: float = Field(ge=0.0, le=1.0)

    # Taxonomy — inferred where possible, else None (LLM tagging fills later).
    category: str | None = None
    tags: list[str] = Field(default_factory=list)
    country: str | None = None
    theme: str | None = None

    close_time: datetime | None = None
    volume: float = 0.0
    liquidity: float = 0.0
    deep_link: str | None = None
    updated_at: datetime | None = None


class PriceQuote(BaseModel):
    """Best available price for one side of a unified market."""

    venue: str
    price: float = Field(ge=0.0, le=1.0)
    market_id: str = Field(description="CanonicalMarket id this price came from.")


class UnifiedMarket(BaseModel):
    """A cluster of duplicate markets across venues + the best price per side."""

    id: str
    canonical_question: str
    members: list[str] = Field(description="CanonicalMarket ids in this cluster.")
    best_yes: PriceQuote | None = None
    best_no: PriceQuote | None = None
    match_confidence: float = Field(ge=0.0, le=1.0)

    # Convenience fields for browsing/filtering (taken from the anchor member).
    category: str | None = None
    country: str | None = None
    theme: str | None = None
    venues: list[str] = Field(default_factory=list)


class UnifiedMarketDetail(UnifiedMarket):
    """A unified market with its per-venue member markets fully embedded."""

    member_markets: list[CanonicalMarket] = Field(default_factory=list)


class VenueHealth(BaseModel):
    market_count: int = 0
    last_error: str | None = None


class HealthResponse(BaseModel):
    status: str = "ok"
    last_refresh: datetime | None = None
    refresh_interval_seconds: int
    total_canonical_markets: int = 0
    total_unified_markets: int = 0
    venues: dict[str, VenueHealth] = Field(default_factory=dict)
