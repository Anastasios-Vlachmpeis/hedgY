# hedgY

**Trade the world's markets, and its outcomes.**

### [Live demo: parishack-web.vercel.app](https://parishack-web.vercel.app/)

hedgY turns a worldview into a hedged, multi-instrument position. You pick a thesis (long defense, long biotech, long a shipping name), and hedgY automatically assembles the matching hedge against the one event that could blow it up: an election, an FDA decision, a blockade in the Strait of Hormuz. The equity leg and the prediction-market hedge are sized, scored, and placed as a single position, in one click.

Stocks and crypto live on one venue. Real-world outcomes live on another. Nobody assembles the hedged position across both. That gap is the product.

---

## Why this exists

Retail investors already take directional bets every day. What they cannot do is hedge the tail risk that actually drives the outcome, because the instrument that prices that risk sits on a prediction market they have never opened, on a separate account, with separate funding, separate odds, and no tooling to size the offset correctly.

hedgY closes that gap. It aggregates prediction markets across venues, matches them to your equity exposure, computes the hedge ratio, and executes both legs together. The aggregation is the table stakes. The structuring and auto-hedging is the moat.

---

## What's built

This is a working full-stack product, not a mockup. The numbers on the dashboard are real marks against real market data.

- **Cross-venue prediction aggregation.** Markets from Kalshi and Polymarket are normalized into a single canonical schema, deduplicated with a clustering matcher, and surfaced with the best available YES/NO price per side. No API keys required for the read-only feed.
- **Automatic hedge structuring.** A keyword-driven classifier maps an equity thesis to a prediction-market hedge using a library of templates (defense and elections, pharma and the FDA, shipping and Hormuz, rate-sensitives and the Fed, crypto proxies and legislation).
- **A paper trading wallet.** Every account starts with a $1000 ledger backed by SQLite. You can deposit, withdraw, buy stocks, buy prediction sides, and watch a real profit-and-loss curve build over time.
- **Combined hedges.** An equity leg and a prediction hedge are placed as one grouped position sharing a `group_id`, then tracked, marked, and closed together.
- **Position closing.** Liquidate a single leg by ledger id or an entire combined hedge by group, always at the live mark.
- **Live pricing.** Stock and crypto prices come from Alpaca, with a server-sent-events stream powering live charts on the dashboard.
- **A trading surface.** A full Next.js app with a marketing landing page, a dashboard hub, a hedge builder, a live portfolio view, per-asset trade tickets, and a Cmd+K command palette.

---

## Architecture

Two services that talk over HTTP.

### Backend (Python, FastAPI)

Lives in `app/`. An always-on process that polls Kalshi and Polymarket on an interval, clusters the results into a unified market list held in an in-memory store, and serves the paper-trading account out of SQLite. Stocks route to Alpaca paper orders; the ledger is always the source of truth. Prediction fills happen in-app against live aggregator odds, so there is no real-money custody anywhere.

Run it:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload
```

Interactive API docs are at `http://127.0.0.1:8000/docs`.

### Frontend (Next.js 16, React 19)

Lives in `web/`. App Router, TypeScript, Tailwind v4, shadcn-style primitives, Recharts for payoff and portfolio visuals, Lightweight Charts for price history. Server-side API routes under `web/app/api/*` proxy the Python backend and call Alpaca directly for prices, bars, and the live stream.

Run it:

```bash
cd web
npm install
npm run dev
```

### Both at once

From the repo root:

```bash
npm run dev   # starts backend on :8000 and frontend on :3000
```

---

## API reference

All endpoints are served by the FastAPI app in `app/main.py`.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/` | Service metadata and endpoint listing |
| `GET` | `/health` | Health, per-venue market counts, last refresh |
| `GET` | `/markets` | Unified cross-venue markets (filters: `category`, `country`, `theme`) |
| `GET` | `/markets/{unified_id}` | One unified market plus its per-venue members |
| `GET` | `/suggestions` | Live hedge suggestions for a given `notional` |
| `GET` | `/account` | Paper account: cash, equity, buying power, P&L |
| `GET` | `/account/history` | Equity curve points |
| `POST` | `/account/deposit` | Credit cash |
| `POST` | `/account/withdraw` | Debit cash |
| `POST` | `/account/reset` | Clear positions, trades, and equity log |
| `GET` | `/positions` | Open positions marked to live prices |
| `POST` | `/positions/close` | Close one position by `id` or a hedge by `group_id` |
| `GET` | `/trades` | Trade history |
| `POST` | `/orders` | Place a single-leg stock or prediction order |
| `POST` | `/orders/combined` | Place an equity leg and a prediction hedge as one grouped position |

The Next.js layer mirrors these under `/api/*` and adds Alpaca-backed routes: `/api/prices`, `/api/bars`, `/api/search`, `/api/risk-markets`, and the `/api/stream` SSE feed.

---

## Configuration

Copy the example files and fill in your keys.

```bash
cp web/.env.example web/.env.local
```

The prediction-market aggregator runs with zero configuration. Keys are only needed for live stock data and paper stock orders.

**Backend** (`app/config.py`, loaded from a root `.env`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `APCA_API_KEY_ID` | `""` | Alpaca paper key for stock data and orders |
| `APCA_API_SECRET_KEY` | `""` | Alpaca paper secret |
| `ALPACA_TRADING_URL` | `https://paper-api.alpaca.markets` | Alpaca paper trading API |
| `ALPACA_DATA_URL` | `https://data.alpaca.markets` | Alpaca market data API |
| `ACCOUNT_DB_PATH` | `app/account.db` | SQLite ledger location |
| `DEFAULT_DEPOSIT` | `1000.0` | Starting wallet balance |
| `REFRESH_INTERVAL_SECONDS` | `60` | Market poller cadence |
| `MATCH_THRESHOLD` | `0.85` | Cross-venue clustering cutoff |

**Frontend** (`web/.env.example`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `MARKETS_API_URL` | `http://localhost:8000` | Backend base URL (server-side only) |
| `APCA_API_KEY_ID` | | Alpaca key for live prices and charts |
| `APCA_API_SECRET_KEY` | | Alpaca secret |

---

## Deployment

The backend and frontend deploy separately because they have different runtime needs.

The backend keeps an in-memory store warm and runs a background poller, so it needs an always-on process rather than a serverless function. It ships as a Docker image (`Dockerfile`) and runs on Railway (`railway.json`). A `Procfile` is included for buildpack-based hosts.

```bash
railway up --detach --service <your-service>
```

Set the backend environment variables from the table above on Railway. `PORT` is injected automatically and the container's `CMD` expands it at boot.

The frontend is a standard Next.js app and deploys to Vercel. It is live at [parishack-web.vercel.app](https://parishack-web.vercel.app/).

```bash
cd web
vercel --prod
```

Set `MARKETS_API_URL` to the public Railway backend URL, plus the Alpaca keys for live pricing.

A note on the SQLite ledger: by default the container's database is ephemeral and resets on redeploy. The deploy ships a seeded snapshot of `app/account.db` so the live backend boots with positions already in place. For an account that survives redeploys and keeps new trades, attach a Railway persistent volume and point `ACCOUNT_DB_PATH` at it.

---

## Repository layout

```
app/                  FastAPI backend (routes, ledger, pricing, connectors)
  main.py             API routes and the market poller
  account.py          SQLite paper-trading ledger and Alpaca pricing
  connectors/         Kalshi and Polymarket connectors
  config.py           Environment-driven settings
structuring/          Hedge templates and the suggestion engine
web/                  Next.js frontend
  app/                App Router pages and the /api proxy layer
  components/         Dashboard, trade, markets, and UI components
  lib/                Hedge math, server fetchers, brand constants
Dockerfile            Backend container
railway.json          Railway deploy config
```

---

## Tests

Backend ledger logic is covered by unit tests that need no network.

```bash
python3 -m pytest app/tests/test_account.py
```

---

## The bet

Prediction markets are about to absorb a category of risk that has never had a retail-facing hedge. The first product that lets a normal investor express a view and walk away holding the hedged version of it, automatically, wins the relationship before the rest of the market notices the category exists. hedgY is that product.
