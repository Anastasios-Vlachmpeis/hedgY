"""Manual / CSV portfolio connector (Phase A — ships day one).

Accepts a list of {symbol, quantity, marketValue?} dicts and normalizes them
to Holdings. If marketValue is missing, it stays 0 (the caller can enrich with
live prices later). Optionally parses a CSV string.
"""
from __future__ import annotations

import csv
import io
import uuid
from datetime import datetime

from connections.models import Connection, Holding


def connect_manual(holdings_raw: list[dict], label: str = "Manual") -> tuple[Connection, list[Holding]]:
    """Create a manual connection + normalize raw holdings.

    Each dict in holdings_raw should have at minimum:
        symbol (str), quantity (float)
    Optional: name, asset_class, market_value, cost_basis, venue.
    """
    conn = Connection(
        id=f"conn_{uuid.uuid4().hex[:8]}",
        category="manual",
        provider="manual",
        label=label,
        created_at=datetime.utcnow(),
    )
    out: list[Holding] = []
    for h in holdings_raw:
        out.append(Holding(
            symbol=str(h.get("symbol", "")).upper().strip(),
            name=str(h.get("name", "")),
            asset_class=h.get("asset_class", _guess_asset_class(str(h.get("symbol", "")))),
            quantity=float(h.get("quantity", 0)),
            market_value=float(h.get("market_value", 0)),
            cost_basis=float(h["cost_basis"]) if h.get("cost_basis") else None,
            venue=str(h.get("venue", "manual")),
            connection_id=conn.id,
        ))
    return conn, out


def parse_csv(csv_text: str) -> list[dict]:
    """Parse a CSV string (header row required: symbol,quantity[,market_value,...]).

    Returns a list of dicts suitable for connect_manual().
    """
    reader = csv.DictReader(io.StringIO(csv_text.strip()))
    rows: list[dict] = []
    for row in reader:
        clean = {k.strip().lower().replace(" ", "_"): v.strip() for k, v in row.items() if v}
        if "symbol" not in clean:
            continue
        for num_field in ("quantity", "market_value", "cost_basis"):
            if num_field in clean:
                try:
                    clean[num_field] = float(clean[num_field].replace(",", "").replace("$", ""))
                except ValueError:
                    clean.pop(num_field, None)
        rows.append(clean)
    return rows


# --- helpers ---
CRYPTO_SYMBOLS = {"BTC", "ETH", "SOL", "MATIC", "AVAX", "DOGE", "XRP", "ADA", "DOT", "LINK", "UNI", "USDC", "USDT"}

def _guess_asset_class(symbol: str) -> str:
    s = symbol.upper()
    if s in CRYPTO_SYMBOLS:
        return "crypto"
    return "equity"
