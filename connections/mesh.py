"""Mesh Connect connector — crypto exchanges (Binance, Coinbase, Kraken, OKX…).

Flow:
  1) link_token(userId)        -> a link token; user connects their exchange in Mesh's UI
  2) [user authorizes]         -> your callback receives an authToken for that connection
  3) get_holdings(authToken)   -> balances across the connected exchange

Auth: X-Client-Id + X-Client-Secret headers. Needs:
  MESH_CLIENT_ID, MESH_CLIENT_SECRET
"""
from __future__ import annotations

import uuid

import httpx

from connections.base import env, require
from connections.models import Connection, Holding

BASE = "https://integration-api.meshconnect.com"


def _headers() -> dict:
    return {
        "X-Client-Id": env("MESH_CLIENT_ID"),
        "X-Client-Secret": env("MESH_CLIENT_SECRET"),
        "Content-Type": "application/json",
    }


def link_token(user_id: str) -> str:
    """Create a Mesh link token; the user connects their exchange with it."""
    require("mesh")
    with httpx.Client(timeout=25) as c:
        r = c.post(f"{BASE}/api/v1/linktoken", headers=_headers(),
                   json={"userId": user_id, "integrationName": "Mesh"})
        r.raise_for_status()
        return r.json()["content"]["linkToken"]


def connect_mesh(auth_token: dict, broker_type: str, label: str = "Crypto exchange"
                 ) -> tuple[Connection, list[Holding]]:
    """Pull holdings for a connected exchange using the authToken from the link flow."""
    require("mesh")
    conn = Connection(id=f"conn_{uuid.uuid4().hex[:8]}", category="crypto_exchange",
                      provider="mesh", label=label, scopes=["read"])
    holdings: list[Holding] = []
    with httpx.Client(timeout=25) as c:
        r = c.post(f"{BASE}/api/v1/holdings/get", headers=_headers(),
                   json={"authToken": auth_token, "type": broker_type})
        r.raise_for_status()
        data = r.json().get("content", {})
        for pos in data.get("cryptocurrencyPositions", []) + data.get("equityPositions", []):
            symbol = pos.get("symbol", "")
            amount = float(pos.get("amount", 0) or 0)
            value = float(pos.get("marketValue", 0) or 0)
            holdings.append(Holding(
                symbol=str(symbol).upper(),
                name=pos.get("name", symbol),
                asset_class="crypto" if pos in data.get("cryptocurrencyPositions", []) else "equity",
                quantity=amount,
                market_value=value,
                venue=str(broker_type),
                connection_id=conn.id,
            ))
    return conn, holdings
