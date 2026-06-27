"""Unit tests for the paper-trading ledger (pure money math, no network)."""

from __future__ import annotations

import pytest

from app.account import AccountService


@pytest.fixture
def svc(tmp_path):
    return AccountService(db_path=str(tmp_path / "account.db"))


# fixed-price mark helpers ----------------------------------------------------
def mark_const(prices: dict):
    """Return a `mark(position) -> price` from a {key: price} map."""
    def _mark(p: dict):
        key = p["symbol"] if p["kind"] == "stock" else (p["market_id"], p["side"])
        return prices.get(key)
    return _mark


def test_fresh_account_is_empty(svc):
    acct = svc.account(mark_const({}))
    assert acct["cash"] == 0
    assert acct["equity"] == 0
    assert acct["positions_count"] == 0
    assert svc.positions() == []


def test_deposit_increases_cash(svc):
    out = svc.deposit(1000)
    assert out["cash"] == 1000
    assert out["total_deposited"] == 1000


def test_buy_stock_debits_cash_and_opens_position(svc):
    svc.deposit(1000)
    svc.place_order(kind="stock", action="buy", notional=200, price=400, symbol="LMT")
    pos = svc.positions()
    assert len(pos) == 1
    assert pos[0]["qty"] == pytest.approx(0.5)
    assert pos[0]["avg_entry"] == pytest.approx(400)
    assert svc.account(mark_const({}))["cash"] == pytest.approx(800)


def test_buy_again_weights_average_entry(svc):
    svc.deposit(1000)
    svc.place_order(kind="stock", action="buy", notional=200, price=400, symbol="LMT")
    svc.place_order(kind="stock", action="buy", notional=200, price=500, symbol="LMT")
    pos = svc.positions()[0]
    assert pos["qty"] == pytest.approx(0.9)
    # (0.5*400 + 0.4*500) / 0.9 = 444.444...
    assert pos["avg_entry"] == pytest.approx(444.4444, rel=1e-4)
    assert svc.account(mark_const({}))["cash"] == pytest.approx(600)


def test_mark_to_market_equity_and_unrealized_pnl(svc):
    svc.deposit(1000)
    svc.place_order(kind="stock", action="buy", notional=400, price=400, symbol="LMT")  # 1 share
    mark = mark_const({"LMT": 600})
    acct = svc.account(mark)
    assert acct["equity"] == pytest.approx(600 + 600)  # 600 cash + 1*600
    assert acct["pnl"] == pytest.approx(200)  # equity 1200 - deposited 1000
    pos = svc.positions_marked(mark)[0]
    assert pos["unrealized_pnl"] == pytest.approx(200)  # 1*(600-400)


def test_insufficient_funds_rejected(svc):
    svc.deposit(100)
    with pytest.raises(ValueError, match="insufficient funds"):
        svc.place_order(kind="stock", action="buy", notional=1000, price=50, symbol="LMT")


def test_prediction_buy_uses_contracts(svc):
    svc.deposit(1000)
    svc.place_order(kind="prediction", action="buy", notional=100, price=0.25, market_id="m1", side="YES")
    pos = svc.positions()[0]
    assert pos["qty"] == pytest.approx(400)  # 100 / 0.25
    assert pos["side"] == "YES"
    assert svc.account(mark_const({}))["cash"] == pytest.approx(900)


def test_prediction_partial_sell_realizes_pnl(svc):
    svc.deposit(1000)
    svc.place_order(kind="prediction", action="buy", notional=100, price=0.25, market_id="m1", side="YES")
    res = svc.place_order(kind="prediction", action="sell", notional=100, price=0.50, market_id="m1", side="YES")
    # sells min(400, 100/0.5=200) contracts at 0.50
    assert res["trade"]["qty"] == pytest.approx(200)
    assert res["trade"]["realized_pnl"] == pytest.approx(200 * (0.50 - 0.25))  # 50
    pos = svc.positions()[0]
    assert pos["qty"] == pytest.approx(200)
    # cash: 1000 - 100 (buy) + 100 (sell proceeds) = 1000
    assert svc.account(mark_const({}))["cash"] == pytest.approx(1000)


def test_sell_more_than_held_closes_position(svc):
    svc.deposit(1000)
    svc.place_order(kind="stock", action="buy", notional=400, price=400, symbol="LMT")  # 1 share
    svc.place_order(kind="stock", action="sell", notional=100000, price=500, symbol="LMT")
    assert svc.positions() == []
    # cash: 1000 - 400 + 1*500 = 1100
    assert svc.account(mark_const({}))["cash"] == pytest.approx(1100)


def test_sell_with_no_position_raises(svc):
    svc.deposit(1000)
    with pytest.raises(ValueError, match="no position"):
        svc.place_order(kind="stock", action="sell", notional=100, price=50, symbol="NVDA")


def test_reset_clears_everything(svc):
    svc.deposit(1000)
    svc.place_order(kind="stock", action="buy", notional=200, price=400, symbol="LMT")
    out = svc.reset()
    assert out["cash"] == 0
    assert out["total_deposited"] == 0
    assert svc.positions() == []
    assert svc.trades() == []


def test_trades_recorded_newest_first(svc):
    svc.deposit(1000)
    svc.place_order(kind="stock", action="buy", notional=100, price=400, symbol="LMT")
    svc.place_order(kind="prediction", action="buy", notional=50, price=0.5, market_id="m1", side="YES")
    trades = svc.trades()
    assert len(trades) == 2
    assert trades[0]["market_id"] == "m1"  # newest first
    assert trades[1]["symbol"] == "LMT"
