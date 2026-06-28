"""Paper-trading account — the $1000 wallet.

A single demo account backed by SQLite. The ledger bookkeeping here is PURE:
`place_order` is given the fill `price`, and `account`/`positions_marked` are
given a `mark` callable. That keeps all money math unit-testable without touching
the network. Live pricing (Alpaca for stocks, the aggregator store for
predictions) lives in the thin helpers at the bottom and is wired in by the
routes.

Execution model (see docs/superpowers/specs/2026-06-27-paper-trading-account-design.md):
stocks fire a real Alpaca paper order but this ledger is the source of truth for
the $1000 world; predictions fill in-app at live odds. No real money / custody.
"""

from __future__ import annotations

import logging
import sqlite3
import time
from typing import Callable

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

EPS = 1e-9


def _row_to_position(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "kind": row["kind"],
        "symbol": row["symbol"],
        "market_id": row["market_id"],
        "side": row["side"],
        "qty": row["qty"],
        "avg_entry": row["avg_entry"],
        "label": row["label"],
        "group_id": row["group_id"],
        "opened_at": row["opened_at"],
    }


class AccountService:
    """SQLite-backed ledger: cash, positions, trade history. Pure money math."""

    def __init__(self, db_path: str | None = None) -> None:
        self.db_path = db_path or settings.account_db_path
        self._init_db()

    # ---- infra ------------------------------------------------------------
    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=5.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        conn = self._connect()
        try:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS account (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    cash REAL NOT NULL DEFAULT 0,
                    total_deposited REAL NOT NULL DEFAULT 0,
                    currency TEXT NOT NULL DEFAULT 'USD'
                );
                CREATE TABLE IF NOT EXISTS positions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    kind TEXT NOT NULL,
                    symbol TEXT,
                    market_id TEXT,
                    side TEXT,
                    qty REAL NOT NULL,
                    avg_entry REAL NOT NULL,
                    label TEXT,
                    group_id TEXT,
                    opened_at REAL NOT NULL
                );
                CREATE TABLE IF NOT EXISTS trades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    kind TEXT NOT NULL,
                    action TEXT NOT NULL,
                    symbol TEXT,
                    market_id TEXT,
                    side TEXT,
                    qty REAL NOT NULL,
                    price REAL NOT NULL,
                    notional REAL NOT NULL,
                    realized_pnl REAL NOT NULL DEFAULT 0,
                    alpaca_order_id TEXT,
                    label TEXT,
                    group_id TEXT,
                    ts REAL NOT NULL
                );
                CREATE TABLE IF NOT EXISTS equity_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ts REAL NOT NULL,
                    equity REAL NOT NULL
                );
                """
            )
            conn.execute("INSERT OR IGNORE INTO account (id, cash, total_deposited) VALUES (1, 0, 0)")
            # migrate older databases that predate combined-position grouping
            for table in ("positions", "trades"):
                cols = {r["name"] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()}
                if "group_id" not in cols:
                    conn.execute(f"ALTER TABLE {table} ADD COLUMN group_id TEXT")
            conn.commit()
        finally:
            conn.close()

    # ---- account ----------------------------------------------------------
    def _account_row(self, conn: sqlite3.Connection) -> sqlite3.Row:
        return conn.execute("SELECT cash, total_deposited, currency FROM account WHERE id = 1").fetchone()

    def deposit(self, amount: float) -> dict:
        if amount <= 0:
            raise ValueError("deposit amount must be positive")
        conn = self._connect()
        try:
            conn.execute(
                "UPDATE account SET cash = cash + ?, total_deposited = total_deposited + ? WHERE id = 1",
                (amount, amount),
            )
            conn.commit()
            return self._summary(conn)
        finally:
            conn.close()

    def withdraw(self, amount: float) -> dict:
        """Pull cash out to the linked card. Reduces cash AND the deposited base
        (it's your own money leaving), so unrealized P&L is unaffected."""
        if amount <= 0:
            raise ValueError("withdrawal amount must be positive")
        conn = self._connect()
        try:
            row = conn.execute("SELECT cash FROM account WHERE id = 1").fetchone()
            cash = row["cash"] if row else 0.0
            if amount > cash + 1e-9:
                raise ValueError(f"insufficient cash: need ${amount:,.2f}, have ${cash:,.2f}")
            conn.execute(
                "UPDATE account SET cash = cash - ?, total_deposited = total_deposited - ? WHERE id = 1",
                (amount, amount),
            )
            conn.commit()
            return self._summary(conn)
        finally:
            conn.close()

    def reset(self) -> dict:
        conn = self._connect()
        try:
            conn.execute("UPDATE account SET cash = 0, total_deposited = 0 WHERE id = 1")
            conn.execute("DELETE FROM positions")
            conn.execute("DELETE FROM trades")
            conn.execute("DELETE FROM equity_log")
            conn.commit()
            return self._summary(conn)
        finally:
            conn.close()

    def _summary(self, conn: sqlite3.Connection) -> dict:
        row = self._account_row(conn)
        count = conn.execute("SELECT COUNT(*) AS n FROM positions").fetchone()["n"]
        return {
            "cash": row["cash"],
            "total_deposited": row["total_deposited"],
            "currency": row["currency"],
            "positions_count": count,
        }

    # ---- positions --------------------------------------------------------
    def _find_position(
        self,
        conn: sqlite3.Connection,
        *,
        kind: str,
        symbol: str | None,
        market_id: str | None,
        side: str | None,
        group_id: str | None,
    ) -> sqlite3.Row | None:
        # `IS` (not `=`) so group_id NULL matches standalone positions while a
        # combined leg only merges with another leg of the same group.
        if kind == "stock":
            return conn.execute(
                "SELECT * FROM positions WHERE kind = 'stock' AND symbol = ? AND group_id IS ?",
                (symbol, group_id),
            ).fetchone()
        return conn.execute(
            "SELECT * FROM positions WHERE kind = 'prediction' AND market_id = ? AND side = ? AND group_id IS ?",
            (market_id, side, group_id),
        ).fetchone()

    def positions(self) -> list[dict]:
        conn = self._connect()
        try:
            rows = conn.execute("SELECT * FROM positions ORDER BY opened_at DESC").fetchall()
            return [_row_to_position(r) for r in rows]
        finally:
            conn.close()

    # ---- orders -----------------------------------------------------------
    def place_order(
        self,
        *,
        kind: str,
        action: str,
        notional: float,
        price: float,
        symbol: str | None = None,
        market_id: str | None = None,
        side: str | None = None,
        label: str | None = None,
        alpaca_order_id: str | None = None,
        group_id: str | None = None,
    ) -> dict:
        """Apply a fill to the ledger. `price` is the (already-fetched) fill price.

        buy:  spend `notional` cash → qty = notional/price, weighted-avg entry.
        sell: sell up to the held qty worth `notional` at `price`, realize P&L.
        Raises ValueError on bad input / insufficient funds / nothing to sell.
        """
        if kind not in ("stock", "prediction"):
            raise ValueError(f"unknown kind '{kind}'")
        if action not in ("buy", "sell"):
            raise ValueError(f"unknown action '{action}'")
        if notional <= 0:
            raise ValueError("notional must be positive")
        if price <= 0:
            raise ValueError("price must be positive")
        if kind == "stock" and not symbol:
            raise ValueError("stock order requires a symbol")
        if kind == "prediction" and (not market_id or side not in ("YES", "NO")):
            raise ValueError("prediction order requires market_id and side YES|NO")

        conn = self._connect()
        try:
            if action == "buy":
                trade = self._apply_buy(conn, kind, notional, price, symbol, market_id, side, label, alpaca_order_id, group_id)
            else:
                trade = self._apply_sell(conn, kind, notional, price, symbol, market_id, side, label, alpaca_order_id, group_id)
            conn.commit()
            return {"trade": trade, "account": self._summary(conn)}
        finally:
            conn.close()

    def _apply_buy(self, conn, kind, notional, price, symbol, market_id, side, label, alpaca_order_id, group_id) -> dict:
        cash = self._account_row(conn)["cash"]
        if notional > cash + EPS:
            raise ValueError(f"insufficient funds: need ${notional:,.2f}, have ${cash:,.2f}")

        qty = notional / price
        conn.execute("UPDATE account SET cash = cash - ? WHERE id = 1", (notional,))

        existing = self._find_position(conn, kind=kind, symbol=symbol, market_id=market_id, side=side, group_id=group_id)
        if existing is None:
            conn.execute(
                "INSERT INTO positions (kind, symbol, market_id, side, qty, avg_entry, label, group_id, opened_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (kind, symbol, market_id, side, qty, price, label, group_id, time.time()),
            )
        else:
            new_qty = existing["qty"] + qty
            # weighted-average entry: (old_cost + this_cost) / new_qty
            new_avg = (existing["qty"] * existing["avg_entry"] + notional) / new_qty
            conn.execute(
                "UPDATE positions SET qty = ?, avg_entry = ?, label = COALESCE(?, label) WHERE id = ?",
                (new_qty, new_avg, label, existing["id"]),
            )
        return self._record_trade(conn, kind, "buy", symbol, market_id, side, qty, price, notional, 0.0, alpaca_order_id, label, group_id)

    def _apply_sell(self, conn, kind, notional, price, symbol, market_id, side, label, alpaca_order_id, group_id) -> dict:
        pos = self._find_position(conn, kind=kind, symbol=symbol, market_id=market_id, side=side, group_id=group_id)
        if pos is None or pos["qty"] <= EPS:
            raise ValueError("no position to sell")

        qty_to_sell = min(pos["qty"], notional / price)
        proceeds = qty_to_sell * price
        realized = qty_to_sell * (price - pos["avg_entry"])
        conn.execute("UPDATE account SET cash = cash + ? WHERE id = 1", (proceeds,))

        remaining = pos["qty"] - qty_to_sell
        if remaining <= EPS:
            conn.execute("DELETE FROM positions WHERE id = ?", (pos["id"],))
        else:
            conn.execute("UPDATE positions SET qty = ? WHERE id = ?", (remaining, pos["id"]))
        return self._record_trade(
            conn, kind, "sell", symbol, market_id, side, qty_to_sell, price, proceeds, realized, alpaca_order_id,
            label or pos["label"], pos["group_id"],
        )

    def _record_trade(self, conn, kind, action, symbol, market_id, side, qty, price, notional, realized, alpaca_order_id, label, group_id=None) -> dict:
        cur = conn.execute(
            "INSERT INTO trades (kind, action, symbol, market_id, side, qty, price, notional, realized_pnl, "
            "alpaca_order_id, label, group_id, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (kind, action, symbol, market_id, side, qty, price, notional, realized, alpaca_order_id, label, group_id, time.time()),
        )
        return {
            "id": cur.lastrowid,
            "kind": kind,
            "action": action,
            "symbol": symbol,
            "market_id": market_id,
            "side": side,
            "qty": qty,
            "price": price,
            "notional": notional,
            "realized_pnl": realized,
            "alpaca_order_id": alpaca_order_id,
            "label": label,
            "group_id": group_id,
        }

    def trades(self, limit: int = 100) -> list[dict]:
        conn = self._connect()
        try:
            rows = conn.execute(
                "SELECT * FROM trades ORDER BY ts DESC, id DESC LIMIT ?", (limit,)
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    # ---- equity history (for the real P&L curve) -------------------------
    def record_equity(self, equity: float, *, force: bool = False, min_gap: float = 8.0) -> None:
        """Append an equity snapshot. Throttled to one per `min_gap` seconds
        unless `force` (used on deposits/orders so each action lands a point)."""
        now = time.time()
        conn = self._connect()
        try:
            if not force:
                last = conn.execute("SELECT ts FROM equity_log ORDER BY id DESC LIMIT 1").fetchone()
                if last is not None and now - last["ts"] < min_gap:
                    return
            conn.execute("INSERT INTO equity_log (ts, equity) VALUES (?, ?)", (now, equity))
            # keep the log bounded
            conn.execute(
                "DELETE FROM equity_log WHERE id NOT IN "
                "(SELECT id FROM equity_log ORDER BY id DESC LIMIT 500)"
            )
            conn.commit()
        finally:
            conn.close()

    def equity_history(self, limit: int = 200) -> list[dict]:
        """Chronological equity points: [{t: iso-ish label, value}]."""
        conn = self._connect()
        try:
            rows = conn.execute(
                "SELECT ts, equity FROM (SELECT * FROM equity_log ORDER BY id DESC LIMIT ?) "
                "ORDER BY ts ASC",
                (limit,),
            ).fetchall()
            return [{"t": r["ts"], "value": r["equity"]} for r in rows]
        finally:
            conn.close()

    # ---- marking to market ------------------------------------------------
    def account(self, mark: Callable[[dict], float | None]) -> dict:
        """Account summary with equity marked to live prices.

        `mark(position) -> current price | None`. None falls back to avg_entry so
        a transient price gap never corrupts equity.
        """
        conn = self._connect()
        try:
            row = self._account_row(conn)
            positions = [_row_to_position(r) for r in conn.execute("SELECT * FROM positions").fetchall()]
        finally:
            conn.close()

        cash = row["cash"]
        market_value = 0.0
        for p in positions:
            mark_price = mark(p)
            mark_price = p["avg_entry"] if mark_price is None else mark_price
            market_value += p["qty"] * mark_price

        equity = cash + market_value
        deposited = row["total_deposited"]
        pnl = equity - deposited
        return {
            "cash": cash,
            "equity": equity,
            "buying_power": cash,
            "total_deposited": deposited,
            "pnl": pnl,
            "pnl_pct": (pnl / deposited * 100.0) if deposited > EPS else 0.0,
            "positions_count": len(positions),
            "currency": row["currency"],
        }

    def positions_marked(self, mark: Callable[[dict], float | None]) -> list[dict]:
        out: list[dict] = []
        for p in self.positions():
            mark_price = mark(p)
            mark_price = p["avg_entry"] if mark_price is None else mark_price
            market_value = p["qty"] * mark_price
            cost = p["qty"] * p["avg_entry"]
            out.append(
                {
                    **p,
                    "price": mark_price,
                    "market_value": market_value,
                    "cost": cost,
                    "unrealized_pnl": market_value - cost,
                    "unrealized_pnl_pct": ((market_value - cost) / cost * 100.0) if cost > EPS else 0.0,
                }
            )
        return out


# --------------------------------------------------------------------------- #
# Live pricing helpers (network/store) — used by routes, injected as `mark`.   #
# --------------------------------------------------------------------------- #
# Short-lived price cache. The portfolio marks every position to market on both
# /account and /positions, so without this each open fired ~2 Alpaca snapshot
# calls per holding (sequential, hundreds of ms each). A few seconds of staleness
# is fine for a paper account and makes the portfolio load near-instant.
_PRICE_TTL_SECONDS = 15.0
_price_cache: dict[str, tuple[float, float | None]] = {}


def _crypto_price(symbol: str, headers: dict[str, str]) -> float | None:
    """Latest crypto price for a pair like ``BTC/USD`` via the v1beta3 crypto feed.

    Marks off the live bid/ask **mid** first: on Alpaca's free crypto feed the
    last *trade* is sparse and can be stale by minutes (so a position would look
    frozen), whereas *quotes* update continuously — even on weekends. Falls back
    to the last trade if a two-sided quote isn't available. Both endpoints are
    keyed by the pair symbol (proven out in scripts/alpaca-test.ts).
    """
    base = f"{settings.alpaca_data_url}/v1beta3/crypto/us"
    params = {"symbols": symbol}

    r = httpx.get(
        f"{base}/latest/quotes",
        params=params,
        headers=headers,
        timeout=settings.http_timeout_seconds,
    )
    r.raise_for_status()
    quote = (r.json().get("quotes") or {}).get(symbol) or {}
    bid, ask = quote.get("bp"), quote.get("ap")
    if bid and ask:
        return (float(bid) + float(ask)) / 2.0

    r = httpx.get(
        f"{base}/latest/trades",
        params=params,
        headers=headers,
        timeout=settings.http_timeout_seconds,
    )
    r.raise_for_status()
    trade = (r.json().get("trades") or {}).get(symbol) or {}
    if trade.get("p"):
        return float(trade["p"])
    return None


def stock_price(symbol: str) -> float | None:
    """Latest Alpaca price for a symbol (trade price, else quote mid), cached briefly."""
    now = time.monotonic()
    cached = _price_cache.get(symbol)
    if cached is not None and now - cached[0] < _PRICE_TTL_SECONDS:
        return cached[1]

    headers = {
        "APCA-API-KEY-ID": settings.alpaca_key_id,
        "APCA-API-SECRET-KEY": settings.alpaca_secret_key,
    }
    price: float | None = None
    try:
        if "/" in symbol:
            price = _crypto_price(symbol, headers)
        else:
            r = httpx.get(
                f"{settings.alpaca_data_url}/v2/stocks/{symbol}/snapshot",
                headers=headers,
                timeout=settings.http_timeout_seconds,
            )
            r.raise_for_status()
            snap = r.json()
            trade = (snap.get("latestTrade") or {}).get("p")
            if trade:
                price = float(trade)
            else:
                quote = snap.get("latestQuote") or {}
                bid, ask = quote.get("bp"), quote.get("ap")
                if bid and ask:
                    price = (float(bid) + float(ask)) / 2.0
                else:
                    bar = snap.get("dailyBar") or {}
                    price = float(bar["c"]) if bar.get("c") else None
    except Exception:  # noqa: BLE001 — pricing is best-effort
        logger.exception("stock_price failed for %s", symbol)
        price = None

    # Cache hits and misses alike so a flaky/slow symbol can't be hammered.
    _price_cache[symbol] = (now, price)
    return price


def place_alpaca_order(
    symbol: str, notional: float, side: str, order_type: str = "market", limit_price: float | None = None
) -> str | None:
    """Fire a real Alpaca paper order (market or limit); return its id (best-effort)."""
    if not settings.alpaca_key_id:
        return None
    # Crypto trades 24/7 and only accepts GTC/IOC; equities use DAY.
    tif = "gtc" if "/" in symbol else "day"
    if order_type == "limit" and limit_price:
        # Alpaca limit orders are qty-based (notional is market-only).
        payload = {
            "symbol": symbol, "qty": round(notional / limit_price, 4), "side": side,
            "type": "limit", "limit_price": round(limit_price, 2), "time_in_force": tif,
        }
    else:
        payload = {"symbol": symbol, "notional": round(notional, 2), "side": side, "type": "market", "time_in_force": tif}
    try:
        r = httpx.post(
            f"{settings.alpaca_trading_url}/v2/orders",
            headers={
                "APCA-API-KEY-ID": settings.alpaca_key_id,
                "APCA-API-SECRET-KEY": settings.alpaca_secret_key,
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=settings.http_timeout_seconds,
        )
        if r.status_code >= 400:
            return None
        return r.json().get("id")
    except Exception:  # noqa: BLE001 — broker call is best-effort; ledger is source of truth
        return None


account_service = AccountService()
