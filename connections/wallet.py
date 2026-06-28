"""On-chain wallet connectors — read holdings by PUBLIC ADDRESS only.

- Solana (Phantom/Solflare): public RPC for SOL + SPL balances; USD via CoinGecko
  for SOL + stablecoins (richer pricing if HELIUS_API_KEY is set, optional).
- EVM (MetaMask/Rabby/Coinbase Wallet): Zerion API (needs ZERION_API_KEY).

Reading a wallet needs ONLY the public address. We never touch private keys.
"""
from __future__ import annotations

import uuid

import httpx

from connections.base import env, require
from connections.models import Connection, Holding

SOLANA_RPC = env("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com")
TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
LAMPORTS_PER_SOL = 1_000_000_000

# known mints -> (symbol, usd_price or None)
KNOWN_MINTS = {
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": ("USDC", 1.0),
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": ("USDT", 1.0),
}


def _sol_usd_price() -> float:
    try:
        with httpx.Client(timeout=10) as c:
            r = c.get("https://api.coingecko.com/api/v3/simple/price",
                      params={"ids": "solana", "vs_currencies": "usd"})
            r.raise_for_status()
            return float(r.json()["solana"]["usd"])
    except Exception:
        return 0.0


def connect_solana(address: str, label: str = "Phantom") -> tuple[Connection, list[Holding]]:
    """Read SOL + SPL token balances for a public Solana address."""
    address = address.strip()
    conn = Connection(id=f"conn_{uuid.uuid4().hex[:8]}", category="wallet",
                      provider="solana", label=label, scopes=["read"])
    holdings: list[Holding] = []
    sol_price = _sol_usd_price()

    with httpx.Client(timeout=20) as c:
        # native SOL balance
        bal = c.post(SOLANA_RPC, json={
            "jsonrpc": "2.0", "id": 1, "method": "getBalance", "params": [address]
        }).json()
        lamports = (bal.get("result") or {}).get("value", 0)
        sol = lamports / LAMPORTS_PER_SOL
        if sol > 0:
            holdings.append(Holding(symbol="SOL", name="Solana", asset_class="crypto",
                                    chain="solana", quantity=sol,
                                    market_value=round(sol * sol_price, 2),
                                    venue="solana", connection_id=conn.id))

        # SPL token balances
        toks = c.post(SOLANA_RPC, json={
            "jsonrpc": "2.0", "id": 1, "method": "getTokenAccountsByOwner",
            "params": [address, {"programId": TOKEN_PROGRAM}, {"encoding": "jsonParsed"}]
        }).json()
        for acc in (toks.get("result") or {}).get("value", []):
            info = acc["account"]["data"]["parsed"]["info"]
            mint = info["mint"]
            amt = float(info["tokenAmount"].get("uiAmount") or 0)
            if amt <= 0:
                continue
            sym, price = KNOWN_MINTS.get(mint, (mint[:6], None))
            holdings.append(Holding(symbol=sym, name=mint, asset_class="crypto", chain="solana",
                                    quantity=amt,
                                    market_value=round(amt * price, 2) if price else 0.0,
                                    venue="solana", connection_id=conn.id))
    return conn, holdings


def connect_evm(address: str, label: str = "MetaMask") -> tuple[Connection, list[Holding]]:
    """Read an EVM wallet's positions via Zerion (multi-chain, USD-valued)."""
    require("evm")
    address = address.strip()
    key = env("ZERION_API_KEY")
    conn = Connection(id=f"conn_{uuid.uuid4().hex[:8]}", category="wallet",
                      provider="evm", label=label, scopes=["read"])
    holdings: list[Holding] = []
    with httpx.Client(timeout=20) as c:
        # Zerion uses Basic auth: base64(api_key:)
        r = c.get(f"https://api.zerion.io/v1/wallets/{address}/positions/",
                  params={"filter[positions]": "only_simple", "currency": "usd"},
                  auth=(key, ""))
        r.raise_for_status()
        for pos in r.json().get("data", []):
            a = pos.get("attributes", {})
            fungible = a.get("fungible_info", {})
            holdings.append(Holding(
                symbol=(fungible.get("symbol") or "")[:12],
                name=fungible.get("name", ""),
                asset_class="crypto",
                chain=(pos.get("relationships", {}).get("chain", {}).get("data", {}).get("id")),
                quantity=float(a.get("quantity", {}).get("float", 0) or 0),
                market_value=float(a.get("value", 0) or 0),
                venue="evm", connection_id=conn.id,
            ))
    return conn, holdings
