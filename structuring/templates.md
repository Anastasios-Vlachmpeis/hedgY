# Combo Templates (P2)

> The 5 starter "views" the Structuring Engine ships with. Each one = a primary equity exposure + a prediction-market hedge on the adverse outcome.
> Hedge math is defined in `SPEC.md` section 4. The one judgment input per template is `move_adverse` (estimated % move of the primary if the adverse outcome resolves). These are v1 estimates to refine with history.

Field legend:
- **Primary** = the directional equity/ETF leg.
- **Hedge** = the event contract that PAYS OUT on the adverse outcome.
- **move_adverse** = est. primary move if adverse outcome hits.
- **Expiry alignment** = how well the event resolution lines up with the equity reaction (good / medium / poor).

---

### 1. Defense long, hedged against the election
- **Thesis:** long defense primes; worried a peace-favoring / incumbent-change outcome cuts defense budgets.
- **Primary:** defense ETF (e.g. ITA) or basket (LMT, RTX, NOC).
- **Hedge:** event contract on the adverse election/peace outcome (e.g. "Ceasefire by Q4" YES, or "Incumbent loses" YES).
- **move_adverse:** 0.08
- **Expiry alignment:** medium (policy impact lags the event).
- **Note:** budget impact is slow, so this is a sentiment hedge more than a cash-flow hedge. Flag that to the user.

### 2. Pharma long, hedged against a single drug failing
- **Thesis:** long a biopharma name into a binary FDA/Phase-3 readout.
- **Primary:** the single stock (highest-conviction, single-catalyst name).
- **Hedge:** event contract "Drug X approved / trial succeeds" NO (i.e. pays if it fails).
- **move_adverse:** 0.25 (single-catalyst names move hard on a failure).
- **Expiry alignment:** good (event and equity react on the same readout date) - the cleanest template.
- **Note:** best showcase for the demo because the hedge and the equity move on the same day.

### 3. Shipping long, hedged against a Strait of Hormuz blockade
- **Thesis:** long tanker/shipping equities; a Hormuz blockade spikes rates short-term but tail-risks a broader selloff / sanctions hit.
- **Primary:** tanker/shipping names or a shipping ETF (e.g. STNG, FRO, or BOAT).
- **Hedge:** event contract "Strait of Hormuz blocked/closed by [date]" - direction depends on which way the user's equity is exposed (some shippers rally on disruption, so hedge may be on the *de-escalation* leg). Template must set the correct adverse leg per instrument.
- **move_adverse:** 0.15
- **Expiry alignment:** medium.
- **Note:** sign of the hedge is instrument-dependent. Encode `hedgeDirection` explicitly in the template.

### 4. Rate-sensitive long, hedged against the Fed decision
- **Thesis:** long rate-sensitive equities (banks, REITs, small caps); worried the next FOMC holds/hikes instead of cutting.
- **Primary:** regional bank ETF (KRE) or rate-sensitive basket.
- **Hedge:** event contract "Fed cuts at [meeting]" NO (pays if no cut).
- **move_adverse:** 0.05
- **Expiry alignment:** good (FOMC date is fixed and equities react immediately).
- **Note:** small move_adverse but very clean timing; good for a "macro hedge" example.

### 5. Crypto-exposed long, hedged against crypto legislation
- **Thesis:** long crypto-proxy equities (COIN, MSTR); worried key market-structure legislation (e.g. CLARITY) stalls.
- **Primary:** COIN and/or MSTR.
- **Hedge:** event contract "[Crypto bill] becomes law by [date]" NO (pays if it stalls).
- **move_adverse:** 0.18
- **Expiry alignment:** poor-to-medium (legislative timelines slip) - flag this clearly.
- **Note:** mirrors a real institutional trade (funds have hedged legislative risk via these contracts). Good "this is what pros do" story for YC.

---

## Machine-readable stub (for the engine / P1 config)
Proposed shape if we encode these as data (P1 to confirm where it lives):

```json
[
  {
    "id": "defense_election",
    "primary": { "type": "etf", "symbol": "ITA" },
    "hedge": { "eventQuery": "ceasefire OR incumbent-loss", "leg": "YES" },
    "moveAdverse": 0.08,
    "hedgeDirection": "adverse",
    "expiryAlignment": "medium"
  },
  {
    "id": "pharma_trial",
    "primary": { "type": "equity", "symbol": "<single-name>" },
    "hedge": { "eventQuery": "drug-approval", "leg": "NO" },
    "moveAdverse": 0.25,
    "hedgeDirection": "adverse",
    "expiryAlignment": "good"
  }
]
```
(Remaining three follow the same shape.)
