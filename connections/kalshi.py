"""Kalshi connector — read the user's event-contract positions.

Kalshi positions are already event-contract exposures (existing hedges or bets),
so the radar should ingest them too.

Flow: log in (email/password) -> token -> GET /portfolio/positions.
Needs: KALSHI_EMAIL, KALSHI_PASSWORD
(If your Kalshi account uses API-key/RSA auth instead, swap _login for the
 signed-header scheme; the positions parsing below is unchanged.)
"""
from __future__ import annotations

import uuid

import httpx

from connections.base import env, require
from connections.models import Connection, Holding

BASE = "https://api.elections.kalshi.com/trade-api/v2"


def _login() -> tuple[str, str]:
    """Returns (member_id, token) for the Authorization header."""
    with httpx.Client(timeout=20) as c:
        r = c.post(f"{BASE}/login", json={"email": env("KALSHI_EMAIL"),
                                          "password": env("KALSHI_PASSWORD")})
        r.raise_for_status()
        d = r.json()
        return d["member_id"], d["token"]


def connect_kalshi(label: str = "Kalshi") -> tuple[Connection, list[Holding]]:
    require("kalshi")
    member_id, token = _login()
    conn = Connection(id=f"conn_{uuid.uuid4().hex[:8]}", category="prediction_market",
                      provider="kalshi", label=label, scopes=["read"])
    holdings: list[Holding] = []
    headers = {"Authorization": f"{member_id} {token}"}
    with httpx.Client(timeout=20) as c:
        r = c.get(f"{BASE}/portfolio/positions", headers=headers)
        r.raise_for_status()
        for pos in r.json().get("market_positions", []):
            qty = float(pos.get("position", 0) or 0)
            if qty == 0:
                continue
            # market value ≈ |position| * current price (cents -> dollars)
            val = abs(qty) * float(pos.get("market_exposure", 0) or 0) / 100.0
            holdings.append(Holding(
                symbol=str(pos.get("ticker", ""))[:40],
                name=pos.get("ticker", ""),
                asset_class="event_contract",
                quantity=qty,
                market_value=round(val, 2),
                venue="kalshi",
                connection_id=conn.id,
            ))
    return conn, holdings
