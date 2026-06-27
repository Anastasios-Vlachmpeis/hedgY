# DATA & INTEGRATIONS (P4)

The layer that sits between **external venues** (Alpaca, Polymarket, later Kalshi) and the rest of the product. Everything else in the app talks to *this*, never to a venue's raw API.

Run the end-to-end smoke test:

```bash
npm run integrations:demo
```

Polymarket is auth-free. Add Alpaca keys to `.env` for crypto + equities.

## The five components

| # | Component | File | What it does |
|---|-----------|------|--------------|
| ① | **Venue Connectors** | `src/connectors/` | One common `VenueConnector` interface per venue. Adding a venue = one new file. Nothing downstream changes. |
| ② | **Market Data Aggregator** | `src/aggregator/` | Fans quote requests across venues, normalizes, computes best bid/ask, and pushes live updates (`subscribe()` polls today, WS-ready). |
| ③ | **Instrument Mapping ★** | `src/instrument-mapping/` | Canonical taxonomy. `resolve()` turns `crypto:BTC` into venue symbols; `sameMarket()` answers "is this the same market?" across venues. **The core IP.** |
| ④ | **Settlement / Reconciliation** | `src/settlement/` | Compares expected ledger entries to actual fills, returns "breaks" (qty mismatch, slippage, missing/unexpected fills). |
| ⑤ | **Wallet / Custody + Payments** | `src/custody/` | Which rail funds which venue (USDC→Polymarket, fiat→rest), balances, fund checks. Money movement is mocked. |

## Data flow

```
                         ┌─────────────────────────┐
   "crypto:BTC"  ───────▶│  ③ Instrument Mapping ★  │  resolve() / sameMarket()
                         └────────────┬────────────┘
                                      │ venue symbols
                                      ▼
                         ┌─────────────────────────┐
                         │  ② Market Data Aggregator│  fan-out + normalize + best px
                         └────────────┬────────────┘
                                      │ getQuote() per venue
                          ┌───────────┴───────────┐
                          ▼                       ▼
                   ① Alpaca conn.          ① Polymarket conn.
                          │                       │
                          ▼                       ▼
          ④ Settlement (fills vs ledger)   ⑤ Custody (USDC vs fiat rails)
```

## Design notes

- **Self-contained for now.** Types live in `src/types.ts`; they graduate to `packages/shared` when the full monorepo lands.
- **Buildless.** Runs on Node 24's native TS. No parameter properties / enums (unsupported by type-stripping).
- **Failures are returned, not thrown.** The aggregator degrades gracefully if a venue (e.g. Alpaca without keys) is down.
- **Catalog** lives in `src/seed/catalog.json` — add canonical instruments + their venue listings there.

## Adding a venue (e.g. Kalshi)

1. Create `src/connectors/kalshi.ts` implementing `VenueConnector`.
2. Register it in `src/connectors/index.ts`.
3. Add its rail to `RAIL_BY_VENUE` in `src/custody/index.ts`.
4. Add listings to `catalog.json`. Done — aggregator, mapping, settlement all just work.
