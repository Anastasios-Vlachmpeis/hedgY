"""SnapTrade connector — brokerages (Robinhood, IBKR, Schwab, Fidelity, Webull…).

SnapTrade is the workhorse: one OAuth portal covers all major brokerages, and
Robinhood has NO public API so an aggregator is the only path.

Flow:
  1) register_user(userId)              -> returns userSecret (store it)
  2) login_user(userId, userSecret)     -> returns a redirect URL (the connection portal)
  3) [user connects their broker in the portal]
  4) list_accounts(userId, userSecret)  -> account ids
  5) get_positions(accountId, ...)      -> holdings

Auth: every request is signed (HMAC-SHA256 over {content, path, query}) with the
consumer key, plus clientId + timestamp query params. Needs:
  SNAPTRADE_CLIENT_ID, SNAPTRADE_CONSUMER_KEY
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
import urllib.parse
import uuid

import httpx

from connections.base import env, require
from connections.models import Connection, Holding

BASE = "https://api.snaptrade.com/api/v1"


def _signed_request(method: str, path: str, query: dict, body: dict | None = None) -> httpx.Response:
    """Make a SnapTrade request with the required HMAC signature."""
    client_id = env("SNAPTRADE_CLIENT_ID")
    consumer_key = env("SNAPTRADE_CONSUMER_KEY")
    q = dict(query)
    q["clientId"] = client_id
    q["timestamp"] = str(int(time.time()))
    query_str = urllib.parse.urlencode(sorted(q.items()))

    sig_object = {"content": body, "path": f"/api/v1{path}", "query": query_str}
    sig_payload = json.dumps(sig_object, separators=(",", ":"), sort_keys=True)
    signature = base64.b64encode(
        hmac.new(consumer_key.encode(), sig_payload.encode(), hashlib.sha256).digest()
    ).decode()

    url = f"{BASE}{path}?{query_str}"
    headers = {"Signature": signature, "Content-Type": "application/json", "Accept": "application/json"}
    with httpx.Client(timeout=25) as c:
        return c.request(method, url, headers=headers, json=body)


def register_user(user_id: str) -> str:
    """Register a SnapTrade user; returns the userSecret (persist it)."""
    require("snaptrade")
    r = _signed_request("POST", "/snapTrade/registerUser", {}, {"userId": user_id})
    r.raise_for_status()
    return r.json()["userSecret"]


def login_url(user_id: str, user_secret: str) -> str:
    """Return the connection-portal URL the user opens to link a brokerage."""
    require("snaptrade")
    r = _signed_request("POST", "/snapTrade/login",
                        {"userId": user_id, "userSecret": user_secret}, {})
    r.raise_for_status()
    return r.json()["redirectURI"]


def connect_snaptrade(user_id: str, user_secret: str, label: str = "Brokerage"
                      ) -> tuple[Connection, list[Holding]]:
    """After the user has linked a brokerage, pull all positions across their accounts."""
    require("snaptrade")
    conn = Connection(id=f"conn_{uuid.uuid4().hex[:8]}", category="brokerage",
                      provider="snaptrade", label=label, scopes=["read"])
    holdings: list[Holding] = []

    accounts = _signed_request("GET", "/accounts",
                               {"userId": user_id, "userSecret": user_secret}).json()
    for acct in accounts:
        acct_id = acct["id"]
        positions = _signed_request(
            "GET", f"/accounts/{acct_id}/positions",
            {"userId": user_id, "userSecret": user_secret},
        ).json()
        for p in positions:
            sym = p.get("symbol", {}).get("symbol", {})
            ticker = sym.get("symbol") or sym.get("raw_symbol") or ""
            units = float(p.get("units", 0) or 0)
            price = float(p.get("price", 0) or 0)
            holdings.append(Holding(
                symbol=str(ticker).upper(),
                name=sym.get("description", ""),
                asset_class="equity",
                quantity=units,
                market_value=round(units * price, 2),
                cost_basis=(float(p["average_purchase_price"]) * units)
                if p.get("average_purchase_price") else None,
                venue=str(acct.get("brokerage_authorization", "brokerage")),
                connection_id=conn.id,
            ))
    return conn, holdings
