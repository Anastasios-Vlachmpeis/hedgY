"""
structuring/relationships.py — the relationship engine (P2 rules, P1 builds).

Maps any holding to the live event markets that materially threaten it.
Layer 1 (curated priors) of the 4-layer funnel. Layers 2-4 (embeddings,
LLM verify, event-study calibration) plug in later without changing the
interface.

Output: for a holding, a ranked list of EventLink objects.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class EventLink:
    """One relationship: a holding is threatened by a specific event market."""
    holding_symbol: str
    event_market_id: str
    event_question: str
    direction: str              # "adverse" | "favorable"
    hedge_leg: str              # "YES" | "NO" — the side to BUY to hedge
    move_adverse: float         # estimated % move if the adverse outcome hits (signed, e.g. -0.12)
    confidence: float           # 0..1
    sigma_other: float          # non-event vol for residual calc
    source: str = "curated"     # "curated" | "semantic" | "llm" | "eventstudy"
    rationale: str = ""


# --------------------------------------------------------------------------- #
# Layer 1: Curated priors (sector/theme -> event categories).                  #
# High precision, limited coverage. The "reliable floor."                      #
# --------------------------------------------------------------------------- #

# Each rule: if a holding matches the sector/symbols, find the best live market
# matching the keywords, and return an EventLink with the calibrated params.
CURATED_RULES: list[dict] = [
    {
        "name": "defense_election",
        "match_symbols": {"ITA", "LMT", "RTX", "NOC", "GD", "BA", "HII", "LHX"},
        # match on industry ("Aerospace & Defense"), NOT the broad "Industrials" sector,
        # so generic industrials/shipping names don't false-fire the defense rule.
        "match_sectors": {"Aerospace & Defense", "aerospace", "defense"},
        "event_keywords": ["election", "president", "2028", "nominee", "ceasefire", "peace deal", "incumbent"],
        "hedge_leg": "YES",
        "direction": "adverse",
        "move_adverse": -0.08,
        "confidence": 0.5,
        "sigma_other": 0.10,
        "rationale": "A peace-favoring / incumbent-change outcome may cut defense budgets.",
    },
    {
        "name": "rates_fed",
        "match_symbols": {"KRE", "XLF", "BAC", "JPM", "WFC", "C", "GS", "MS", "SCHW", "IYR", "VNQ", "IWM"},
        # Yahoo: "Financial Services" + "Banks - Regional/Diversified"; "Real Estate" + "REIT - ...".
        "match_sectors": {"Financial Services", "Financials", "Banking", "bank", "Real Estate", "REIT"},
        "event_keywords": ["fed rate", "rate cut", "rate hike", "fomc", "federal reserve", "interest rate"],
        "hedge_leg": "NO",
        "direction": "adverse",
        "move_adverse": -0.05,
        "confidence": 0.6,
        "sigma_other": 0.08,
        "rationale": "A hold/hike instead of a cut hurts rate-sensitive equities.",
    },
    {
        "name": "crypto_legislation",
        "match_symbols": {"COIN", "MSTR", "RIOT", "MARA", "CLSK", "HUT", "BITF", "CIFR"},
        "match_sectors": {"Crypto", "Blockchain", "Digital Assets"},
        "event_keywords": ["crypto bill", "clarity act", "stablecoin bill", "crypto legislation",
                           "crypto regulation", "market structure bill"],
        "hedge_leg": "NO",
        "direction": "adverse",
        "move_adverse": -0.18,
        "confidence": 0.45,
        "sigma_other": 0.20,
        "rationale": "Key market-structure legislation stalling hurts crypto-proxy equities.",
    },
    {
        "name": "shipping_hormuz",
        "match_symbols": {"BOAT", "BDRY", "SBLK", "GOGL", "ZIM", "MATX"},
        # Yahoo industry for shipping names is "Marine Shipping" (sector is the broad "Industrials").
        "match_sectors": {"Marine Shipping", "marine", "shipping", "Marine Transportation", "Logistics"},
        "event_keywords": ["hormuz", "strait of hormuz", "shipping lane blocked"],
        "hedge_leg": "YES",
        "direction": "adverse",
        "move_adverse": -0.15,
        "confidence": 0.4,
        "sigma_other": 0.14,
        "rationale": "A Hormuz blockade disrupts routes and hits a broad shipping selloff.",
    },
    {
        "name": "energy_oil",
        "match_symbols": {"XLE", "XOP", "CVX", "XOM", "COP", "OXY", "SLB", "HAL", "EOG", "MPC"},
        "match_sectors": {"Energy", "Oil & Gas"},
        "event_keywords": ["oil price", "opec cut", "opec production", "crude oil", "energy crisis",
                           "iran deal", "iran sanctions"],
        "hedge_leg": "YES",
        "direction": "adverse",
        "move_adverse": -0.10,
        "confidence": 0.5,
        "sigma_other": 0.15,
        "rationale": "Geopolitical or OPEC events can swing energy equities.",
    },
    {
        "name": "tech_regulation",
        "match_symbols": {"META", "GOOGL", "GOOG", "AMZN", "AAPL", "MSFT", "NVDA"},
        # "Technology" sector + "Internet Content & Information" industry (GOOGL/META live under
        # Yahoo's "Communication Services" sector, so match their industry string too).
        "match_sectors": {"Technology", "Internet Content", "Big Tech"},
        "event_keywords": ["antitrust", "tech regulation", "ai regulation", "section 230",
                           "big tech breakup"],
        "hedge_leg": "YES",
        "direction": "adverse",
        "move_adverse": -0.08,
        "confidence": 0.35,
        "sigma_other": 0.12,
        "rationale": "Major tech regulation could pressure mega-cap valuations.",
    },
]


def _haystack(market: dict) -> str:
    parts = [market.get("canonical_question", "")]
    for k in ("category", "country", "theme"):
        if market.get(k):
            parts.append(str(market[k]))
    return " ".join(parts).lower()


def _best_market(keywords: list[str], markets: list[dict]) -> dict | None:
    best, best_score = None, 0
    for m in markets:
        hay = _haystack(m)
        score = sum(1 for kw in keywords if kw.lower() in hay)
        if score > best_score:
            best, best_score = m, score
    return best if best_score >= 1 else None


def relate(holding_symbol: str, markets: list[dict],
           holding_sector: str = "", holding_themes: list[str] | None = None,
           holding_industry: str = "") -> list[EventLink]:
    """Layer-1 relationship engine: curated priors only.

    For a single holding, returns all matching EventLinks (may be 0..N).
    Matching fires on symbol, or on the enriched sector/industry text (so the rules
    generalize to ANY ticker via structuring.enrichment, not just the curated symbols).
    Later layers (embeddings, LLM, event-study) extend this without changing the signature.
    """
    sym = holding_symbol.upper().strip()
    # Match curated terms against the combined sector + industry text. Industry carries the
    # precise signal (e.g. "Aerospace & Defense", "Marine Shipping", "Banks - Regional").
    sector_text = f"{holding_sector} {holding_industry}".lower()
    themes = set(t.lower() for t in (holding_themes or []))
    links: list[EventLink] = []

    for rule in CURATED_RULES:
        # Does the holding match this rule?
        symbol_match = sym in rule["match_symbols"]
        sector_match = any(s.lower() in sector_text for s in rule["match_sectors"]) if sector_text.strip() else False
        theme_match = any(s.lower() in themes for s in rule["match_sectors"]) if themes else False

        if not (symbol_match or sector_match or theme_match):
            continue

        # Find the best live market for this rule
        market = _best_market(rule["event_keywords"], markets)
        if market is None:
            continue

        links.append(EventLink(
            holding_symbol=sym,
            event_market_id=market.get("id", ""),
            event_question=market.get("canonical_question", ""),
            direction=rule["direction"],
            hedge_leg=rule["hedge_leg"],
            move_adverse=rule["move_adverse"],
            confidence=rule["confidence"],
            sigma_other=rule["sigma_other"],
            source="curated",
            rationale=rule["rationale"],
        ))

    return links
