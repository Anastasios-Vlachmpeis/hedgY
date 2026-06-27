"""connections/base.py — shared helpers, credential checks, and the registry.

Every connector exposes a `connect(...)` that returns (Connection, list[Holding]).
Credential-required connectors raise MissingCredentials if their env vars aren't set.
"""
from __future__ import annotations

import os


class MissingCredentials(RuntimeError):
    """A connector needs API keys/credentials that aren't configured."""


def env(key: str, default: str | None = None) -> str | None:
    return os.environ.get(key, default)


# Registry: provider -> {category, needs (env vars), input (what the user supplies)}
CONNECTORS: dict[str, dict] = {
    "manual": {
        "category": "manual", "needs": [],
        "input": "holdings list or CSV",
        "platforms": "anything",
    },
    "snaptrade": {
        "category": "brokerage", "needs": ["SNAPTRADE_CLIENT_ID", "SNAPTRADE_CONSUMER_KEY"],
        "input": "OAuth via SnapTrade portal",
        "platforms": "Robinhood, IBKR, Schwab, Fidelity, Webull, Vanguard, E*TRADE…",
    },
    "mesh": {
        "category": "crypto_exchange", "needs": ["MESH_CLIENT_ID", "MESH_CLIENT_SECRET"],
        "input": "OAuth via Mesh + authToken",
        "platforms": "Binance, Coinbase, Kraken, OKX, Bybit…",
    },
    "solana": {
        "category": "wallet", "needs": [],
        "input": "public Solana address (Phantom). Optional HELIUS_API_KEY for richer USD.",
        "platforms": "Phantom, Solflare (Solana)",
    },
    "evm": {
        "category": "wallet", "needs": ["ZERION_API_KEY"],
        "input": "public EVM address (MetaMask)",
        "platforms": "MetaMask, Rabby, Coinbase Wallet (Ethereum/Base/Arbitrum/Polygon)",
    },
    "polymarket": {
        "category": "prediction_market", "needs": [],
        "input": "public Polygon address",
        "platforms": "Polymarket",
    },
    "kalshi": {
        "category": "prediction_market", "needs": ["KALSHI_EMAIL", "KALSHI_PASSWORD"],
        "input": "Kalshi login",
        "platforms": "Kalshi",
    },
}


def missing_for(provider: str) -> list[str]:
    """Which required env vars are NOT set for this provider."""
    info = CONNECTORS.get(provider, {})
    return [k for k in info.get("needs", []) if not env(k)]


def require(provider: str) -> None:
    miss = missing_for(provider)
    if miss:
        raise MissingCredentials(
            f"{provider} needs env var(s): {', '.join(miss)} (see connections/.env.example)"
        )
