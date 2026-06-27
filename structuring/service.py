#!/usr/bin/env python3
"""
structuring/service.py  -  the live structuring service (P2).

Wires the hedge classifier (see hedge-classifier.md) to the live aggregator.
It reads the aggregator's unified markets (the `GET /markets` output), matches
each of the 5 starter templates to a live market, pulls the live price, runs the
classifier (sizing + dollar-offset + residual + classification) from
`templates.json`, and returns the live hedge suggestions.

Boundary: this is the P2 structuring logic as a LIBRARY. It does not touch the
backend `app/`. To expose it, the backend adds one thin route, e.g.:

    # app/main.py
    from structuring.service import suggest_hedges
    @app.get("/suggestions")
    def suggestions(notional: float = 10_000):
        markets = [m.model_dump() for m in store.list_unified()]
        return suggest_hedges(markets, notional=notional)

Stdlib only. Read-only / suggestion-only (consistent with the aggregator).

CLI:
    python3 structuring/service.py            # hit the live aggregator (/markets)
    python3 structuring/service.py --sample   # run on a built-in sample
    python3 structuring/service.py --base http://127.0.0.1:8000 --notional 10000
"""
from __future__ import annotations

import argparse
import json
import os
import urllib.request

# --------------------------------------------------------------------------- #
# Calibration thresholds (mirror hedge-classifier.md section 6).               #
# --------------------------------------------------------------------------- #
PARAMS = {
    "minEffect": 0.03,        # min |moveAdverse| to be "linked"
    "minConfidence": 0.5,     # below this = low-confidence flag (NOT unrelated)
    "minHedgeQuality": 0.5,   # below this = expression rather than hedge
    "premiumCapPct": None,    # None = full offset; e.g. 0.10 caps spend at 10% of notional
}

# How each template finds its live market in the aggregator feed. Matching lives
# in the service (not in templates.json, which stays pure calibration data).
TEMPLATE_MATCH = {
    "defense_election":   {"keywords": ["election", "president", "2028", "nominee", "ceasefire", "peace deal", "incumbent"], "minScore": 1},
    "pharma_trial":       {"keywords": ["fda", "drug approval", "approve drug", "phase 3", "clinical trial"], "minScore": 1},
    "shipping_hormuz":    {"keywords": ["hormuz", "strait of hormuz", "shipping lane blocked"], "minScore": 1},
    "rates_fed":          {"keywords": ["fed rate", "rate cut", "rate hike", "fomc", "federal reserve", "fed cut", "interest rate"], "minScore": 1},
    "crypto_legislation": {"keywords": ["crypto bill", "clarity act", "stablecoin bill", "crypto legislation", "crypto regulation", "market structure bill"], "minScore": 1},
}

HERE = os.path.dirname(os.path.abspath(__file__))


# --------------------------------------------------------------------------- #
# Data loading                                                                 #
# --------------------------------------------------------------------------- #
def load_templates(path: str | None = None) -> list[dict]:
    """Load the 5 calibrated templates from templates.json (next to this file)."""
    path = path or os.path.join(HERE, "templates.json")
    with open(path) as f:
        return json.load(f)["templates"]


def fetch_markets(base_url: str) -> list[dict]:
    """GET {base_url}/markets and return the list of unified-market dicts."""
    url = base_url.rstrip("/") + "/markets"
    with urllib.request.urlopen(url, timeout=15) as resp:
        return json.load(resp)


# --------------------------------------------------------------------------- #
# Matching a template to a live market                                         #
# --------------------------------------------------------------------------- #
def _haystack(market: dict) -> str:
    parts = [market.get("canonical_question", "")]
    for k in ("category", "country", "theme"):
        if market.get(k):
            parts.append(str(market[k]))
    return " ".join(parts).lower()


def match_market(template_id: str, markets: list[dict]) -> dict | None:
    """Best-scoring live market for a template, or None if none clears minScore."""
    cfg = TEMPLATE_MATCH.get(template_id)
    if not cfg:
        return None
    best, best_score = None, 0
    for m in markets:
        hay = _haystack(m)
        score = sum(1 for kw in cfg["keywords"] if kw.lower() in hay)
        if score > best_score:
            best, best_score = m, score
    return best if best_score >= cfg["minScore"] else None


def adverse_price(template: dict, market: dict) -> tuple[str, float] | None:
    """The side we BUY to hedge (the side that pays in the adverse state) and its
    live price. leg=YES -> buy YES -> best_yes; leg=NO -> buy NO -> best_no."""
    side = template["hedge"]["leg"].upper()      # "YES" | "NO"
    quote = market.get("best_yes") if side == "YES" else market.get("best_no")
    if not quote or quote.get("price") is None:
        return None
    return side, float(quote["price"])


# --------------------------------------------------------------------------- #
# The classifier (sizing + offset + residual + classification)                 #
# --------------------------------------------------------------------------- #
def assess(template: dict, p: float, notional: float, params: dict) -> dict:
    move = template["moveAdverse"]          # signed, e.g. -0.25
    conf = template["confidence"]
    so = template["sigmaOther"]
    p = min(max(p, 0.01), 0.99)             # guard degenerate prices
    flags: list[str] = []

    if abs(move) < params["minEffect"]:
        return {"classification": "unrelated", "reason": "effect too small", "flags": flags}
    if conf < params["minConfidence"]:
        flags.append("low-confidence")

    L = notional * abs(move)                # expected loss in the adverse state
    cap = params["premiumCapPct"]
    budget = cap * notional if cap else float("inf")
    N = min(L / (1 - p), budget / p)        # contracts (respect premium cap if set)
    premium = N * p
    net_gain_adverse = N * (1 - p)
    dollar_offset = net_gain_adverse / L
    hedge_quality = max(0.0, min(1.0, net_gain_adverse / L))
    residual = so * so / (move * move + so * so)
    classification = "hedge" if hedge_quality >= params["minHedgeQuality"] else "expression"

    return {
        "classification": classification,
        "moveAdverse": move,
        "confidence": conf,
        "contractPrice": round(p, 4),
        "expectedLossUsd": round(L, 2),
        "contracts": round(N),
        "premiumUsd": round(premium, 2),
        "hedgeRatio": round(premium / notional, 4),
        "dollarOffset": round(dollar_offset, 3),
        "hedgeQuality": round(hedge_quality, 3),
        "residualPct": round(residual, 3),
        "flags": flags,
        "expiryAlignment": template.get("expiryAlignment"),
    }


# --------------------------------------------------------------------------- #
# The public entry point                                                       #
# --------------------------------------------------------------------------- #
def suggest_hedges(markets: list[dict], notional: float = 10_000.0,
                   params: dict | None = None, templates: list[dict] | None = None) -> list[dict]:
    """For each starter template, find its live market and return a hedge suggestion.

    `markets` is the list of unified-market dicts from the aggregator's /markets.
    Returns one suggestion per template; `matched=False` when no live market is found.
    """
    params = params or PARAMS
    templates = templates if templates is not None else load_templates()
    out: list[dict] = []

    for t in templates:
        suggestion = {
            "template": t["id"],
            "thesis": t["thesis"],
            "primary": t["primary"]["symbol"],
            "matched": False,
            "market": None,
        }
        market = match_market(t["id"], markets)
        if market is None:
            suggestion["reason"] = "no live market found for this event"
            out.append(suggestion)
            continue

        priced = adverse_price(t, market)
        if priced is None:
            suggestion["market"] = {"id": market.get("id"), "question": market.get("canonical_question")}
            suggestion["reason"] = "matched market has no usable price quote"
            out.append(suggestion)
            continue

        side, p = priced
        suggestion["matched"] = True
        suggestion["market"] = {
            "id": market.get("id"),
            "question": market.get("canonical_question"),
            "venues": market.get("venues", []),
            "side": side,               # the side we'd BUY to hedge
            "price": round(p, 4),       # live implied prob of the adverse outcome
        }
        suggestion.update(assess(t, p, notional, params))
        out.append(suggestion)

    return out


def fetch_and_suggest(base_url: str = "http://127.0.0.1:8000",
                      notional: float = 10_000.0, params: dict | None = None) -> list[dict]:
    """Convenience: pull live /markets and structure the suggestions in one call."""
    return suggest_hedges(fetch_markets(base_url), notional=notional, params=params)


# --------------------------------------------------------------------------- #
# Built-in sample (mirrors the real /markets shape) for offline testing        #
# --------------------------------------------------------------------------- #
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
    # noise (should NOT match any template)
    {"id": "u:poly:WC", "canonical_question": "Will Brazil win the 2026 FIFA World Cup?",
     "category": "Sports", "theme": "World Cup", "venues": ["polymarket"],
     "best_yes": {"venue": "polymarket", "price": 0.16, "market_id": "poly:wc"},
     "best_no": {"venue": "polymarket", "price": 0.84, "market_id": "poly:wc"}},
]


# --------------------------------------------------------------------------- #
# CLI                                                                          #
# --------------------------------------------------------------------------- #
def _print_table(suggestions: list[dict]) -> None:
    hdr = ["template", "matched", "side", "price", "loss$", "N", "prem$", "ratio", "resid", "class"]
    print(("{:<19}{:>8}{:>5}{:>7}{:>8}{:>7}{:>8}{:>7}{:>7}{:>12}").format(*hdr))
    print("-" * 90)
    for s in suggestions:
        if not s["matched"]:
            print(f"{s['template']:<19}{'no':>8}{'-':>5}{'-':>7}{'-':>8}{'-':>7}{'-':>8}{'-':>7}{'-':>7}{'(no market)':>12}")
            continue
        m = s["market"]
        cls = s["classification"] + ("*" if "low-confidence" in s.get("flags", []) else "")
        print(("{:<19}{:>8}{:>5}{:>7.0%}{:>8,.0f}{:>7,.0f}{:>8,.0f}{:>7.1%}{:>7.0%}{:>12}").format(
            s["template"], "yes", m["side"], m["price"], s["expectedLossUsd"], s["contracts"],
            s["premiumUsd"], s["hedgeRatio"], s["residualPct"], cls))
    print("-" * 90)
    print("price = live implied prob of the adverse outcome (best price to take the hedge side).")
    print("ratio = premium / notional (cost of protection).  resid = uncovered (market/sector) risk.")
    print("* = low-confidence (still a hedge; widen disclosure).")


def main() -> None:
    ap = argparse.ArgumentParser(description="Live hedge suggestions from the aggregator.")
    ap.add_argument("--base", default="http://127.0.0.1:8000", help="aggregator base url")
    ap.add_argument("--notional", type=float, default=10_000.0)
    ap.add_argument("--sample", action="store_true", help="run on the built-in sample instead of live")
    args = ap.parse_args()

    if args.sample:
        markets = SAMPLE_MARKETS
        print(f"[sample mode] {len(markets)} markets\n")
    else:
        try:
            markets = fetch_markets(args.base)
            print(f"[live] {len(markets)} unified markets from {args.base}\n")
        except Exception as exc:  # noqa: BLE001
            print(f"could not reach {args.base} ({exc}); falling back to --sample\n")
            markets = SAMPLE_MARKETS

    suggestions = suggest_hedges(markets, notional=args.notional)
    _print_table(suggestions)


if __name__ == "__main__":
    main()
