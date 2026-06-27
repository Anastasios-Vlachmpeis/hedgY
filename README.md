# Prediction Market Aggregator (backend)

Read-only FastAPI service that pulls **live** markets from **Kalshi** and
**Polymarket**, normalizes them into one schema, groups duplicates across
venues, computes the best price per group, and serves it over a clean API.

> ⚠️ **Suggestion-only.** This service never executes trades. No auth, no order
> management, no custody, no settlement, no database — by design.

## How it works

```
                 ┌──────────────┐     ┌──────────────┐
   every 60s ───▶│  connectors  │────▶│  matching    │────▶ in-memory store ──▶ API
   (asyncio)     │ kalshi /     │     │ cluster() +  │      (atomic snapshot)
                 │ polymarket   │     │ best price   │
                 └──────────────┘     └──────────────┘
```

- **connectors/** — each venue normalizes its raw payload into `CanonicalMarket`.
  Errors in one venue are caught and logged so the other still serves.
- **matching.py** — `cluster(markets) -> list[UnifiedMarket]` groups duplicate
  questions (fuzzy title similarity) and computes the cheapest price to take each
  side across venues. Inverted YES/NO framing is normalized before comparison.
  The matcher sits behind a `Matcher` protocol so an embedding + LLM-verify
  implementation can drop in later without touching callers.
- **store.py** — in-memory snapshot, swapped atomically by the background poller.
- **taxonomy.py** — cheap deterministic `category`/`country`/`theme` inference;
  the clean seam where a later LLM tagging pass plugs in.

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload
```

The server primes its cache on startup (one fetch from both venues), then
refreshes every 60s in the background.

## API

| Method & path        | Description                                              |
|----------------------|----------------------------------------------------------|
| `GET /markets`       | List `UnifiedMarket`s. Filters: `category`, `country`, `theme`. |
| `GET /markets/{id}`  | One `UnifiedMarket` + its per-venue member markets.      |
| `GET /health`        | `ok` + per-venue counts and last refresh time.           |

### curl examples

```bash
# Merged markets from both venues
curl -s http://127.0.0.1:8000/markets | python3 -m json.tool | head -40

# Filter by inferred category
curl -s "http://127.0.0.1:8000/markets?category=Sports" | python3 -m json.tool

# Health + per-venue counts
curl -s http://127.0.0.1:8000/health | python3 -m json.tool

# Drill into one unified market (id from the /markets list, e.g. "u:kalshi:KX...")
curl -s "http://127.0.0.1:8000/markets/u:kalshi:SOME-TICKER" | python3 -m json.tool
```

Interactive docs at `http://127.0.0.1:8000/docs`.

## Configuration

All optional, via environment variables (defaults shown):

| Env var                     | Default | Meaning                              |
|-----------------------------|---------|--------------------------------------|
| `REFRESH_INTERVAL_SECONDS`  | `60`    | Background refresh cadence (min 5)   |
| `FETCH_LIMIT`               | `150`   | Top-N markets (by volume) per venue  |
| `KALSHI_EVENT_PAGES`        | `10`    | Max Kalshi event pages (200/page) scanned before the volume sort |
| `HTTP_TIMEOUT_SECONDS`      | `10.0`  | Per-request timeout per venue        |
| `MATCH_THRESHOLD`           | `0.85`  | difflib ratio cutoff for clustering  |
| `KALSHI_BASE_URL`           | …       | Override Kalshi endpoint             |
| `POLYMARKET_BASE_URL`       | …       | Override Polymarket endpoint         |

Out-of-range env values are clamped to safe bounds at startup (a typo like
`REFRESH_INTERVAL_SECONDS=0` cannot create a venue-hammering tight loop).

## Notable implementation decisions

A few choices worth calling out (all serve the "return real merged data" goal):

- **Kalshi reads `/events?with_nested_markets=true`, not `/markets`.** The
  `/markets` feed, sorted by volume, surfaces multivariate "parlay" combos whose
  titles are junk for matching (`"yes LA,yes Over 4.5 runs,…"`). The events feed
  gives the real human question, a native `category`, and the per-outcome label —
  which is what makes cross-venue matching actually work.
- **Matching = difflib + a discriminating-token guard.** Pure `difflib > 0.85`
  over-merges templated markets ("Will USA win the World Cup?" vs "Will Brazil
  win…") because the shared boilerplate dominates the character ratio. We keep
  difflib as the core and additionally require that the *rare* tokens which differ
  between two questions (entity names, numbers, year) are absent — i.e. only the
  template differs. This is still simple and deterministic, and stays behind the
  same `cluster()` seam for the future embedding + LLM matcher.
- **Inverted YES/NO framing** ("no recession" vs "recession") is normalized by a
  negation-parity flip before prices are compared.
- **Unified ids are stable across refreshes** (derived from the smallest member
  id, not the volatile highest-volume anchor), so `/markets/{id}` links keep working.

## Data model

`CanonicalMarket` (per venue) → grouped into `UnifiedMarket` (cross-venue) with
`best_yes` / `best_no` price quotes. `yes_price + no_price == 1.0`; "best" means
the **lowest price to take that side** across members.

## What's intentionally NOT here

No order routing, OMS, ledger, wallet/custody, settlement, auth, or DB
migrations. This first pass is a clean read-only aggregation core.
