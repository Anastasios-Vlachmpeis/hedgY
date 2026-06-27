# StrategyIntent -> OrderPlan - SCHEMA PROPOSAL (DRAFT)

> STATUS: **DRAFT - needs P1 sign-off.** This is P2 proposing the shape of the data the Structuring Engine consumes and produces. P1 owns the canonical contracts (`/contracts`), the OMS, and the `VenueAdapter`. Once P1 is happy, P1 copies the ratified version into `/contracts`; P2 does not freeze it.

## Scope boundary (so we don't overlap)
- **P2 (this file):** `StrategyIntent`, `OrderPlan`, `OrderLeg` - the structuring in/out shape only.
- **P1 (not this file):** OMS API + order events, `VenueAdapter`, Risk Engine, Ledger.
- **P4:** `canonicalMarketId` resolution (Instrument Mapping). We just reference the id.

## Proposed types

```ts
// What the Basket Builder (P3) sends in.
interface StrategyIntent {
  template: string;          // e.g. "pharma_trial" (see templates.md)
  notional: number;          // total USD the user wants to deploy
  params?: Record<string, unknown>; // template-specific (e.g. chosen single-name symbol, target date)
  mode: "paper" | "live";    // P1 controls which are enabled
}

// One executable leg. References a canonical market; P1's router picks the venue.
interface OrderLeg {
  canonicalMarketId: string; // resolved by P4 Instrument Mapping
  assetClass: "equity" | "etf" | "event_contract";
  side: "buy" | "sell";
  qty: number;               // shares, or contracts for event_contract
  maxSlippageBps: number;    // engine-set guardrail
  role: "primary" | "hedge";
}

// What the engine returns to the UI and hands to the OMS.
interface OrderPlan {
  intentRef: string;         // echo of the originating intent
  legs: OrderLeg[];
  hedgeRatio: number;        // hedge_cost / primary_notional (see SPEC.md s4)
  estCost: number;           // total USD to enter
  estMaxLoss: number;        // estimated worst case after hedge
  outcomePreview: {          // for the UI payoff display
    adverse: { primaryPnl: number; hedgePnl: number; net: number };
    base:    { primaryPnl: number; hedgePnl: number; net: number };
  };
  warnings: string[];        // e.g. "poor expiry alignment", "hedge size scaled to liquidity"
}
```

## Example (pharma_trial, $10k)

```json
{
  "intentRef": "int_abc123",
  "legs": [
    { "canonicalMarketId": "eq:XYZ", "assetClass": "equity", "side": "buy", "qty": 200, "maxSlippageBps": 30, "role": "primary" },
    { "canonicalMarketId": "ev:xyz-fda-approval", "assetClass": "event_contract", "side": "buy", "qty": 3333, "maxSlippageBps": 100, "role": "hedge" }
  ],
  "hedgeRatio": 0.075,
  "estCost": 10750,
  "estMaxLoss": 900,
  "outcomePreview": {
    "adverse": { "primaryPnl": -2500, "hedgePnl": 2300, "net": -200 },
    "base":    { "primaryPnl": 600,  "hedgePnl": -750, "net": -150 }
  },
  "warnings": []
}
```

## Questions for P1 before this is frozen
1. Naming/placement: OK to live in `/contracts/structuring.ts`? Or do you want a different module split?
2. Do you want `qty` in shares or in notional USD (and you convert at fill)? I assumed shares for equity, contracts for events.
3. Should `OrderPlan` be all-or-nothing at the OMS level (atomic basket)? See SPEC.md open question 2.
4. Idempotency key - do you want it on `StrategyIntent` or added by the OMS?
