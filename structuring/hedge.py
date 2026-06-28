#!/usr/bin/env python3
"""
structuring/hedge.py — one-tap hedge: place + track the hedge leg.

The radar tells you WHAT to hedge and HOW MUCH. This module actually PLACES the
hedge (the prediction-market leg) and tracks it.

Why a paper-hedge book: the equity leg is already the user's holding (from the
connected account / Alpaca paper). The hedge leg is a Kalshi/Polymarket event
contract, which Alpaca can't paper-trade, so we record it in our own paper book
and mark it to market against the live odds (the aggregator's /markets).

Flow:  radar exposure  ->  build_hedge()  ->  book.place()  ->  book.mark_to_market(markets)

CLI:
    python3 -m structuring.hedge --sample      # radar -> place hedges -> simulate odds move -> P&L
"""
from __future__ import annotations

import argparse
import time
import uuid
from dataclasses import asdict, dataclass, field


# --------------------------------------------------------------------------- #
# A hedge order (the executable thing)                                         #
# --------------------------------------------------------------------------- #
@dataclass
class HedgeOrder:
    holding: str                 # the equity this protects (already held)
    event_market_id: str
    event_question: str
    side: str                    # "YES" | "NO" — the side we BUY to hedge
    contracts: float             # how many event contracts
    entry_price: float           # price paid per contract (0..1)
    cost: float                  # contracts * entry_price (the premium)
    notional_hedged: float       # $ of event-exposure this covers
    residual_pct: float          # what it does NOT cover (disclosed)


def build_hedge(exposure: dict) -> HedgeOrder:
    """Turn a radar RiskExposure into an executable hedge order."""
    ev = exposure["event"]
    h = exposure["hedge"]
    return HedgeOrder(
        holding=exposure["holding"],
        event_market_id=ev["id"],
        event_question=ev["question"],
        side=ev["hedge_leg"],
        contracts=float(h["contracts"]),
        entry_price=float(ev["p_adverse"]),
        cost=float(h["premium_usd"]),
        notional_hedged=float(exposure["event_loss_usd"]),
        residual_pct=float(h["residual_pct"]),
    )


# --------------------------------------------------------------------------- #
# A placed paper hedge (what's in the book)                                    #
# --------------------------------------------------------------------------- #
@dataclass
class PaperHedge:
    id: str
    holding: str
    event_market_id: str
    event_question: str
    side: str
    contracts: float
    entry_price: float
    cost: float
    notional_hedged: float
    residual_pct: float
    status: str = "open"         # "open" | "resolved"
    opened_at: float = field(default_factory=time.time)
    # marked-to-market (filled by mark_to_market)
    current_price: float | None = None
    current_value: float | None = None
    pnl: float | None = None


# --------------------------------------------------------------------------- #
# The paper-hedge book (in-memory; a DB in production)                          #
# --------------------------------------------------------------------------- #
class PaperHedgeBook:
    def __init__(self) -> None:
        self._hedges: dict[str, PaperHedge] = {}

    def place(self, order: HedgeOrder) -> PaperHedge:
        """Record a one-tap hedge as a paper position."""
        hid = f"hedge_{uuid.uuid4().hex[:8]}"
        ph = PaperHedge(
            id=hid, holding=order.holding,
            event_market_id=order.event_market_id, event_question=order.event_question,
            side=order.side, contracts=order.contracts, entry_price=order.entry_price,
            cost=order.cost, notional_hedged=order.notional_hedged,
            residual_pct=order.residual_pct,
            current_price=order.entry_price, current_value=order.cost, pnl=0.0,
        )
        self._hedges[hid] = ph
        return ph

    def list_open(self) -> list[PaperHedge]:
        return [h for h in self._hedges.values() if h.status == "open"]

    def mark_to_market(self, markets: list[dict]) -> list[dict]:
        """Reprice every open hedge against the live odds. Returns dicts (+ summary fields)."""
        by_id = {m["id"]: m for m in markets if "id" in m}
        out: list[dict] = []
        for h in self._hedges.values():
            mkt = by_id.get(h.event_market_id)
            if mkt:
                quote = mkt.get("best_yes") if h.side.upper() == "YES" else mkt.get("best_no")
                price = float(quote["price"]) if quote and quote.get("price") is not None else h.entry_price
            else:
                price = h.current_price or h.entry_price
            h.current_price = price
            h.current_value = round(h.contracts * price, 2)
            h.pnl = round(h.current_value - h.cost, 2)
            out.append(asdict(h))
        return out

    def summary(self) -> dict:
        opens = self.list_open()
        return {
            "open_hedges": len(opens),
            "total_premium_paid": round(sum(h.cost for h in opens), 2),
            "total_current_value": round(sum((h.current_value or h.cost) for h in opens), 2),
            "total_pnl": round(sum((h.pnl or 0.0) for h in opens), 2),
        }


# A module-level default book (the app can use its own).
book = PaperHedgeBook()


# --------------------------------------------------------------------------- #
# CLI demo: radar -> place hedges -> simulate odds move -> show P&L            #
# --------------------------------------------------------------------------- #
def _shift_markets(markets: list[dict], moves: dict[str, float]) -> list[dict]:
    """Simulate the adverse events becoming more/less likely (bump YES/NO prices)."""
    out = []
    for m in markets:
        m2 = {**m}
        delta = moves.get(m["id"], 0.0)
        if delta and m.get("best_yes") and m.get("best_no"):
            ny = min(max(m["best_yes"]["price"] + delta, 0.01), 0.99)
            m2["best_yes"] = {**m["best_yes"], "price": round(ny, 3)}
            m2["best_no"] = {**m["best_no"], "price": round(1 - ny, 3)}
        out.append(m2)
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description="One-tap hedge demo.")
    ap.add_argument("--sample", action="store_true")
    ap.parse_args()

    from structuring.radar import portfolio_risks, SAMPLE_HOLDINGS, SAMPLE_MARKETS

    # 1. radar -> exposures
    exposures = portfolio_risks(SAMPLE_HOLDINGS, SAMPLE_MARKETS)
    print(f"Radar found {len(exposures)} event risks.\n")

    # 2. one-tap hedge the top 3
    demo_book = PaperHedgeBook()
    print("Placing one-tap hedges on the top 3 risks:")
    for e in exposures[:3]:
        order = build_hedge(e)
        ph = demo_book.place(order)
        print(f"  + {ph.holding:>5} | buy {ph.contracts:>6,.0f} {ph.side} @ {ph.entry_price:.0%} "
              f"= ${ph.cost:>7,.0f} premium | covers ${ph.notional_hedged:,.0f} | resid {ph.residual_pct:.0%}")
    print(f"\n  {demo_book.summary()}\n")

    # 3. simulate the adverse events becoming MORE likely (the bad thing starts happening)
    print("Now simulate the adverse outcomes becoming more likely (+25% on each)...")
    shifted = _shift_markets(SAMPLE_MARKETS, {
        "u:poly:CLARITY": -0.25,   # CLARITY less likely to pass (NO side rises -> our NO hedge gains)
        "u:poly:DEM2028": +0.25,   # Dem win more likely (YES side rises -> our YES hedge gains)
        "u:poly:TECHREGG": +0.25,
    })
    marked = demo_book.mark_to_market(shifted)
    print("\nHedge P&L after the move:")
    for h in marked:
        sign = "+" if h["pnl"] >= 0 else ""
        print(f"  {h['holding']:>5} | entry {h['entry_price']:.0%} -> now {h['current_price']:.0%} "
              f"| value ${h['current_value']:>7,.0f} | P&L {sign}${h['pnl']:>7,.0f}")
    s = demo_book.summary()
    print(f"\n  Total hedge P&L: {'+' if s['total_pnl']>=0 else ''}${s['total_pnl']:,.0f} "
          f"(paid ${s['total_premium_paid']:,.0f}, now worth ${s['total_current_value']:,.0f})")
    print("\n  ^ When the events you hedged start happening, the hedges gain — exactly the point.\n")


if __name__ == "__main__":
    main()
