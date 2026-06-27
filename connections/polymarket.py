"""Polymarket connector — read a user's positions by their Polygon address.

Polymarket is on-chain (Polygon). Positions are read from the public Data API by
the user's proxy-wallet address. No credentials needed.

Docs: https://docs.polymarket.com/  (data-api positions endpoint)
"""
from __future__ import annotations

import uuid

import httpx

from connections.models import Connection, Holding

DATA_API = "https://data-api.polymarket.com"


def connect_polymarket(address: str, label: str = "Polymarket", size_threshold: float = 0.1
                       ) -> tuple[Connection, list[Holding]]:
    """Pull a Polymarket user's open positions by Polygon address."""
    address = address.strip()
    conn = Connection(
        id=f"conn_{uuid.uuid4().hex[:8]}",
        category="prediction_market", provider="polymarket",
        label=label, scopes=["read"],
    )
    holdings: list[Holding] = []
    with httpx.Client(timeout=20, headers={"User-Agent": "paris-hack/1.0"}) as c:
        r = c.get(f"{DATA_API}/positions",
                  params={"user": address, "sizeThreshold": size_threshold, "limit": 500})
        r.raise_for_status()
        positions = r.json()

    if not isinstance(positions, list):
        positions = positions.get("positions", []) if isinstance(positions, dict) else []

    for p in positions:
        cur_val = float(p.get("currentValue", 0) or 0)
        title = (p.get("title") or p.get("conditionId") or "position")
        outcome = p.get("outcome", "")
        holdings.append(Holding(
            symbol=str(title)[:60],
            name=f"{title} — {outcome}".strip(" —"),
            asset_class="event_contract",
            chain="polygon",
            quantity=float(p.get("size", 0) or 0),
            market_value=cur_val,
            cost_basis=float(p.get("initialValue", 0) or 0) or None,
            venue="polymarket",
            connection_id=conn.id,
        ))
    return conn, holdings
