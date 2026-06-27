"""Lightweight, deterministic taxonomy inference.

This is a deliberately simple keyword pass that fills `category` / `country` /
`theme` where we can cheaply infer them, and returns None otherwise. It is the
clean seam where a later LLM tagging pass plugs in:

    # TODO(llm-tagging): replace these functions (or post-process their output)
    # with an embedding/LLM classifier. Callers only depend on the signatures
    # below, so swapping the implementation touches nothing else.

Connectors call `infer_category` / `infer_country` / `infer_theme` on the raw
question text plus any venue hints (tickers, event slugs).
"""

from __future__ import annotations

# Canonical category buckets. Keep this list small and shared across venues.
CATEGORY_KEYWORDS: dict[str, tuple[str, ...]] = {
    "Sports": (
        "nba", "nfl", "mlb", "nhl", "ufc", "soccer", "football", "world cup",
        "premier league", "tennis", "atp", "wta", "golf", "f1", "formula 1",
        "olympic", "champion", "playoff", "super bowl", "match", "vs ", " vs",
        "boxing", "cricket", "fight", "grand slam", "league",
    ),
    "Politics": (
        "president", "election", "senate", "congress", "governor", "primary",
        "parliament", "prime minister", "vote", "ballot", "nominee", "impeach",
        "cabinet", "supreme court", "referendum", "poll", "approval rating",
    ),
    "Crypto": (
        "bitcoin", "btc", "ethereum", "eth", "crypto", "solana", "dogecoin",
        "token", "stablecoin", "binance", "coinbase", "nft", "defi", "altcoin",
    ),
    "Economics": (
        "fed", "interest rate", "inflation", "cpi", "gdp", "recession",
        "unemployment", "rate cut", "rate hike", "jobs report", "fomc",
        "treasury", "tariff", "stock market", "s&p", "nasdaq", "dow",
    ),
    "Tech": (
        "ai", "openai", "gpt", "chatgpt", "google", "apple", "microsoft",
        "tesla", "nvidia", "spacex", "starship", "iphone", "model release",
        "anthropic", "meta", "llm", "chip",
    ),
    "Entertainment": (
        "movie", "box office", "oscar", "grammy", "emmy", "album", "spotify",
        "netflix", "taylor swift", "celebrity", "tv show", "rotten tomatoes",
        "billboard", "award",
    ),
    "Science": (
        "nasa", "rocket", "launch", "vaccine", "climate", "temperature record",
        "hurricane", "earthquake", "fusion", "covid", "disease", "space",
    ),
    "Weather": (
        "temperature", "rain", "snow", "hurricane", "heat", "weather", "storm",
    ),
}

# Kalshi/Polymarket ticker or slug prefixes → category (cheap, high precision).
TICKER_PREFIX_CATEGORY: dict[str, str] = {
    "KXNBA": "Sports", "KXNFL": "Sports", "KXMLB": "Sports", "KXNHL": "Sports",
    "KXUFC": "Sports", "KXATP": "Sports", "KXWTA": "Sports", "KXEPL": "Sports",
    "KXSOCCER": "Sports", "KXF1": "Sports", "KXGOLF": "Sports",
    "KXPRES": "Politics", "KXSENATE": "Politics", "KXELECTION": "Politics",
    "KXFED": "Economics", "KXCPI": "Economics", "KXGDP": "Economics",
    "KXBTC": "Crypto", "KXETH": "Crypto",
}

# Country detection: surface form → ISO-ish display name we standardize on.
COUNTRY_KEYWORDS: dict[str, str] = {
    "united states": "United States", "u.s.": "United States", "usa": "United States",
    "america": "United States", "uk": "United Kingdom", "britain": "United Kingdom",
    "england": "United Kingdom", "france": "France", "germany": "Germany",
    "china": "China", "russia": "Russia", "ukraine": "Ukraine", "india": "India",
    "japan": "Japan", "canada": "Canada", "mexico": "Mexico", "brazil": "Brazil",
    "israel": "Israel", "iran": "Iran", "south korea": "South Korea",
    "north korea": "North Korea", "argentina": "Argentina", "spain": "Spain",
    "italy": "Italy", "australia": "Australia", "netherlands": "Netherlands",
}

# Theme = a coarse, cross-category macro grouping (optional, often None).
THEME_KEYWORDS: dict[str, tuple[str, ...]] = {
    "Elections": ("election", "primary", "nominee", "ballot", "vote"),
    "Monetary Policy": ("fed", "interest rate", "rate cut", "rate hike", "fomc", "inflation"),
    "AI Race": ("openai", "gpt", "anthropic", "llm", "ai model", "agi"),
    "Geopolitics": ("war", "ceasefire", "invasion", "sanction", "nato", "treaty"),
    "World Cup": ("world cup", "fifa"),
}


# Kalshi exposes its own category strings; fold them into our shared buckets so
# the same real-world market lands in the same bucket regardless of venue.
KALSHI_CATEGORY_MAP: dict[str, str] = {
    "elections": "Politics",
    "politics": "Politics",
    "sports": "Sports",
    "entertainment": "Entertainment",
    "economics": "Economics",
    "financials": "Economics",
    "crypto": "Crypto",
    "climate and weather": "Weather",
    "science and technology": "Tech",
    "companies": "Tech",
    "health": "Science",
    "world": "World",
}


def map_native_category(native: str | None) -> str | None:
    """Map a venue-native category label into the shared taxonomy (else None)."""
    if not native:
        return None
    return KALSHI_CATEGORY_MAP.get(native.strip().lower())


def _haystack(*parts: str | None) -> str:
    return " ".join(p for p in parts if p).lower()


def infer_category(question: str, *hints: str | None) -> str | None:
    """Best-effort category from question text + venue hints (ticker/slug)."""
    for hint in hints:
        if not hint:
            continue
        upper = hint.upper()
        for prefix, cat in TICKER_PREFIX_CATEGORY.items():
            if upper.startswith(prefix):
                return cat

    text = _haystack(question, *hints)
    best: tuple[str, int] | None = None
    for category, keywords in CATEGORY_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in text)
        if hits and (best is None or hits > best[1]):
            best = (category, hits)
    return best[0] if best else None


def infer_country(question: str, *hints: str | None) -> str | None:
    text = _haystack(question, *hints)
    # Prefer longer surface forms first to avoid 'uk' matching inside words.
    for surface in sorted(COUNTRY_KEYWORDS, key=len, reverse=True):
        token = surface if " " in surface else f" {surface} "
        padded = f" {text} "
        if token in padded:
            return COUNTRY_KEYWORDS[surface]
    return None


def infer_theme(question: str, *hints: str | None) -> str | None:
    text = _haystack(question, *hints)
    for theme, keywords in THEME_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return theme
    return None
