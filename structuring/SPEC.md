# Structuring Engine - Spec (P2)

> Owner: P2 (Product/Strategy/Quant). Built jointly with P1 (it runs inside the backend as a core service).
> This doc defines **what the engine does and how the hedge math works**. It does NOT define backend interfaces (OMS, VenueAdapter) - those are P1's. The schema it consumes/produces is proposed separately in `strategy-schema.proposal.md` and must be ratified by P1.

## 1. What it is

The Structuring Engine is the product wedge. It turns a plain-language **view** ("I think there'll be conflict in the Gulf", "I'm long defense but scared of the election") into a concrete, **hedged, multi-instrument position** the user can execute in one click.

It sits between the Basket Builder UI (P3) and the OMS (P1):

```
Basket Builder UI  →  StrategyIntent  →  [Structuring Engine]  →  OrderPlan  →  OMS → Router → venues
```

The engine never touches venues or money directly. It only computes an `OrderPlan` (a list of legs with sizes). Execution, risk gating, and the ledger are P1's.

## 2. Inputs and outputs

- **Input:** `StrategyIntent` - a template id + notional + parameters (see proposal schema).
- **Output:** `OrderPlan` - the primary leg(s), the hedge leg(s), the hedge ratio, and an estimated cost. Each leg references a `canonicalMarketId` (resolved via P4's Instrument Mapping).

## 3. Pipeline (6 steps)

1. **Resolve template** - look up the combo template (see `templates.md`) from `intent.template`.
2. **Select instruments** - map the template's primary exposure (an equity/ETF) and hedge exposure (an event contract) to live `canonicalMarketId`s via P4's Instrument Mapping. Fail clearly if a market is missing or illiquid.
3. **Size the primary leg** - from `intent.notional` and the template's split (default: most of the notional in the primary, a small premium budget for the hedge).
4. **Compute the hedge ratio** - the core quant step (section 4). Decide how many event contracts to buy so the hedge offsets the primary's loss under the adverse outcome.
5. **Generate legs** - produce normalized `OrderLeg[]` (side, qty, max slippage) for primary + hedge.
6. **Estimate cost + risk preview** - total cost, max loss, payoff under each outcome. Hand to P1's Risk Engine for the real pre-trade check; the engine's number is an estimate for UI only.

Output mode is `paper` or `live` (P1 decides what's enabled; engine is identical either way).

## 4. Hedge-ratio methodology (v1 = scenario offset)

We hedge the **adverse outcome** of a binary event. For v1 keep it simple and explainable; do not over-model.

Definitions for one combo:
- `P_primary` = notional in the primary equity leg (USD).
- `move_adverse` = estimated % move of the primary if the adverse event happens (template-provided, e.g. "-12% if the drug fails"). This is the one judgment input per template.
- `L = P_primary * move_adverse` = expected USD loss on the primary under the adverse outcome.
- `price` = current price of the event contract that **pays out on the adverse outcome** (0..1, i.e. implied probability).
- Each "adverse" contract costs `price` and pays `1` if the adverse outcome happens. Net gain per contract if it hits = `(1 - price)`.

**Number of hedge contracts:**

```
N_hedge = L / (1 - price)
```

**Hedge premium (cost of protection):**

```
hedge_cost = N_hedge * price
```

**Hedge ratio** (what we surface in the UI) = `hedge_cost / P_primary` (the % of capital spent buying protection).

### Worked example
- `P_primary` = $10,000 in a defense ETF.
- Template says defense drops ~8% if the "peace/incumbent" adverse outcome resolves → `move_adverse = 0.08`, `L = $800`.
- The event contract for that adverse outcome trades at `price = 0.40`.
- `N_hedge = 800 / (1 - 0.40) = 1,333 contracts`, `hedge_cost = 1,333 * 0.40 = $533`.
- Hedge ratio = `533 / 10,000 = 5.3%` of capital spent on protection. If the adverse event hits, the ~$800 equity loss is offset by the ~$800 contract payout (minus premium).

### Why this and not options-greeks
Event contracts are binary, so a scenario/payoff-matching hedge is the honest model. We are NOT replicating delta hedging. `move_adverse` is a per-template assumption that P2 owns and can refine with history later. v2 can add correlation and partial-payout markets.

## 5. Assumptions and limitations (be honest in the UI)
- Binary outcomes only in v1. Multi-outcome markets get reduced to the relevant adverse leg.
- `move_adverse` is an estimate, not a guarantee. Show it to the user.
- Resolution-timing mismatch: the event may resolve before/after the equity reaction. Template must flag when expiry alignment is poor.
- Liquidity: if the event market can't absorb `N_hedge` at ~`price`, the engine must scale down and tell the user, not silently slip.

## 6. Open questions for P1 (need a decision)
1. Does the engine return one `OrderPlan` and let the Risk Engine veto, or should it pre-check buying power itself? (I assume Risk Engine vetoes.)
2. Atomicity: if the hedge leg fills but the primary doesn't (or vice versa), what's the rollback/contingency? Proposed: OMS treats an `OrderPlan` as all-or-nothing where possible, else flags a partial-fill state.
3. Where does `move_adverse` config live - in this repo (`templates.md` → a JSON), or a config service you own?
