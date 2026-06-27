# Handoff — Prediction Market Aggregator Backend

Status as of this handoff: **first pass complete, runs end-to-end, serves real
merged data from both venues.** Read-only suggestion service (no trading).

---

## 1. What this is

A FastAPI backend that:
1. Pulls **live** markets from **Kalshi** and **Polymarket** (public APIs, no keys),
2. Normalizes both into one canonical schema,
3. Groups duplicate markets **across venues**,
4. Computes the **best price per side** for each group,
5. Serves it over a clean REST API.

It **suggests** positions only — it never trades. No auth, OMS, order routing,
ledger, wallet/custody, settlement, or DB. By design.

Tech: Python 3.11+ (validated on 3.14.5), FastAPI, Pydantic v2, httpx (async),
uvicorn, numpy (installed, reserved for the future matcher). In-memory store
refreshed by a background asyncio task every 60s.

---

## 2. Current real-world results

`uvicorn app.main:app` then `curl /markets`:

- Kalshi **150** + Polymarket **150** = **300 canonical markets**
- → **271 unified markets**, of which **28 are genuine cross-venue merges**
- Background poller refreshes every 60s; verified stable, zero errors
- Example merged market: *"Will Bernie Sanders win the 2028 Democratic presidential
  nomination?"* — merges Kalshi `KXPRESNOMD-28-BS` + Polymarket; `best_yes` =
  Kalshi **0.0025** vs Polymarket 0.0075 (cheaper to take YES on Kalshi).

The 28 cross-venue merges are currently concentrated in **2028 US election /
Democratic-nominee** markets — those are the questions both venues phrase similarly
right now. (Polymarket's top-volume is seasonally World-Cup-heavy; Kalshi has no
World Cup winner markets, so those stay single-venue.)

---

## 3. File map (~1,250 lines under `app/`)

```
app/
  __init__.py
  main.py            FastAPI app, lifespan poller, routes, refresh_once()
  config.py          Settings (env-overridable, clamped to safe bounds)
  models.py          Pydantic v2: CanonicalMarket, UnifiedMarket, *Detail, Health
  store.py           In-memory store: immutable Snapshot swapped atomically
  taxonomy.py        Deterministic category/country/theme inference (LLM seam)
  matching.py        cluster() -> list[UnifiedMarket]; swappable Matcher protocol
  connectors/
    __init__.py
    base.py          Connector protocol + shared parse helpers (safe_float, parse_dt, clamp_price)
    kalshi.py        Kalshi connector (reads /events)
    polymarket.py    Polymarket connector (reads gamma /markets)
requirements.txt
README.md            Run instructions, curl examples, design notes
HANDOFF.md           (this file)
```

---

## 4. How each piece works

### Canonical model (the contract — `models.py`)
- `CanonicalMarket`: id (`"{venue}:{venue_market_id}"`), venue, venue_market_id,
  question, resolution_criteria, yes_price, no_price (both in [0,1], sum to 1),
  category, tags, country, theme, close_time, volume, liquidity, deep_link, updated_at.
- `UnifiedMarket`: id, canonical_question, members[ids], best_yes/best_no
  (`PriceQuote{venue, price, market_id}`), match_confidence, + display fields
  (category/country/theme/venues).
- `UnifiedMarketDetail`: UnifiedMarket + `member_markets: list[CanonicalMarket]`
  (returned by `GET /markets/{id}`).

### Connectors
**Kalshi (`kalshi.py`) — reads `/events?with_nested_markets=true`** (NOT `/markets`).
- Cursor pagination, capped at `KALSHI_EVENT_PAGES` (default 10 × 200/page).
- Builds a clean question: market `title`, plus `yes_sub_title` appended for
  multi-outcome events (so each candidate is distinct, e.g. "Who will the next Pope
  be? <name>").
- Skips multivariate parlay markets (`mve_selected_legs` / `MVE` tickers).
- Prices are fixed-point **dollar STRINGS** in `*_dollars` fields. yes_price =
  mid of `yes_bid_dollars`/`yes_ask_dollars`, else `last_price_dollars`, else a
  single side; no_price = 1 - yes. Markets with no real price signal are dropped.
- Uses Kalshi's native `category` (mapped into the shared taxonomy) as a fallback.
- Then keeps top `FETCH_LIMIT` by volume.

**Polymarket (`polymarket.py`) — reads gamma `/markets`.**
- `order=volumeNum&ascending=false`; gamma caps a page at 100, so it
  **offset-paginates** up to `FETCH_LIMIT`.
- GOTCHA handled: `outcomes`, `outcomePrices`, `clobTokenIds` arrive as
  **JSON-encoded strings** → `json.loads` before indexing.
- YES price located by matching the "Yes" outcome label (handles inverted order);
  only clean binary Yes/No markets are kept.
- deep_link points at the specific market: `/event/{event_slug}/{market_slug}`.

Both connectors: 10s timeout, log+re-raise on venue failure; **per-market
try/except** so one bad row can't drop the whole batch.

### Matching (`matching.py`) — the interesting part
`cluster(markets) -> list[UnifiedMarket]` behind a `Matcher` protocol (swap
`DEFAULT_MATCHER` for an embedding/LLM version later; callers don't change).

`DifflibMatcher` algorithm:
1. `normalize_question`: lowercase, strip punctuation / months / weekdays / filler;
   **year is stripped from the difflib string** (venues place it in different
   positions and difflib is position-sensitive).
2. Greedy clustering, high-volume anchors first. Two questions merge iff:
   - **difflib ratio ≥ 0.85** (`MATCH_THRESHOLD`), AND
   - **discriminating-token guard passes**: the *symmetric difference* of their
     token sets contains no globally-**rare** token (entity name / number / year).
     This is what stops templated markets from over-merging ("Will USA win the
     World Cup?" vs "Will Brazil win…" — symdiff `{usa, brazil}` are rare → reject).
     Year is injected into the guard's token set (via `year_tokens()`) but kept out
     of the difflib string, so 2024 vs 2025 never merge while same-year pairs still do.
3. **Inverted framing**: a negation-parity flip ("no recession" vs "recession")
   orients each member's YES/NO into the anchor's framing before comparing prices.
   Negators are restricted to `{no, not, never}` and exempted from the guard.
4. `best_yes`/`best_no` = lowest price to take that side across (oriented) members.
5. `match_confidence` = min pairwise difflib ratio (1.0 for singletons).
6. **Unified id is stable** across refreshes: `u:{smallest member id}` (NOT the
   volatile volume anchor), so `/markets/{id}` links keep working.

### Store (`store.py`)
- Immutable `Snapshot` (markets_by_id, unified, unified_by_id, venue counts/errors,
  last_refresh). The poller builds a fresh snapshot and swaps it with one attribute
  assignment (atomic in CPython); readers grab the reference once → no locks on reads.
- `write_lock` only serializes writers.

### App (`main.py`)
- `lifespan`: primes the store with one refresh on startup (so the first request
  has data), then spawns the 60s poller task; cancels it cleanly on shutdown.
- `refresh_once()`: `asyncio.gather(*connectors, return_exceptions=True)` → venue
  isolation happens here (one venue failing is recorded in /health, doesn't crash
  the other) → `cluster()` → `store.replace()`.
- Routes:
  - `GET /markets` — list `UnifiedMarket`; filters `category`, `country`, `theme`.
  - `GET /markets/{id:path}` — `UnifiedMarketDetail` (unified + per-venue members);
    `:path` so ids containing colons work. 404 if unknown.
  - `GET /health` — status, last_refresh, per-venue counts + last_error.
  - `GET /` — service info.

### Taxonomy (`taxonomy.py`)
Cheap deterministic keyword inference for category/country/theme + a Kalshi
native-category map. Returns None when unsure. **This is the clean seam** where a
later LLM tagging pass plugs in (`infer_category` / `infer_country` / `infer_theme`).

---

## 5. Deliberate deviations from the original one-line spec (with rationale)

1. **Kalshi reads `/events`, not `/markets`.** The volume-sorted `/markets` feed is
   dominated by multivariate parlay combos with junk titles
   (`"yes LA,yes Over 4.5 runs,…"`) → 0 cross-venue merges. `/events` gives the real
   question + native category + per-outcome label → matching actually works. Same
   "top-N by volume, fast load" contract.
2. **Matching adds a discriminating-token guard on top of difflib-0.85.** Pure
   difflib over-merged 18 World Cup countries and unrelated candidates. Kept difflib
   as the core (per spec) behind the same `cluster()` seam.
3. **Added `app/taxonomy.py`** (one small helper module) to implement the
   "normalize into a small shared taxonomy" requirement with a clean LLM seam.

Everything else matches the spec.

---

## 6. Adversarial review — 13 issues found and FIXED

A 7-dimension review (spec-compliance, connector-correctness, async/concurrency,
error-handling, matching-logic, api/pydantic, robustness) with each finding
independently verified against the running code. All 13 confirmed issues fixed and
re-verified:

- **HIGH** — token guard was *blocking* inverse-framed (`no X` vs `X`) merges the
  negation-flip exists for → now merge with correct price orientation.
- **HIGH** — `normalize_question` stripped the year, merging 2024 vs 2025 markets at
  confidence 1.0 → year now discriminates (without hurting same-year matching).
- **MED** — Polymarket deep_link collapsed all outcomes of an event to one URL → now
  market-specific.
- **MED** — per-market try/except in both connectors (one bad row no longer drops the batch).
- **MED** — unified id was the volatile volume anchor → now stable (min member id).
- **MED** — negation set included domain verbs (lose/miss/fail) that could mis-flip
  prices → restricted to {no, not, never}.
- **MED** — NaN upstream price could drop the Polymarket venue → `safe_float`/`clamp_price`
  are now NaN/inf-safe.
- **MED** — config had no bounds (refresh=0 → tight loop) → env values clamped + Field bounds.
- **LOW ×4** — deep_link fallback path, connector docstring contract wording.

Verified after fixes: 271 unified, **28 cross-venue merges restored, 0 impure
clusters**, cross-year separation holds, inverse-framing merges correctly.

---

## 7. How to run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

(There is already a working `.venv/` in the repo from this session.)

```bash
curl -s http://127.0.0.1:8000/health | python3 -m json.tool
curl -s http://127.0.0.1:8000/markets | python3 -m json.tool | head -40
curl -s "http://127.0.0.1:8000/markets?category=Politics" | python3 -m json.tool
# detail (id from the /markets list, e.g. "u:kalshi:KXPRESNOMD-28-BS"):
curl -s "http://127.0.0.1:8000/markets/u:kalshi:KXPRESNOMD-28-BS" | python3 -m json.tool
```

Interactive docs: http://127.0.0.1:8000/docs

---

## 8. Known limitations / suggested next steps

- **No automated tests yet.** Verified via throwaway scripts this session. Adding a
  small pytest suite (matching guard, inverse framing, cross-year, connector parsing
  with fixtures) is the top recommended next step.
- **Matching is intentionally simple** (difflib + token guard). It is conservative:
  it won't falsely merge different entities, but it *misses* matches where the same
  market is phrased very differently across venues, or differs only by a numeric
  threshold ($100k vs $150k) / different entity spelling. The documented next step
  is the embedding + LLM-verify `Matcher` (numpy is already installed; drop it in
  behind `cluster()` — no caller changes).
- **LLM tagging seam** is ready in `taxonomy.py` for richer category/country/theme.
- **Cross-venue merge count is event-driven** (currently ~28, mostly 2028 election).
  It will grow as overlapping topics appear; not a code issue.
- `git`: the app files were committed this session as `2ee1e85 backend`; the
  post-review fixes are currently **uncommitted** (modified: README, config,
  matching, all 3 connector files, base). Commit them when ready.
- A `structuring/` docs directory (SPEC.md, METHODOLOGY.md, templates, schema
  proposal) was pulled in from PR #1 — **not yet reconciled** against this backend.

---

## 9. Kickoff prompt for the new chat

> I'm continuing a prediction-market aggregator backend (read-only, suggestion-only;
> FastAPI + Pydantic v2 + httpx + uvicorn, in-memory store, 60s asyncio poller).
> The first pass is built and runs: it pulls live Kalshi + Polymarket markets,
> normalizes them, clusters duplicates across venues, and serves best-price-per-group
> over `/markets`, `/markets/{id}`, `/health`. Read `HANDOFF.md` first for full
> context (architecture, design decisions, the 13 review fixes already applied, and
> known limitations). Then [YOUR NEXT TASK — e.g. "add a pytest suite", "implement
> the embedding + LLM-verify matcher behind cluster()", "reconcile against
> structuring/SPEC.md", "add LLM tagging in taxonomy.py"].
