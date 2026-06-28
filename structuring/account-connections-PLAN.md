# Build Plan — Connecting Users' Active Accounts (Account Aggregation)

> The ingestion layer for the radar. Goal: a user links the accounts they already have, brokerage, crypto exchange, crypto wallet, prediction market, and we read their holdings (read-only) into ONE unified schema.
> Core principle: **don't build N bespoke integrations. Use aggregators for breadth + a few direct connectors for the special cases (on-chain wallets, Polymarket, Kalshi).**

---

## 0. The 4 account categories (this is the whole map)
Everything a user holds falls into one of four buckets, and each bucket connects differently:

| Category | Examples | How you connect |
|---|---|---|
| **1. Stock brokerages** | Robinhood, IBKR, Schwab, Fidelity, Webull | a brokerage **aggregator** (OAuth) |
| **2. Crypto exchanges** | Binance, Coinbase, Kraken | crypto **aggregator** (OAuth) or read-only **API keys** |
| **3. Crypto wallets (on-chain)** | Phantom (Solana), MetaMask (EVM) | the user's **public address** → on-chain **indexer** |
| **4. Prediction markets** | Polymarket, Kalshi | **Polymarket = wallet/on-chain**, **Kalshi = its API** |

You build **one connector type per category** (4 total) + a manual/CSV fallback, and the aggregators give you dozens of platforms each. That's the leverage.

---

## 1. The recommended connection stack (which vendor for what)
| Connector | Vendor (primary → alt) | Covers | Read / Trade |
|---|---|---|---|
| **Brokerage** | **SnapTrade** → Plaid Investments | Robinhood, IBKR, Schwab, Fidelity, Webull, Vanguard, E*TRADE, Tastytrade… | read **+ trade** (SnapTrade) / read-only (Plaid) |
| **Crypto exchange** | **Mesh Connect** → Vezgo, or direct API keys | Binance, Coinbase, Kraken, OKX, Bybit, KuCoin | read (+ transfers via Mesh) |
| **On-chain wallet** | **address + indexer** (Zerion/Zapper for EVM, **Helius** for Solana) | MetaMask, Phantom, Rabby, Coinbase Wallet, Ledger | read-only (public address) |
| **Prediction markets** | **Polymarket Data API** (on-chain, Polygon) + **Kalshi API** | Polymarket, Kalshi | read (Kalshi can trade via API) |
| **Fallback** | manual / CSV | anything | read-only |

**Why SnapTrade is the workhorse:** it's built for trading apps, it does **Robinhood** (which has *no* public API), **IBKR**, and the major brokerages through one OAuth portal, and crucially it supports **placing trades later** , so the same connection that powers the radar also powers the real-execution step. Don't pick a read-only-only vendor and have to re-integrate.

---

## 2. Per-platform: exactly how each one connects (the detail you asked for)
- **Robinhood** ✅ → **SnapTrade** (their hosted Connection Portal; user logs in to Robinhood through it). No official Robinhood API exists, aggregators are the only sane path.
- **IBKR** ✅ → **SnapTrade** (easiest, read+trade) **or** IBKR's own **Client Portal Web API** (official, heavier, needs a gateway). Use SnapTrade for v1.
- **Polymarket** ✅ → it's **on-chain on Polygon**. A user's positions are conditional-token (ERC-1155) balances in their Polymarket proxy wallet. Read them by **wallet address** via Polymarket's **Data API / CLOB API** (or the subgraph). So "connect Polymarket" = get the user's Polygon address (wallet-connect or paste) → query Polymarket for positions.
- **Binance** ✅ → **read-only API keys** (user creates a key with *read-only* permission and pastes it; HMAC-signed reads) **or** OAuth via **Mesh/Vezgo**. API keys are simplest for v1; aggregator is cleaner UX.
- **Phantom** ✅ → it's a **Solana wallet**. Read-only needs only the **public key** , connect via the Solana wallet adapter (or paste the address) → read token balances via **Helius / Solana RPC**. No signing needed to *read*.
- **MetaMask & other EVM wallets** → WalletConnect or paste address → read balances via **Zerion/Alchemy/Covalent** across Ethereum, Base, Arbitrum, Polygon, etc.
- **Coinbase / Kraken** → **SnapTrade/Mesh** (OAuth) or their official read-only APIs.
- **Kalshi** → official **REST API**, portfolio/positions endpoints, auth via API key or member login.

> Note on prediction-market accounts: when a user connects Polymarket/Kalshi, those positions are *already event-contract exposures*. The radar should ingest them too, an existing Polymarket "Yes" bet might already be hedging (or compounding) one of their stock risks. Treat them as both holdings AND potential existing hedges.

---

## 3. "What else?" — the full platform list to support (prioritized)
**Must-have (v1):** Robinhood, IBKR, Polymarket, a couple crypto wallets (Phantom + MetaMask), Binance/Coinbase, Kalshi, manual/CSV.

**Brokerages (via SnapTrade/Plaid):** Robinhood, IBKR, Charles Schwab, Fidelity, E*TRADE, Webull, Tastytrade, Vanguard, Merrill Edge, SoFi, Public, M1 Finance, Tradier, Wealthsimple (Canada).

**Crypto exchanges (via Mesh/Vezgo/keys):** Binance, Coinbase, Kraken, Gemini, OKX, Bybit, KuCoin, Crypto.com, Bitstamp.

**Crypto wallets / chains (via address + indexer):** Phantom (Solana), MetaMask, Rabby, Coinbase Wallet, Trust Wallet, Ledger — across Ethereum, Solana, Base, Arbitrum, Optimism, Polygon.

**Prediction markets:** Polymarket, Kalshi (+ minor/optional: PredictIt, Manifold, Myriad).

**Optional later:** bank/cash balances (Plaid) for full net-worth context, retirement/401k. Probably out of scope for hedging.

---

## 4. The unified data model (everything normalizes to this)
```ts
Connection { id, userId, category: "brokerage"|"crypto_exchange"|"wallet"|"prediction_market",
             provider: "snaptrade"|"mesh"|"onchain"|"polymarket"|"kalshi"|"manual",
             externalAccountId, status, scopes: ["read"|"trade"], createdAt }

Holding   { connectionId, symbol, name,
            assetClass: "equity"|"etf"|"option"|"crypto"|"event_contract"|"cash",
            chain?, quantity, marketValue, costBasis?, venue }
```
Every connector's job: auth → pull raw positions → map to `Holding[]`. The radar/relationship engine only ever sees normalized `Holding`s, so adding a new venue never touches downstream code (same adapter pattern as the venue connectors in the backend).

---

## 5. The connect UX flow
1. **"Connect accounts" hub** , tiles grouped by category (Brokerages / Crypto / Prediction markets / Manual).
2. Tap a platform →
   - **Brokerage / exchange:** opens the aggregator's hosted **OAuth portal** (SnapTrade/Mesh) , user logs into their broker there, we never see the password.
   - **Wallet:** **wallet-connect** (Phantom/MetaMask) or paste a public address , read-only.
   - **Polymarket:** wallet-connect / paste Polygon address.
   - **Kalshi / Binance:** paste a **read-only API key** (with a clear "read-only" instruction) or OAuth.
   - **Manual:** paste tickers / upload CSV.
3. Tokens/keys stored **encrypted**; holdings pulled, normalized, and the **radar lights up**.
4. A "Connected accounts" screen to manage/refresh/disconnect.

---

## 6. Backend architecture (where it lives)
- A `connections/` module with a **`PortfolioConnector` protocol** (one impl per category): `start_link()`, `handle_callback()`, `fetch_holdings() -> Holding[]`, `refresh()`.
- Endpoints (P1): `POST /connections/start` (returns the OAuth/connect URL), `POST /connections/callback`, `GET /portfolio` (all holdings across connections), `POST /connections/{id}/refresh`, `DELETE /connections/{id}`.
- **Secrets store** for tokens/keys (encrypted, e.g. a vault/KMS). Never store raw broker passwords (aggregators handle that). Wallet addresses are public → low-risk.
- Sync: pull on connect + periodic refresh; holdings feed the radar.

---

## 7. Read-only now, trade-ready later (strategic)
Pick aggregators that **also support execution** , **SnapTrade** (brokerage trades) and **Mesh** (crypto transfers), so the *same connection* the user makes for the radar becomes the rail for the **real-execution** step later. This avoids a painful re-integration and is a real reason to choose SnapTrade/Mesh over read-only-only Plaid/Vezgo.

---

## 8. Security, privacy, compliance (non-negotiable)
- **Read-only by default.** Request read scopes; for API keys, instruct users to create **read-only** keys; only request trade scope when they opt into execution.
- **Never store raw credentials** , aggregators hold the broker login; you store *their* token, encrypted (KMS/Vault).
- **Wallet reads are public-address** , no private keys, ever. Reading on-chain is just querying a public address.
- **Encryption at rest + in transit**, token rotation, minimal retention, clear consent, easy disconnect.
- **Framing:** ingesting holdings to *surface risk* is informational; keep the "not personalized advice" disclosure. (P5 + counsel; brokerage data also comes with vendor data-use terms.)

---

## 9. Roadmap (sequencing)
- **Phase A , Manual + CSV** (a day): instant holdings, unblocks the whole radar demo with zero vendor setup.
- **Phase B , SnapTrade** (the core): Robinhood + IBKR + the major brokerages through one integration. This is 80% of users' stock holdings.
- **Phase C , On-chain wallets**: Phantom (Helius) + MetaMask (Zerion) by address; **+ Polymarket positions** (same Polygon-address read).
- **Phase D , Crypto exchanges**: Binance/Coinbase/Kraken via Mesh or read-only keys.
- **Phase E , Kalshi + the long tail** and refresh/sync polish.

**MVP for the demo:** Manual/CSV **+ SnapTrade (Robinhood)** **+ a wallet paste (Phantom/MetaMask) + Polymarket** , that already covers "stocks + crypto + prediction-market positions" and makes the radar real.

---

## 10. Who does what
- **P4 (data/integrations):** owns this whole layer , the `PortfolioConnector` impls, SnapTrade/Mesh/indexer/Polymarket/Kalshi integrations, the secrets store, sync.
- **P3 (frontend):** the Connect-accounts hub, OAuth/wallet-connect flows, the "connected accounts" management screen.
- **P5 (compliance/security):** read-only scoping, encryption/secrets, consent/privacy, vendor data agreements, the "not advice" framing.
- **P1 (backend):** the `/connections` + `/portfolio` endpoints and wiring into the radar.
- **P2 (you):** the unified `Holding` schema + how each asset class feeds the relationship engine (esp. treating event-contract positions as existing exposures/hedges), and the connection priority list.

## 11. Risks / gotchas
- **Robinhood has no official API** , aggregator-only; accept the dependency.
- **API-key security** (Binance/Kalshi) , enforce read-only, encrypt, educate the user.
- **Wallet read ≠ write** , reading by address is safe; never ask for seed phrases/private keys.
- **Polymarket is on-chain** , no "login," it's an address read; handle proxy-wallet nuances.
- **Coverage gaps & rate limits** per vendor , the manual/CSV fallback always catches the rest.
- **Cost per connection** (aggregators charge per linked account) , model it.

---

### One-paragraph summary (for the chat)
We connect accounts in **4 buckets**: brokerages (Robinhood/IBKR/…) via **SnapTrade**, crypto exchanges (Binance/Coinbase) via **Mesh** or read-only keys, crypto wallets (Phantom/MetaMask) by **public address + indexer**, and prediction markets (**Polymarket** on-chain, **Kalshi** via API). Everything normalizes to one `Holding` schema. Build one connector per bucket + a manual/CSV fallback; the aggregators give us dozens of platforms each. Read-only by default, pick SnapTrade/Mesh so the same link powers **real execution** later. MVP = manual + SnapTrade(Robinhood) + a wallet paste + Polymarket. P4 owns it, P3 the UX, P5 the security/compliance.
