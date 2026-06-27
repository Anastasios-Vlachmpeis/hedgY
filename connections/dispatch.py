"""Unified entry point for all connectors.

The backend calls `connect(provider, **params)` and always gets back
(Connection, list[Holding]) regardless of which venue. Each provider takes
different params (address vs userId/secret vs holdings) — see CONNECTORS.

Examples:
    connect("manual", holdings=[{"symbol":"AAPL","quantity":10,"market_value":2500}])
    connect("polymarket", address="0x...")
    connect("solana", address="...")
    connect("snaptrade", user_id="u1", user_secret="...")
    connect("mesh", auth_token={...}, broker_type="binance")
    connect("evm", address="0x...")
    connect("kalshi")
"""
from __future__ import annotations

from connections.base import CONNECTORS, MissingCredentials, missing_for
from connections.models import Connection, Holding


def connect(provider: str, **params) -> tuple[Connection, list[Holding]]:
    if provider == "manual":
        from connections.manual import connect_manual
        return connect_manual(params.get("holdings", []), params.get("label", "Manual"))
    if provider == "polymarket":
        from connections.polymarket import connect_polymarket
        return connect_polymarket(params["address"], params.get("label", "Polymarket"))
    if provider == "solana":
        from connections.wallet import connect_solana
        return connect_solana(params["address"], params.get("label", "Phantom"))
    if provider == "evm":
        from connections.wallet import connect_evm
        return connect_evm(params["address"], params.get("label", "MetaMask"))
    if provider == "snaptrade":
        from connections.snaptrade import connect_snaptrade
        return connect_snaptrade(params["user_id"], params["user_secret"], params.get("label", "Brokerage"))
    if provider == "mesh":
        from connections.mesh import connect_mesh
        return connect_mesh(params["auth_token"], params["broker_type"], params.get("label", "Crypto exchange"))
    if provider == "kalshi":
        from connections.kalshi import connect_kalshi
        return connect_kalshi(params.get("label", "Kalshi"))
    raise ValueError(f"unknown provider: {provider} (known: {', '.join(CONNECTORS)})")


def list_connectors() -> list[dict]:
    """For a 'Connect accounts' UI: every provider + what it needs + status."""
    out = []
    for provider, info in CONNECTORS.items():
        out.append({
            "provider": provider,
            "category": info["category"],
            "platforms": info.get("platforms", ""),
            "input": info.get("input", ""),
            "ready": len(missing_for(provider)) == 0,
            "needs": missing_for(provider),
        })
    return out
