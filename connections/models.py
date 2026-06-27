"""Shared data models for the connections / portfolio layer."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class Holding(BaseModel):
    """One position, normalized across all account types.

    Every connector maps venue-specific data INTO this shape.
    The radar/relationship engine only ever sees Holdings.
    """
    symbol: str
    name: str = ""
    asset_class: Literal["equity", "etf", "option", "crypto", "event_contract", "cash", "other"] = "equity"
    chain: str | None = None                # e.g. "solana", "ethereum", "polygon" (crypto/wallet/PM)
    quantity: float = 0.0
    market_value: float = 0.0               # USD
    cost_basis: float | None = None
    venue: str = ""                         # e.g. "robinhood", "binance", "polymarket", "manual"
    connection_id: str = ""


class Connection(BaseModel):
    """A linked account (one per brokerage/exchange/wallet/PM)."""
    id: str
    user_id: str = "default"
    category: Literal["brokerage", "crypto_exchange", "wallet", "prediction_market", "manual"]
    provider: str                           # "snaptrade", "mesh", "onchain", "polymarket", "kalshi", "manual"
    label: str = ""                         # user-facing, e.g. "My Robinhood"
    status: Literal["active", "error", "disconnected"] = "active"
    scopes: list[str] = Field(default_factory=lambda: ["read"])
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Portfolio(BaseModel):
    """Aggregated holdings across all connections for one user."""
    user_id: str = "default"
    connections: list[Connection] = Field(default_factory=list)
    holdings: list[Holding] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
