# Design — $1000 paper-trading account

Date: 2026-06-27 · Status: approved (Approach A) · Branch: `feat/live-wiring`

## Goal

A user deposits $1000 and can place trades on **stocks** and **prediction
markets**, with the account and P&L driven by **real live prices**.

## Execution model (decided)

Live prices, paper fills, one in-app cash wallet:
- **Stocks** execute as **real Alpaca paper orders** (genuine broker execution),
  but our in-app ledger is the source of truth for the $1000 world.
- **Prediction markets** fill **in-app at live odds** from the aggregator store
  (best `YES`/`NO` price). No crypto wallet, no USDC, no custody.
- Positions mark to live prices; P&L = (live − entry) × qty.

This deliberately relaxes the backend's original "read-only, no orders" boundary,
by request, for this account feature only. Market data stays read-only.

## Approach A — account service inside the FastAPI backend

One source of truth; reuses the live aggregator store for prediction prices and
Alpaca for stock execution/pricing.

### Data (SQLite at `app/account.db`, gitignored)

- `account(id=1, cash REAL, currency)` — singleton demo account.
- `positions(id, kind 'stock'|'prediction', symbol, market_id, side 'YES'|'NO'|NULL, qty, avg_entry, label, opened_at)`.
- `trades(id, kind, symbol, market_id, side, qty, price, notional, action 'buy'|'sell', alpaca_order_id, ts)`.

### Endpoints (new)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/account/deposit` | `{amount=1000}` | account |
| POST | `/account/reset` | — | account (cash 0, positions cleared) |
| GET | `/account` | — | cash, equity (cash + marked positions), buying_power, day_change, positions_count |
| GET | `/positions` | — | positions with live mark + unrealized P&L |
| POST | `/orders` | `{kind, symbol?|market_id?, side?, notionalUsd, action='buy'}` | the resulting trade + updated account |
| GET | `/trades` | — | trade history (newest first) |

### Order logic

- **Stock buy**: live price = Alpaca latest quote; `qty = notional / price`; debit
  cash; upsert position (weighted avg entry); fire a real Alpaca paper notional
  order best-effort and record its id (ledger does not block on Alpaca fill).
- **Stock sell**: credit cash at live price; reduce/close position; realize P&L.
- **Prediction buy**: price = aggregator `best_yes`/`best_no` for the chosen side;
  `contracts = notional / price`; debit cash; upsert position.
- **Prediction sell/close**: credit cash at current live side price; realize P&L.
- Guard: reject if `notional > cash` (insufficient funds) or price unavailable.

### Pricing (injectable for tests)

- `stock_price(symbol) -> float` — Alpaca data API (httpx).
- `prediction_price(market_id, side) -> float | None` — from `app.store.store`.

Both are passed into / monkeypatched in the order path so unit tests never hit
the network.

### Config

Add to `app/config.py`: `alpaca_key_id`, `alpaca_secret_key`,
`alpaca_trading_url`, `alpaca_data_url`, `account_db_path`, `default_deposit`.
Backend loads the root `.env` (add `python-dotenv`) so it sees the Alpaca keys.

## Frontend wiring (Phase 2)

- `getPortfolio()` + dashboard positions read the new `GET /account` + `GET
  /positions` (the real $1000 world) instead of mock / raw Alpaca.
- "Add $1000" deposit control on the account header.
- Existing **Buy** (stocks) and **Yes/No** (market) buttons open a small trade
  modal (notional, default $100) → POST to a Next route handler → backend
  `/orders` → refresh. Mock fallback stays for any backend error.

## Decisions / defaults

SQLite persistence · single demo account (no auth) · market orders only ·
sells/closes supported · trade modal asks a $ amount.

## Testing

`pytest` unit tests for the ledger: deposit, stock buy/sell math, prediction
buy/sell math, weighted-average entry, mark-to-market equity, insufficient-funds
rejection — all with injected prices (no network).

## Out of scope (now)

Real Polymarket/USDC custody · limit/stop orders · multi-user/auth · order book ·
short selling · historical P&L curve from real fills.

## Phases

1. Backend: config + `app/account.py` + models + routes + tests.
2. Frontend: deposit control + live account/positions + buy/yes-no wiring.
