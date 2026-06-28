"""
structuring/enrichment.py — ticker -> {sector, industry, name}.

This is what generalizes the relationship engine beyond the ~40 curated tickers:
enrich any holding to its sector/industry, and the sector-rules fire for ANY
company in that sector. Free, no API key.

Sources (in order): Yahoo Finance (crumb flow) -> SEC EDGAR (SIC) fallback.
Results are cached in-memory (per process).
"""
from __future__ import annotations

import threading

import httpx

_cache: dict[str, dict] = {}
_lock = threading.Lock()
_yc: httpx.Client | None = None
_crumb: str | None = None

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
SEC_UA = "paris-hack radar research@paris-hack.dev"


# --- Yahoo (primary) --------------------------------------------------------- #
def _yahoo_client() -> tuple[httpx.Client, str]:
    global _yc, _crumb
    if _yc is None or not _crumb:
        _yc = httpx.Client(headers={"User-Agent": UA}, timeout=12, follow_redirects=True)
        _yc.get("https://fc.yahoo.com")
        _crumb = _yc.get("https://query2.finance.yahoo.com/v1/test/getcrumb").text
    return _yc, _crumb


def _yahoo(symbol: str) -> dict | None:
    global _yc, _crumb
    for attempt in (1, 2):
        c, crumb = _yahoo_client()
        r = c.get(f"https://query2.finance.yahoo.com/v10/finance/quoteSummary/{symbol}",
                  params={"modules": "assetProfile,price", "crumb": crumb})
        if r.status_code == 401 and attempt == 1:
            _yc, _crumb = None, None      # crumb expired -> refresh once
            continue
        if r.status_code != 200:
            return None
        res = r.json().get("quoteSummary", {}).get("result") or []
        if not res:
            return None
        prof = res[0].get("assetProfile", {})
        price = res[0].get("price", {})
        if not prof.get("sector"):
            return None
        return {
            "sector": prof.get("sector"),
            "industry": prof.get("industry") or "",
            "country": prof.get("country") or "",
            "name": (price.get("shortName") or price.get("longName") or symbol),
        }
    return None


# --- SEC EDGAR (fallback) ---------------------------------------------------- #
_SIC_SECTOR = [
    (("pharmaceutical", "biological", "medicinal", "drug", "biotech"), "Healthcare"),
    (("national commercial bank", "state commercial bank", "savings", "banks", "credit union"), "Financial Services"),
    (("petroleum", "crude", "oil", "natural gas", "drilling"), "Energy"),
    (("guided missiles", "aircraft", "aerospace", "ordnance", "defense"), "Industrials"),
    (("computer", "semiconductor", "software", "prepackaged", "electronic"), "Technology"),
    (("real estate", "reit"), "Real Estate"),
    (("water transportation", "marine", "shipping", "trucking", "transportation"), "Industrials"),
    (("services-computer", "telephone", "communication"), "Communication Services"),
]
_sec_ciks: dict[str, str] | None = None


def _sec(symbol: str) -> dict | None:
    global _sec_ciks
    if _sec_ciks is None:
        tk = httpx.get("https://www.sec.gov/files/company_tickers.json",
                       headers={"User-Agent": SEC_UA}, timeout=12).json()
        _sec_ciks = {v["ticker"].upper(): str(v["cik_str"]).zfill(10) for v in tk.values()}
    cik = _sec_ciks.get(symbol)
    if not cik:
        return None
    s = httpx.get(f"https://data.sec.gov/submissions/CIK{cik}.json",
                  headers={"User-Agent": SEC_UA}, timeout=12).json()
    sic_desc = (s.get("sicDescription") or "").strip()
    sector = None
    low = sic_desc.lower()
    for kws, sec in _SIC_SECTOR:
        if any(k in low for k in kws):
            sector = sec
            break
    return {"sector": sector, "industry": sic_desc, "country": "United States",
            "name": s.get("name", symbol)}


# --- public ------------------------------------------------------------------ #
def enrich(symbol: str) -> dict:
    """Return {sector, industry, country, name} for a ticker (cached)."""
    symbol = symbol.upper().strip()
    with _lock:
        if symbol in _cache:
            return _cache[symbol]
    info = None
    try:
        info = _yahoo(symbol)
    except Exception:
        info = None
    if not info or not info.get("sector"):
        try:
            info = _sec(symbol) or info
        except Exception:
            pass
    info = info or {"sector": None, "industry": None, "country": None, "name": symbol}
    with _lock:
        _cache[symbol] = info
    return info
