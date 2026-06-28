#!/usr/bin/env python3
"""
structuring/radar.py — the event-risk radar.

Takes a user's holdings + live markets → relationship engine → risk scoring →
returns a ranked list of event-risk exposures with one-tap hedge suggestions.

This is the feature: "connect your portfolio → see your real-world event risks
in dollars → hedge any of them in one tap."

CLI:
    python3 structuring/radar.py --sample
    python3 structuring/radar.py --base http://127.0.0.1:8000
"""
from __future__ import annotations

import argparse
import json
import os
import urllib.request

from structuring.relationships import relate, EventLink
from structuring.enrichment import enrich

HERE = os.path.dirname(os.path.abspath(__file__))


# --------------------------------------------------------------------------- #
# Risk scoring                                                                 #
# --------------------------------------------------------------------------- #
def score_exposure(holding_value: float, link: EventLink, p_adverse: float) -> dict:
    """Score one (holding, event) pair into a RiskExposure."""
    move = abs(link.move_adverse)
    event_loss = holding_value * move                   # $ lost if bad outcome hits
    expected_loss = event_loss * p_adverse               # probability-weighted
    so = link.sigma_other
    residual = so * so / (move * move + so * so) if move > 0 else 1.0

    # hedge sizing (reuses the service.py math)
    p = min(max(p_adverse, 0.01), 0.99)
    N = event_loss / (1 - p)
    premium = N * p
    hedge_ratio = premium / holding_value if holding_value > 0 else 0
    hedge_efficiency = event_loss / premium if premium > 0 else 0  # $ protected per $ spent

    return {
        "holding": link.holding_symbol,
        "event": {
            "id": link.event_market_id,
            "question": link.event_question,
            "hedge_leg": link.hedge_leg,
            "p_adverse": round(p_adverse, 4),
        },
        "direction": link.direction,
        "move_adverse": link.move_adverse,
        "holding_value": round(holding_value, 2),
        "event_loss_usd": round(event_loss, 2),
        "expected_loss_usd": round(expected_loss, 2),
        "hedge": {
            "contracts": round(N),
            "premium_usd": round(premium, 2),
            "hedge_ratio": round(hedge_ratio, 4),
            "residual_pct": round(residual, 3),
            "efficiency": round(hedge_efficiency, 2),
        },
        "confidence": link.confidence,
        "rationale": link.rationale,
        "source": link.source,
    }


def _get_adverse_price(link: EventLink, market: dict) -> float | None:
    side = link.hedge_leg.upper()
    quote = market.get("best_yes") if side == "YES" else market.get("best_no")
    if not quote or quote.get("price") is None:
        return None
    return float(quote["price"])


# --------------------------------------------------------------------------- #
# The radar                                                                    #
# --------------------------------------------------------------------------- #
def portfolio_risks(
    holdings: list[dict],   # [{symbol, market_value, ...}]
    markets: list[dict],    # unified markets from /markets
    rank_by: str = "expected",  # "expected" | "worstcase"
) -> list[dict]:
    """The radar: for each holding, find its event risks and score them.

    Returns a flat list of RiskExposure dicts, ranked by the chosen metric.
    """
    # build a market lookup by id for price extraction
    market_by_id = {m["id"]: m for m in markets if "id" in m}
    exposures: list[dict] = []

    for h in holdings:
        sym = str(h.get("symbol", "")).upper()
        val = float(h.get("market_value", 0))
        if not sym or val <= 0:
            continue

        # Enrich unknown holdings (sector + industry) so the curated sector rules fire for
        # ANY ticker, not just the ~40 curated symbols. No-op if already provided.
        sector = str(h.get("sector", "") or "")
        industry = str(h.get("industry", "") or "")
        if not sector or not industry:
            info = enrich(sym)
            sector = sector or (info.get("sector") or "")
            industry = industry or (info.get("industry") or "")

        # relationship engine: which events threaten this holding?
        links = relate(sym, markets,
                       holding_sector=sector,
                       holding_themes=h.get("themes"),
                       holding_industry=industry)

        for link in links:
            mkt = market_by_id.get(link.event_market_id)
            if not mkt:
                continue
            p_adverse = _get_adverse_price(link, mkt)
            if p_adverse is None:
                continue
            exp = score_exposure(val, link, p_adverse)
            exposures.append(exp)

    # rank
    key = "expected_loss_usd" if rank_by == "expected" else "event_loss_usd"
    exposures.sort(key=lambda e: e.get(key, 0), reverse=True)
    return exposures


def portfolio_summary(exposures: list[dict]) -> dict:
    """Headline numbers for the radar."""
    total_at_risk = sum(e["event_loss_usd"] for e in exposures)
    total_expected = sum(e["expected_loss_usd"] for e in exposures)
    total_hedge_cost = sum(e["hedge"]["premium_usd"] for e in exposures)
    return {
        "total_event_risk_usd": round(total_at_risk, 2),
        "total_expected_loss_usd": round(total_expected, 2),
        "total_hedge_cost_usd": round(total_hedge_cost, 2),
        "num_exposures": len(exposures),
    }


# --------------------------------------------------------------------------- #
# Convenience: fetch markets + run                                             #
# --------------------------------------------------------------------------- #
def fetch_markets(base_url: str) -> list[dict]:
    url = base_url.rstrip("/") + "/markets"
    with urllib.request.urlopen(url, timeout=15) as resp:
        return json.load(resp)


# --------------------------------------------------------------------------- #
# Sample data for offline testing                                              #
# --------------------------------------------------------------------------- #
SAMPLE_HOLDINGS = [
    {"symbol": "ITA", "market_value": 15000, "sector": "Aerospace & Defense"},
    {"symbol": "COIN", "market_value": 8000, "sector": "Crypto"},
    {"symbol": "KRE", "market_value": 12000, "sector": "Financials"},
    {"symbol": "XOM", "market_value": 10000, "sector": "Energy"},
    {"symbol": "META", "market_value": 20000, "sector": "Technology"},
    {"symbol": "AAPL", "market_value": 25000, "sector": "Technology"},
    {"symbol": "TSLA", "market_value": 5000, "sector": "Automotive"},  # no event match expected
]

SAMPLE_MARKETS = [
    {"id": "u:kalshi:FEDCUT", "canonical_question": "Will the Fed cut interest rates at the next FOMC meeting?",
     "category": "Economics", "theme": "Fed", "venues": ["kalshi"],
     "best_yes": {"venue": "kalshi", "price": 0.62, "market_id": "kalshi:FED"},
     "best_no": {"venue": "kalshi", "price": 0.38, "market_id": "kalshi:FED"}},
    {"id": "u:poly:DEM2028", "canonical_question": "Will a Democrat win the 2028 US presidential election?",
     "category": "Politics", "theme": "Elections", "venues": ["polymarket", "kalshi"],
     "best_yes": {"venue": "polymarket", "price": 0.47, "market_id": "poly:dem28"},
     "best_no": {"venue": "kalshi", "price": 0.53, "market_id": "kalshi:dem28"}},
    {"id": "u:poly:CLARITY", "canonical_question": "Will the CLARITY Act crypto market structure bill become law in 2026?",
     "category": "Crypto", "theme": "Regulation", "venues": ["polymarket"],
     "best_yes": {"venue": "polymarket", "price": 0.41, "market_id": "poly:clarity"},
     "best_no": {"venue": "polymarket", "price": 0.59, "market_id": "poly:clarity"}},
    {"id": "u:poly:HORMUZ", "canonical_question": "Will the Strait of Hormuz be blocked or closed in 2026?",
     "category": "Geopolitics", "theme": "Middle East", "venues": ["polymarket"],
     "best_yes": {"venue": "polymarket", "price": 0.17, "market_id": "poly:hormuz"},
     "best_no": {"venue": "polymarket", "price": 0.83, "market_id": "poly:hormuz"}},
    {"id": "u:kalshi:OILPRICE", "canonical_question": "Will crude oil prices fall below $60 by end of 2026?",
     "category": "Commodities", "theme": "Energy", "venues": ["kalshi"],
     "best_yes": {"venue": "kalshi", "price": 0.25, "market_id": "kalshi:OIL"},
     "best_no": {"venue": "kalshi", "price": 0.75, "market_id": "kalshi:OIL"}},
    {"id": "u:poly:TECHREGG", "canonical_question": "Will the US pass major tech antitrust legislation by end of 2027?",
     "category": "Politics", "theme": "Tech Regulation", "venues": ["polymarket"],
     "best_yes": {"venue": "polymarket", "price": 0.22, "market_id": "poly:techreg"},
     "best_no": {"venue": "polymarket", "price": 0.78, "market_id": "poly:techreg"}},
    {"id": "u:poly:IRAN", "canonical_question": "Will the US reach a nuclear deal with Iran by end of 2026?",
     "category": "Geopolitics", "theme": "Middle East", "venues": ["polymarket"],
     "best_yes": {"venue": "polymarket", "price": 0.35, "market_id": "poly:iran"},
     "best_no": {"venue": "polymarket", "price": 0.65, "market_id": "poly:iran"}},
]


# --------------------------------------------------------------------------- #
# CLI                                                                          #
# --------------------------------------------------------------------------- #
def _print_radar(exposures: list[dict], summary: dict) -> None:
    print(f"{'='*90}")
    print(f"  EVENT-RISK RADAR")
    print(f"  Total event-at-risk: ${summary['total_event_risk_usd']:,.0f}")
    print(f"  Expected loss (prob-weighted): ${summary['total_expected_loss_usd']:,.0f}")
    print(f"  Cost to hedge all: ${summary['total_hedge_cost_usd']:,.0f}")
    print(f"  {summary['num_exposures']} exposures across your holdings")
    print(f"{'='*90}\n")

    hdr = ["#", "holding", "event risk", "$ at risk", "prob", "exp.loss", "hedge$", "ratio", "resid", "eff"]
    print(f"{'':>3} {hdr[1]:<8}{hdr[2]:<44}{hdr[3]:>10}{hdr[4]:>6}{hdr[5]:>10}{hdr[6]:>9}{hdr[7]:>7}{hdr[8]:>7}{hdr[9]:>6}")
    print("-" * 105)
    for i, e in enumerate(exposures, 1):
        q = e["event"]["question"][:40]
        conf = "*" if e["confidence"] < 0.5 else " "
        print(f"{i:>3} {e['holding']:<8}{q:<44}${e['event_loss_usd']:>8,.0f}{e['event']['p_adverse']:>6.0%}"
              f"${e['expected_loss_usd']:>8,.0f}${e['hedge']['premium_usd']:>7,.0f}"
              f"{e['hedge']['hedge_ratio']:>7.1%}{e['hedge']['residual_pct']:>7.0%}{conf}{e['hedge']['efficiency']:>5.1f}x")
    print("-" * 105)
    print("exp.loss = $ at risk x probability.  ratio = hedge cost / position.  resid = uncovered risk.")
    print("eff = $ protected per $ spent (higher = more attractive hedge).  * = low-confidence.\n")


def main() -> None:
    ap = argparse.ArgumentParser(description="Event-risk radar for a portfolio.")
    ap.add_argument("--base", default="http://127.0.0.1:8000", help="aggregator base url")
    ap.add_argument("--sample", action="store_true", help="run on built-in sample data")
    args = ap.parse_args()

    if args.sample:
        markets = SAMPLE_MARKETS
        holdings = SAMPLE_HOLDINGS
        print(f"[sample mode] {len(holdings)} holdings, {len(markets)} markets\n")
    else:
        try:
            markets = fetch_markets(args.base)
            print(f"[live] {len(markets)} markets from {args.base}")
        except Exception as exc:
            print(f"could not reach {args.base} ({exc}); falling back to --sample\n")
            markets = SAMPLE_MARKETS
        holdings = SAMPLE_HOLDINGS  # live holdings would come from /portfolio
        print(f"[sample holdings] {len(holdings)} positions\n")

    exposures = portfolio_risks(holdings, markets)
    summary = portfolio_summary(exposures)
    _print_radar(exposures, summary)


if __name__ == "__main__":
    main()
