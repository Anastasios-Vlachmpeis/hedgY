# Running the stack

This repo is the merge of three people's work into one product: a cross-venue
prediction-market aggregator with a hedge-structuring layer and a Next.js front
end. This file is the map + the run instructions.

## TL;DR

```bash
npm run dev          # starts backend (:8000) + frontend (:3000), Ctrl-C stops both
```

Then open **http://localhost:3000/markets** — the discovery feed is live
(real Kalshi + Polymarket markets, best price per side, cross-venue merges).

First run auto-creates the Python venv and installs deps; later runs are instant.

## The four pieces and how they connect

```
  Kalshi  ─┐
           ├─►  app/  (FastAPI aggregator, :8000)  ──/markets────┐
  Polymkt ─┘     normalize → cluster cross-venue → best price    │
                          │                                      ▼
                          └─►  structuring/  (hedge classifier)  web/  (Next.js, :3000)
                               exposed at  /suggestions          lib/server/marketData.ts
                                                                 maps live → UI, mock fallback
  Alpaca  ──────────────────────────────────────────────────►  (stocks + paper portfolio)
```

| Dir | What it is | Runs |
|-----|------------|------|
| `app/` | FastAPI aggregator. Pulls Kalshi + Polymarket, normalizes, clusters duplicates across venues, serves best price per side. **No keys needed.** | `npm run backend` |
| `structuring/` | Hedge classifier (P2). `suggest_hedges()` reads `/markets`, sizes hedges. Exposed via the backend's `/suggestions` route + a CLI. | part of backend / `python3 structuring/service.py` |
| `web/` | Next.js 16 app. `lib/server/marketData.ts` fetches the backend (+ Alpaca) server-side and maps into the UI models, always falling back to mock so it can't white-screen. | `npm run web` |
| `scripts/` | Standalone Alpaca/Polymarket connectivity smoke tests. Optional. | `npm run poly:test` |

> `packages/integrations/` is only a README right now — the described `src/` data
> layer was never committed. It is **not** wired into anything; ignore it for now.

## Backend endpoints (http://127.0.0.1:8000)

| Endpoint | Returns |
|----------|---------|
| `GET /markets` | unified cross-venue markets (best yes/no price, venues, volume) |
| `GET /markets/{id}` | one unified market + its per-venue member markets |
| `GET /suggestions?notional=10000` | live hedge suggestions (5 templates → matched markets, sizing) |
| `GET /health` | venue counts, last refresh, errors |
| `GET /docs` | interactive Swagger UI |

The store refreshes every 60s in the background. Today: ~300 canonical → ~271
unified, ~28 genuine cross-venue merges.

## What is LIVE vs MOCK right now

| Surface | Status |
|---------|--------|
| `/markets` discovery grid (cards) | **LIVE** — real questions, odds, volume; cross-venue cards show a LIVE badge |
| `/markets` featured hero | **LIVE** — built from the real 2028-nominee cross-venue odds (chart trend is illustrative) |
| `/markets` category nav | **LIVE** — counts derived from live markets |
| `/markets` "Hedge ideas" cards | **Curated** by design (the component is labelled "Curated") — coherent examples |
| `/dashboard` portfolio summary | **LIVE if Alpaca keys set**, else mock fallback |
| `/dashboard` positions / activity / promo stocks | mock fixtures (account demo) |
| `/structure` builder | mock + illustrative client-side math |
| `/suggestions` API + structuring CLI | **LIVE** — real prices, real sizing |

Prediction-market data is live with **zero config**. Only the stocks/portfolio
half needs Alpaca keys.

## Optional: live stocks + portfolio (Alpaca)

```bash
cp web/.env.example web/.env.local
# edit web/.env.local and paste free paper keys from app.alpaca.markets
```

Restart `npm run dev`. Without keys, those panels just show mock numbers.

## Manual run (two terminals)

```bash
# terminal 1 — backend
python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
./.venv/bin/uvicorn app.main:app --reload

# terminal 2 — frontend
cd web && npm install && npm run dev
```

## Notes / next steps

- The cross-venue merges are currently all "2028 Democratic nominee" markets, so
  that's what the featured hero showcases. It grows as overlapping topics appear.
- The `/suggestions` matcher is keyword-based and conservative (2/5 templates
  match live today). Surfacing its live output as a UI section, and feeding the
  `/structure` builder from it, is the natural next step.
- `scripts/*.ts` need Node ≥ 22.6 to run TypeScript directly (this machine is on
  Node 20); they are optional smoke tests, not part of the app.
