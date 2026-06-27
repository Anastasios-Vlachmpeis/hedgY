# Build Plan — Event-Risk Radar + One-Tap Hedge

> The huge feature. "Connect your portfolio → see your real-world event risks → hedge any of them in one tap."
> This is the plan from 30,000 ft down to the task level. Owner: P2 (product/quant) drives the methodology; P1 builds the engine; P3 the UI; P4 the data; P5 compliance.

---

## 0. The one-liner and the magic moment
A user links their brokerage (or pastes tickers). Within seconds we show a **ranked radar of the real-world events that threaten their portfolio** — "your FDA decision risk, your Fed risk, your election risk" — each with a dollar figure and a **one-tap hedge** powered by the structuring engine we already built.

**Why it wins:** you can't hedge what you can't see. Robinhood/IBKR show you *positions*; nobody shows retail their *event exposure* and lets them hedge it. It's the onboarding wow, the weekly retention loop, and the thing that scales us past the 5 canned templates to *any* portfolio.

**What we reuse (≈80% already built):** the aggregator (`/markets`, live odds), the hedge classifier + `/suggestions`, paper trading, the Next.js app. **What's genuinely new:** the **relationship engine** (map any holding → its event risks) and the **radar** on top.

---

## 1. End-to-end flow (high level)
```
[Portfolio in]  ->  [Relationship engine]  ->  [Risk scoring]  ->  [RADAR]  ->  [One-tap hedge]
 brokerage link     holding -> events           per (holding,      ranked       reuse /suggestions
 or manual tickers  (curated+embeddings+LLM)    event) exposure    exposures     -> OrderPlan -> exec
                    + event-study calibration   + live odds                       (paper/real)
```

Three new backend capabilities (portfolio, relationships, risks), one reused (suggestions/execution), one new frontend surface (the radar).

---

## 2. System architecture (where it slots into the current stack)
Current stack: `app/` FastAPI aggregator (`/markets`, `/suggestions`), `structuring/` (classifier + templates + service), `web/` Next.js.

New pieces:
- **`structuring/relationships.py`** (P2 spec + P1 build) — the relationship engine: `relate(holding, live_markets) -> list[EventLink]`.
- **`structuring/radar.py`** (or extend `service.py`) — `portfolio_risks(holdings, live_markets) -> list[RiskExposure]` (scoring + ranking), and `hedge_for(exposure) -> OrderPlan` (reuses the classifier).
- **`app/` new routes** (P1): `POST /portfolio`, `GET /portfolio/{id}/risks`, `POST /portfolio/{id}/hedge`.
- **Data/infra** (P4): brokerage link (Plaid/SnapTrade), stock reference data, historical prices for event studies, an embeddings model, an LLM, a cache.
- **`web/`** (P3): connect-portfolio flow + the radar page + one-tap hedge sheet.

Boundary stays the same: **P2 owns the rules** (how to relate, how to score risk, calibration, disclosures); **P1 owns the engine/endpoints**; **P3 the UI**; **P4 the data plumbing**.

---

## 3. Component deep-dives

### 3.1 Portfolio ingestion
Goal: get `Holding[]` = `{ symbol, quantity, marketValue, costBasis? }`.
- **v1 (fastest): manual / paste.** A box where users paste tickers + amounts, or upload a CSV. Zero integrations, instant demo.
- **v2 (the magic): read-only brokerage link.** Use **SnapTrade** or **Plaid Investments** to pull holdings read-only (Robinhood, Schwab, Fidelity, etc.). Read-only = lower regulatory/security burden than trading access.
- Normalize every holding to `{symbol, assetType, quantity, marketValue}` using live prices (from the market-data feed).
- **Privacy is a first-class concern** (you're holding people's portfolios): encrypt at rest, scope tokens read-only, don't persist more than needed, clear consent. (P5.)

### 3.2 The relationship engine (the hard core)
**Job:** for a holding, return the live event markets that materially threaten it, with direction + magnitude + confidence. A 4-layer funnel:

1. **Curated priors (top-down, deterministic).** A sector/theme → event-category map: pharma → FDA/Phase-3; banks/REITs/small-caps → Fed/rates; defense → elections/geopolitics; energy/tankers → oil/OPEC/Hormuz/sanctions; crypto-proxies (COIN/MSTR) → crypto legislation; airlines → fuel/recession; chips → export controls/Taiwan; etc. Enrich the ticker → `{sector, industry, country, themes, business drivers}` from reference data. This gives high-precision candidate event *categories*.
2. **Semantic matching (bottom-up).** Embed each holding's "risk profile" (sector + description + themes) and embed every live event-market question (from `/markets`). Cosine-similarity → top-k candidate events. Catches links the curated map misses, and grounds categories to *actual live markets*.
3. **LLM verification + direction + magnitude.** For each candidate `(holding, event)`, an LLM returns a structured verdict: `linked?`, `direction` (does the adverse outcome hurt or help the stock?), `magnitudeBand` (small/medium/large → maps to a `move_adverse` %), `confidence`, and a one-line `rationale`. This kills spurious links and sets the sign (the hedge-vs-expression test).
4. **Event-study calibration.** For links with historical analogs (FDA decisions, FOMC, elections), run the event study (`AR = R − E[R]`, CAR) on past events to get a *measured* `move_adverse` + statistical confidence, **overriding** the LLM band. Novel links keep the LLM estimate with a **low-confidence flag**.

**Output per holding:** ranked `EventLink[]` = `{eventMarketId, direction, moveAdverse, confidence, rationale, source: curated|semantic|llm|eventstudy}`.

**Performance:** relationships are slow/expensive (LLM + embeddings). **Cache** per `(symbol, marketSnapshotVersion)`; **precompute** for the top few hundred popular tickers nightly; only do live LLM calls for long-tail/uncached symbols. This is what makes the radar feel instant.

### 3.3 Risk scoring + ranking (the math)
For each `(holding, eventLink)`:
- `exposureUsd = holding.marketValue`
- `eventLossUsd = exposureUsd × |moveAdverse|`  ← the at-risk dollars if the bad outcome hits
- `p_adverse` = live implied probability of the adverse outcome (from the event market, the side that hurts)
- `expectedEventLoss = eventLossUsd × p_adverse`  ← probability-weighted
- `hedgeCostUsd`, `hedgeRatio`, `residualPct` ← from the **existing classifier** (`structuring/service.py`)
- `hedgeEfficiency = eventLossUsd / hedgeCostUsd`  ← how many $ of protection per $ spent (higher = more attractive hedge)

**Rank the radar** by `expectedEventLoss` (default) with a toggle for **worst-case** (`eventLossUsd`). Down-weight low-confidence links visually. **Portfolio-level:** sum exposures but flag overlaps/correlation (v1: per-position view + a headline "total event-at-risk"; v2: a proper correlation-aware aggregate). Always show the **residual** (basis risk) — disclosure-first.

### 3.4 The radar (product + UX)
- **Hero:** "Your portfolio's event risk: **$X at risk** across **N events**" + a simple visual (ranked bars or a radar/blip view).
- **Ranked list of exposures**, each card: the event ("FDA decision on XYZ — Mar"), the position it threatens, **$ at risk**, the live probability, a confidence chip, and a **Hedge** button.
- **Tap Hedge → the existing one-tap sheet** (reuses `/suggestions` output): shows the legs, hedge ratio, payoff, residual %, confirm → paper/real execute.
- **Empty/grace states:** "No hedgeable event risk found for this position right now" (not every stock has a live event market).
- **Disclosure baked in:** "informational, not advice"; residual % always visible; "estimate, not a guarantee."

### 3.5 One-tap hedge (reuse, don't rebuild)
The radar's hedge action is just `/suggestions` aimed at one `(holding, event)` instead of a template. Same `OrderPlan`, same sizing/scoring, same execution path (paper now, real later). The radar is mostly a **new front-end + scoring layer over the engine you already have.**

### 3.6 Monitoring + alerts (fast-follow, not v1)
Persist each user's risk set; re-score on the 60s market refresh; alert when: a risk's probability jumps, a hedge gets cheap (hedgeEfficiency spikes), or a new event threatens a holding. This is the retention engine — build it right after the radar lands.

---

## 4. Data model (new types)
```ts
Holding        { symbol, assetType, quantity, marketValue, costBasis? }
Portfolio      { id, userId, holdings: Holding[], source: "manual"|"snaptrade"|"plaid", updatedAt }
EventLink      { holdingSymbol, eventMarketId, direction: "adverse"|"favorable",
                 moveAdverse: number, confidence: number, rationale: string, source }
RiskExposure   { holding, event: { id, question, venues, p_adverse },
                 exposureUsd, eventLossUsd, expectedEventLoss,
                 hedgeRatio, residualPct, hedgeEfficiency, confidence, flags: string[] }
// Radar = RiskExposure[] ranked.  Hedge tap -> existing OrderPlan / HedgeSuggestion.
```

## 5. API surface (new endpoints, P1)
- `POST /portfolio` `{ holdings | brokerage_token }` → `{ portfolioId }`
- `GET  /portfolio/{id}/risks?rank=expected|worstcase` → `RiskExposure[]` (the radar)
- `POST /portfolio/{id}/hedge` `{ exposureId, notional? }` → `OrderPlan` (reuses suggest_hedges)
- (later) `GET /portfolio/{id}/alerts`
All read-only re: markets; execution stays in the existing paper/real path.

## 6. Data sources / vendors
| Need | Option(s) |
|---|---|
| Brokerage holdings (read-only) | **SnapTrade**, Plaid Investments |
| Stock reference data (sector/industry/desc) | Financial data API, or a precomputed map for top tickers |
| Historical prices (event studies) | the market-data feed you use (e.g. Alpaca), or a data API |
| Embeddings | an embeddings model (e.g. OpenAI/text-embedding) |
| LLM (verify/direction/magnitude) | an LLM API; batch + cache |
| Cache | Redis (or in-memory to start) |

---

## 7. The build roadmap (phases → concrete tasks)

**Phase 0 — Decisions & scaffolding (small)**
- Freeze the data model above; pick brokerage-link vendor; pick embeddings + LLM; confirm the "not advice" framing with P5.
- Stub the 3 endpoints + the radar route with mock data so FE/BE work in parallel.

**Phase 1 — Portfolio in (manual) + reuse engine**
- Manual/CSV holdings ingest → normalize with live prices.
- `GET /portfolio/{id}/risks` running against the **curated map only** (sector→events) + the classifier. Ships a working radar for the common cases fast.
- Radar UI v1 (ranked list + hedge button reusing the existing sheet).

**Phase 2 — Relationship engine v1 (the core)**
- Ticker → metadata enrichment.
- Add semantic matching (embeddings over live `/markets`).
- Add LLM verification (linked? direction? magnitude band? rationale?).
- Caching + nightly precompute for top tickers. Now it works for *any* stock, not just curated.

**Phase 3 — Risk scoring polish + calibration**
- Event-study calibration for the catalysts with history (FDA/FOMC/elections) → real `move_adverse` + confidence; LLM fallback for novel.
- Confidence-weighting + worst-case/expected toggle + portfolio headline number.

**Phase 4 — Brokerage link (the magic onboarding)**
- SnapTrade/Plaid read-only connect → auto-pull holdings → instant radar. Privacy/security hardening.

**Phase 5 — Monitoring + alerts (retention)**
- Persist risk sets; re-score on refresh; alerts (prob jump / cheap hedge / new risk).

**MVP cut for the demo:** Phase 1 + a slice of Phase 2 (curated + LLM for a handful of tickers) + the radar UI + one-tap paper hedge. That alone is a killer demo: *paste your holdings → see your top 3 event risks in dollars → hedge one in a tap.*

---

## 8. Who does what (the 5)
- **P2 (you):** own the **methodology** — the relationship rules/priors, the risk-scoring math (§3.3), `move_adverse` calibration, the ranking logic, the radar product spec, and the disclosure/"not advice" wording. You also write the LLM prompt spec (what a valid `(linked, direction, magnitude, confidence, rationale)` looks like).
- **P1 (Abransh):** build `relationships.py` + `radar.py`, the 3 endpoints, caching/precompute, wire to the aggregator + classifier.
- **P3:** connect-portfolio flow, the radar page (hero + ranked cards + visual), the one-tap hedge sheet (reuse existing).
- **P4:** brokerage link (SnapTrade/Plaid), reference-data + historical-price feeds, embeddings/LLM plumbing, cache.
- **P5:** data-privacy + security for holdings, the "informational not advice" framing, suitability/disclosure, vendor data agreements.

---

## 9. Risks, gotchas, mitigations
- **"Is this investment advice?"** Showing "you're exposed, hedge this" can read as a recommendation. **Mitigation:** frame as *informational risk surfacing + a tool the client chooses to use*, disclosure-first (residual %, "estimate," "not advice"), agency/broker stance. P5 + counsel.
- **Spurious relationships** (false event↔stock links). **Mitigation:** the LLM verify step + the classifier's `unrelated/expression/hedge` guardrail + confidence flags; never show a link below a confidence floor without the flag.
- **Coverage gaps** (no live event market for a holding). **Mitigation:** graceful "no hedgeable risk found"; over time, the more event markets exist, the better coverage.
- **Data privacy** (handling real portfolios). **Mitigation:** read-only tokens, encryption, minimal retention, clear consent.
- **LLM cost/latency.** **Mitigation:** cache + nightly precompute for popular tickers; live LLM only for long-tail.
- **move_adverse accuracy.** **Mitigation:** event studies where history exists; low-confidence flag elsewhere; show it's an estimate.
- **Correlation/double-counting** in the portfolio total. **Mitigation:** v1 per-position + clear headline; v2 correlation-aware aggregate.

## 10. What "done" looks like / success metrics
- Time-to-wow: paste/connect → radar in < ~10s.
- Coverage: % of a typical portfolio's value that gets at least one confident event link.
- Activation: % of users who tap "Hedge" after seeing the radar.
- Retention: weekly returns driven by alerts.
- Trust: every exposure shows its residual % and confidence (no hidden basis risk).

---

## 11. One-paragraph summary (for the team chat)
We're building a **portfolio event-risk radar with one-tap hedging**. The user connects holdings (manual first, brokerage link next); a new **relationship engine** (curated priors → embeddings → LLM verification → event-study calibration) maps each holding to the live prediction-market events that threaten it; we **score and rank** those exposures in dollars and surface them as a **radar**; tapping "Hedge" reuses our existing `/suggestions` classifier to size + execute (paper now, real later). It reuses ~80% of what we've built; the new core is the relationship engine + the radar + scoring. P2 owns the methodology, P1 the engine/endpoints, P3 the UI, P4 the data, P5 compliance. MVP = paste holdings → top-3 event risks in $ → one-tap paper hedge.
