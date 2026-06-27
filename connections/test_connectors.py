#!/usr/bin/env python3
"""
Smoke-test every connector and report PASS / NEEDS_CREDENTIALS / ERROR.

- Manual: always runs (no network).
- Polymarket + Solana: hit the real public APIs (live test).
- SnapTrade / Mesh / EVM / Kalshi: report NEEDS_CREDENTIALS unless env vars are set,
  in which case they attempt a live call.

Usage:
    python3 -m connections.test_connectors
    POLY_ADDRESS=0x... SOLANA_ADDRESS=... python3 -m connections.test_connectors
"""
from __future__ import annotations

import os
import traceback

from connections.base import CONNECTORS, missing_for

GREEN, YELLOW, RED, DIM, RESET = "\033[32m", "\033[33m", "\033[31m", "\033[2m", "\033[0m"

# Sample public addresses for the live tests (override via env).
# Default Polymarket address = a known active public proxy wallet.
POLY_ADDRESS = os.environ.get("POLY_ADDRESS", "0x9d84ce0306f8551e02efef1680475fc0f1dc1344")
SOLANA_ADDRESS = os.environ.get("SOLANA_ADDRESS", "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM")  # a public Solana addr


def line(provider: str, status: str, detail: str = "") -> None:
    color = {"PASS": GREEN, "NEEDS_CREDENTIALS": YELLOW, "ERROR": RED, "SKIP": DIM}[status]
    info = CONNECTORS.get(provider, {})
    plats = info.get("platforms", "")
    print(f"  {color}{status:<18}{RESET} {provider:<11} {DIM}{plats}{RESET}")
    if detail:
        print(f"      {detail}")


def test_manual() -> None:
    try:
        from connections.manual import connect_manual, parse_csv
        _, h = connect_manual([{"symbol": "AAPL", "quantity": 10, "market_value": 2500}])
        rows = parse_csv("symbol,quantity,market_value\nMSFT,5,2100")
        assert len(h) == 1 and len(rows) == 1
        line("manual", "PASS", f"normalized {len(h)} holding(s); CSV parsed {len(rows)} row(s)")
    except Exception as e:
        line("manual", "ERROR", repr(e))


def test_polymarket() -> None:
    try:
        from connections.polymarket import connect_polymarket
        conn, h = connect_polymarket(POLY_ADDRESS)
        total = sum(x.market_value for x in h)
        line("polymarket", "PASS",
             f"live API OK · {len(h)} position(s) for {POLY_ADDRESS[:10]}… · ${total:,.0f}")
    except Exception as e:
        line("polymarket", "ERROR", f"{type(e).__name__}: {str(e)[:120]}")


def test_solana() -> None:
    try:
        from connections.wallet import connect_solana
        conn, h = connect_solana(SOLANA_ADDRESS)
        total = sum(x.market_value for x in h)
        sol = next((x.quantity for x in h if x.symbol == "SOL"), 0)
        line("solana", "PASS",
             f"live RPC OK · {len(h)} asset(s) for {SOLANA_ADDRESS[:8]}… · {sol:.3f} SOL · ${total:,.0f}")
    except Exception as e:
        line("solana", "ERROR", f"{type(e).__name__}: {str(e)[:120]}")


def test_credentialed(provider: str, runner) -> None:
    miss = missing_for(provider)
    if miss:
        line(provider, "NEEDS_CREDENTIALS", f"set {', '.join(miss)}")
        return
    try:
        runner()
        line(provider, "PASS", "live call OK")
    except Exception as e:
        line(provider, "ERROR", f"{type(e).__name__}: {str(e)[:120]}")


def main() -> None:
    print("\n=== CONNECTOR SMOKE TEST ===\n")
    print("No credentials needed:")
    test_manual()
    test_polymarket()
    test_solana()

    print("\nCredential-gated (build verified; live call only if keys set):")
    from connections import base

    def run_snaptrade():
        from connections.snaptrade import register_user
        register_user("smoke_test_user")

    def run_mesh():
        from connections.mesh import link_token
        link_token("smoke_test_user")

    def run_evm():
        from connections.wallet import connect_evm
        connect_evm(os.environ.get("EVM_ADDRESS", "0x0000000000000000000000000000000000000000"))

    def run_kalshi():
        from connections.kalshi import connect_kalshi
        connect_kalshi()

    test_credentialed("snaptrade", run_snaptrade)
    test_credentialed("mesh", run_mesh)
    test_credentialed("evm", run_evm)
    test_credentialed("kalshi", run_kalshi)

    # Import-only sanity for the credential connectors (proves the code loads / no syntax errors)
    print("\nImport sanity (no syntax/load errors):")
    for mod in ["snaptrade", "mesh", "wallet", "kalshi", "polymarket", "manual"]:
        try:
            __import__(f"connections.{mod}")
            line(mod, "PASS", "module imports clean")
        except Exception as e:
            line(mod, "ERROR", repr(e))

    print()


if __name__ == "__main__":
    main()
