# Session Handoff — Live Aggregator + $1000 Paper-Trading App

> This supersedes the original backend-only `handoff.md` (still valid for deep
> aggregator/matching internals). Also read `RUNNING.md` (run guide) and
> `docs/superpowers/specs/2026-06-27-paper-trading-account-design.md` (trading spec).

Branch: **`feat/live-wiring`** (HEAD `4534df4`, pushed to origin). Everything below
is committed there.

---

## 1. What this is now

A working prediction-market + equities product, merged from 3 people's branches:

1. **Aggregator backend** (`app/`, FastAPI) — pulls live Kalshi + Polymarket,
   normalizes, clusters cross-venue duplicates, serves best price per side.
2. **Structuring** (`structuring/`) — hedge classifier; exposed at `/suggestions`.
3. **$1000 paper-trading account** (`app/account.py`) — **NEW this session.**
   Deposit $1000, trade stocks (real Alpaca paper orders) + prediction markets
   (in-app fills at live odds), real positions / P&L / equity curve.
4. **Frontend** (`web/`, Next.js 16 + Turbopack) — discovery feed + account
   dashboard + trade modals, all wired to the live backend with mock fallback.

It runs end-to-end. Backend was tested 26/26 via API; the full frontend flow
(deposit → trade stock/featured/grid → positions land) was verified in a real
headless browser with 0 console errors.

---

## 2. Real-vs-mock status (per page)

| Page | Status |
|------|--------|
| `/markets` | **LIVE** — Kalshi+Polymarket odds/volume + **live Alpaca stock prices**. "Hedge ideas" cards are curated-mock **by design** (labeled "Curated"). |
| `/dashboard` | **LIVE** — portfolio value, **P&L card + equity curve**, **platform breakdown**, positions, activity all from the real account. |
| `/structure` | Mock + illustrative hedge-builder math (design/what-if tool). |
| `/` (landing) | Static marketing (no data by design). |

Only intentionally-mock spots left: `/markets` "Hedge ideas" (curated), the
`/structure` builder, and the landing page.

---

## 3. Architecture / file map

### Backend (`app/`)
- `main.py` — FastAPI app, 60s poller, all routes.
- `config.py` — settings (loads root `.env` via python-dotenv for Alpaca keys).
- `models.py` — `CanonicalMarket`, `UnifiedMarket` (now has `volume`), `PriceQuote`, etc.
- `store.py` — in-memory immutable snapshot store (markets).
- `matching.py` — cross-venue clustering (difflib + discriminating-token guard).
- `taxonomy.py` — category/country/theme inference.
- `connectors/{kalshi,polymarket}.py` — venue connectors (no keys).
- **`account.py` (NEW)** — SQLite ledger (`app/account.db`, gitignored): cash,
  positions, trades, `equity_log`. Pure money math (price injected) + live
  pricing helpers (`stock_price` via Alpaca, `place_alpaca_order`).
- `tests/test_account.py` — 12 ledger unit tests (no network).

### Structuring (`structuring/`)
- `service.py` — `suggest_hedges(markets, notional)`; matches 5 templates to live
  markets. Exposed via backend `/suggestions`. `templates.json` = calibration.

### Frontend (`web/`)
- `app/page.tsx` (landing, static), `app/markets/page.tsx` (LIVE), `app/dashboard/page.tsx` (LIVE), `app/structure/page.tsx` (mock).
- `app/api/orders/route.ts`, `app/api/account/deposit/route.ts`, `app/api/account/reset/route.ts` — **server-side proxies** to the backend (browser → these → Python).
- `lib/server/marketData.ts` — **the live data layer.** All `getX()` fetchers map
  backend → FE models with mock fallback: `getMarketEvents`, `getFeaturedMarket`,
  `getMarketCategories`, `getTrendingStocks`, `getPortfolio`, `getAccount`,
  `getPositions`, `getActivity`, `getAccountHistory`, `getPlatformBreakdown`.
- `lib/mockData.ts` — typed mock fixtures + helpers (fallbacks only on live pages).
- `components/trade/trade-modal.tsx` — `TradeButton` + portal-centered `TradeModal`.
- `components/dashboard/account-header.tsx` — live portfolio + **live P&L card + breakdown modals**.
- `components/markets/{market-card,featured-market,promo-rail}.tsx` — all odds/Buy buttons are tradeable.

### Backend API
`GET /markets` · `GET /markets/{id}` · `GET /suggestions` · `GET /health` ·
`GET /account` · `GET /account/history` · `GET /positions` · `GET /trades` ·
`POST /account/deposit` · `POST /account/reset` · `POST /orders`

---

## 4. The $1000 trading account (the big new feature)

Execution model (decided with the user): **live prices, paper fills, one in-app
$1000 wallet.** Stocks fire a **real Alpaca paper order** (genuine broker
execution) but the SQLite ledger is the source of truth; predictions fill in-app
at live aggregator odds. **No real money / crypto custody** (Polymarket has no
sandbox — deliberately avoided).

Flow: Deposit $1,000 (dashboard) → buy on `/markets` (featured candidate, grid
Yes/No, or stock Buy → trade modal → amount → Buy) → POST `/api/orders` →
backend `/orders` → ledger updates → dashboard shows live positions, P&L, equity
curve, platform breakdown. `equity_log` snapshots on deposit/order/load build the
real P&L curve (flat until prices move — buys are value-neutral).

---

## 5. How to run

```bash
npm run dev      # repo root → backend :8000 + frontend :3000 (dev.sh)
```
Or separately: `./.venv/bin/uvicorn app.main:app --reload` and `cd web && npm run dev`.

- Backend needs the venv (`.venv/`) + deps (`requirements.txt`). Already set up.
- Alpaca paper keys live in **gitignored** `web/.env.local` + root `.env` (already
  populated). Prediction markets need **no keys**.
- Open **http://localhost:3000** → `/markets` (discovery) and `/dashboard` (account).
- **Dev gotcha:** the dev servers got restarted a lot (concurrent committers); if a
  tab shows stale behavior or "Failed to fetch RSC payload", **hard-refresh
  (Cmd+Shift+R)**. Run your own `npm run dev` in a terminal you control for stability.

---

## 6. Git state

- Branch **`feat/live-wiring`**, HEAD `4534df4`, **pushed to origin**.
- Key commits this session: `0386050` (account service P1), `4776754` (trading UI P2),
  `e59ecfa` (featured tradeable), `0783b72` (portal-centered modal), `4534df4`
  (real P&L + breakdown), plus several `feat/frontend` merges (`061c397`,
  `7a9770a`, `bc11851`) and the spec (`c1e24fe`).
- **No secrets committed** — `.env`, `.env.local`, stray `env`, `app/account.db`
  are all gitignored.
- ⚠️ **Repo has concurrent committers** (3 people in the same working copy).
  Re-check `git log -1` / `git status -sb` before any git op; `feat/frontend`
  periodically reverts the dashboard to mock, so each merge re-conflicts on
  `dashboard/page.tsx` + `account-header.tsx` (resolve by keeping the LIVE wiring).

---

## 7. Known limitations / intentional mock

- `/markets` "Hedge ideas" = curated examples (the `/suggestions` matcher is
  keyword-based; 2/5 templates match live). Wiring those cards to live
  `/suggestions` is a clean next step.
- `/structure` builder uses illustrative math + a mock prefill.
- Sell/close exists in the backend (`POST /orders action=sell`) but the UI only
  exposes Buy — no sell button yet.
- P&L equity curve only has session history (no real intraday timeframes); the
  fake 1D/1W/… toggle was removed.
- No auth / multi-user (single demo account). No withdraw (button is inert).
- `scripts/*.ts` need Node ≥22.6 (machine is Node 20); optional smoke tests.
- `packages/integrations/` is a README-only stub (no `src/`); not wired in.

---

## 8. Suggested next steps

1. **Sell/close in the UI** — a Sell button on dashboard positions → `POST /orders action=sell`.
2. **Wire "Hedge ideas" to live `/suggestions`** (improve the structuring matcher first).
3. **`/structure` builder on live data** — feed a real market's price into the payoff math.
4. **Withdraw** + better account controls.
5. **Tests** — add a pytest for the new routes + a Playwright E2E for the trade flow.
6. Optional: richer P&L history (snapshot equity in the 60s poller for a moving curve).

---

## 9. Kickoff prompt for the new chat

> I'm continuing a merged prediction-market + equities app on branch
> **`feat/live-wiring`**. Read `SESSION-HANDOFF.md` first (then `RUNNING.md` and
> `handoff.md` for backend internals). Stack: FastAPI aggregator (Kalshi +
> Polymarket → `/markets`, port 8000) + a structuring `/suggestions` route + a
> **$1000 paper-trading account** (`app/account.py`, SQLite ledger: deposit, buy
> stocks via real Alpaca paper orders, buy predictions at live odds, real
> positions/P&L/equity-curve) + a Next.js 16 frontend (`web/`) where `/markets`
> and `/dashboard` are fully live (mock only on `/structure`, landing, and the
> curated "Hedge ideas"). Run with `npm run dev` (backend :8000 + frontend :3000);
> Alpaca paper keys are in gitignored `web/.env.local` + `.env`. The repo has
> concurrent committers, so check `git log -1` before git ops and expect
> `feat/frontend` merges to re-conflict on the dashboard (keep the LIVE wiring).
> My next task is: **[FILL IN — e.g. "add a Sell button to dashboard positions",
> "wire Hedge ideas to live /suggestions", "make /structure use a live market"]**.
