# Hedge Classifier - Implementation Spec (P2 rulebook for P1's layer-3)

> Owner: P2 (methodology). Implemented by P1 inside the analytics engine ("the brain"). This turns the `METHODOLOGY.md` two-test logic and the decision graph into concrete inputs, formulas, thresholds, and pseudocode. Language-neutral; map types to pydantic.
> Goal: given a candidate `(equity, event-market)` pair, output `hedge | expression | unrelated` plus a hedge-quality score and a disclosed residual-risk %.

## 1. Where it sits
```
relationship engine (candidate pairs)  ->  [HEDGE CLASSIFIER]  ->  payoff engine / OrderPlan
```
The relationship engine proposes pairs with a hypothesized causal link. The classifier does the **quantitative validation + scoring**. It does not pick instruments or route orders.

## 2. Inputs
```ts
ClassifyInput {
  equity:           { symbol, priceHistory[], positionNotionalUsd }
  eventMarket:      { canonicalId, price /*0..1 implied prob of the outcome*/,
                      outcomeText, resolutionDate, availableLiquidityUsd }
  link:             { causalChannel: string, expectedDirection: "adverse"|"favorable" } | null
  marketIndex:      priceHistory[]            // for the market-model expected return
  analogousEvents?: { date, outcome }[]       // past events of the same type (discovery mode)
  params:           ClassifierParams
}
```

## 3. Two modes
- **Template mode (demo default):** `move_adverse` and confidence come pre-calibrated from `templates.md`. Fast, deterministic, good for the 5 starter combos.
- **Discovery mode:** run an event study over `analogousEvents` to derive `move_adverse`, its sign, and confidence. Used when the relationship engine surfaces a new pair.

Both modes feed the same Test 2 + scoring.

## 4. Formulas (precise)

**Event study (discovery mode) - sign + effect size**
- Expected return via market model estimated on a pre-event window: `E[R] = alpha + beta * R_index`.
- Abnormal return: `AR_t = R_t - E[R_t]`. Cumulative: `CAR_i = sum(AR_t)` over the event window `[t1, t2]`.
- `move_adverse = mean(CAR_i | adverse outcome)` (signed, e.g. -0.25 means equity falls 25%).
- `confidence = clamp(|tStat| / 3, 0, 1)` where `tStat = mean(CAR)/stderr(CAR)`; require enough analogs (see thresholds).

**Sign test (is it a hedge or expression?)**
- The contract must pay `$1` in the state where the equity loses.
- `paysInAdverse = (link.expectedDirection == "adverse")` AND `sign(move_adverse) < 0` for a long equity.
- If the contract pays in the equity's favorable state -> `expression` (adds exposure, not a hedge).

**Sizing + dollar-offset**
- `L = positionNotionalUsd * abs(move_adverse)`            // expected loss in adverse state
- `N_full = L / (1 - price)`                                // contracts for full offset (each pays $1, costs `price`)
- `N = min(N_full, budget / price)`                          // budget = premiumCapPct * notional if a cap is set, else infinity
- `hedgeCost = N * price`
- `netHedgeGainAdverse = N * (1 - price)`
- `dollarOffset = netHedgeGainAdverse / L`                   // ~1.0 at full offset; "highly effective" if in [0.8, 1.25]
- `hedgeQuality = clamp(netHedgeGainAdverse / L, 0, 1)`      // share of the adverse-case loss actually covered

**Residual / basis risk (variance share NOT from this event)**
- `sigmaEvent = abs(move_adverse)`                           // event-conditional move
- `sigmaOther = horizonVolExcludingEventDays(equity, resolutionDate)`  // market + sector + idiosyncratic
- `residualRiskPct = sigmaOther^2 / (sigmaEvent^2 + sigmaOther^2)`     // 0..1, disclosed to client

**Timing alignment** = `good | medium | poor` from how close `resolutionDate` is to the equity's reaction window for this channel.

## 5. Classification decision
```
if link is None:                              -> unrelated   ("no causal channel")
if abs(move_adverse) < minEffect:             -> unrelated   ("effect too small")
if not paysInAdverse:                         -> expression  ("contract pays in equity's favorable state")
if hedgeQuality < minHedgeQuality:            -> expression  ("offset too small to call a hedge")
else:                                         -> hedge
# NOTE: confidence < minConfidence does NOT change the class. It sets warnings += "low-confidence"
# (and is surfaced as a separate field so the UI can widen disclosure / shrink default size).
# In discovery mode you may DROP a pair only when it is BOTH low-confidence AND low-effect.
# Template-mode pairs always have a curated causal link, so they are never "unrelated" on confidence alone.
```

## 6. Thresholds (the knobs P2 calibrates - do not hardcode in P1)
| Param | Default | Meaning |
|---|---|---|
| `minEffect` | 0.03 | min |move_adverse| to be "linked enough" (3%) |
| `minConfidence` | 0.5 | min confidence (or >= 5 analogous events / strong curated prior) |
| `offsetBand` | [0.8, 1.25] | dollar-offset range to be "highly effective" |
| `minHedgeQuality` | 0.5 | min coverage to label `hedge` vs `expression` |
| `premiumCapPct` | null | optional cap on hedge spend as % of notional (null = full offset) |
| `eventWindow` | [-1, +1] | days around the event for the study |

## 7. Pseudocode
```python
def assess_pair(inp, params):
    eq, ev, link = inp.equity, inp.eventMarket, inp.link

    # Test 1a - causal prerequisite
    if link is None:
        return unrelated("no causal channel")

    # Test 1b - effect size + sign
    if inp.mode == "template":
        move_adverse, confidence = link.move_adverse, link.confidence
    else:  # discovery
        es = event_study(eq, ev.outcomeText, inp.analogousEvents, inp.marketIndex,
                         window=params.eventWindow)
        move_adverse, confidence = es.mean_car_given_adverse, es.confidence

    if abs(move_adverse) < params.minEffect:
        return unrelated("effect too small", move_adverse, confidence)
    low_confidence = confidence < params.minConfidence   # flag only; does NOT demote the class

    # Test 2a - right sign
    pays_in_adverse = (link.expectedDirection == "adverse") and move_adverse < 0
    if not pays_in_adverse:
        return expression("contract pays in equity's favorable state", move_adverse)

    # Test 2b - sizing + offset
    p = ev.price
    L = eq.positionNotionalUsd * abs(move_adverse)
    budget = params.premiumCapPct * eq.positionNotionalUsd if params.premiumCapPct else INF
    N = min(L / (1 - p), budget / p)
    hedge_cost = N * p
    net_gain_adverse = N * (1 - p)
    dollar_offset = net_gain_adverse / L
    hedge_quality = clamp(net_gain_adverse / L, 0, 1)

    # Test 2c - residual / basis risk
    sigma_event = abs(move_adverse)
    sigma_other = horizon_vol_excluding_event(eq, ev.resolutionDate)
    residual = sigma_other**2 / (sigma_event**2 + sigma_other**2)

    # Test 2d - timing
    timing = timing_alignment(ev.resolutionDate, equity_reaction_window(link))

    classification = "hedge" if hedge_quality >= params.minHedgeQuality else "expression"
    return HedgeAssessment(
        classification=classification, moveAdverse=move_adverse, confidence=confidence,
        recommendedContracts=N, hedgeCost=hedge_cost, dollarOffset=dollar_offset,
        hedgeQuality=hedge_quality, residualRiskPct=residual, timingAlignment=timing,
        warnings=collect_warnings(...))
```

## 8. Output
```ts
HedgeAssessment {
  classification: "hedge" | "expression" | "unrelated"
  reason: string
  moveAdverse: number          // signed
  confidence: number           // 0..1
  recommendedContracts: number
  hedgeCost: number
  dollarOffset: number         // ~1.0 at full offset
  hedgeQuality: number         // 0..1 -> OrderPlan.hedgeQuality
  residualRiskPct: number      // 0..1 -> OrderPlan.residualRiskPct
  timingAlignment: "good" | "medium" | "poor"
  warnings: string[]
}
```
Maps directly onto the `OrderPlan` fields added in `strategy-schema.proposal.md` (`hedgeClassification`, `hedgeQuality`, `residualRiskPct`).

## 9. Worked example (pharma + FDA, template mode)
`positionNotional = $10,000`, `move_adverse = -0.25`, contract "approval NO" `price = 0.30`.
- `L = 10,000 * 0.25 = $2,500`
- `N = 2,500 / (1 - 0.30) = 3,571 contracts`, `hedgeCost = 3,571 * 0.30 = $1,071`
- `netGainAdverse = 3,571 * 0.70 = $2,500` -> `dollarOffset = 1.0`, `hedgeQuality = 1.0`
- `sigmaOther = 0.12` (non-event horizon vol) -> `residual = 0.12^2 / (0.25^2 + 0.12^2) = 0.19` (~19%)
- sign ok, timing good -> **classification = hedge**, disclose ~19% residual (market/sector/idio).

## 10. Open questions for P1
1. Source for `analogousEvents` in discovery mode - your relationship engine, or a curated event DB I maintain?
2. `horizon_vol_excluding_event` - compute from daily returns over the trailing window minus known event days? Confirm the window.
3. Do you want the classifier to return ALL candidate hedges ranked by `hedgeQuality`, or just the best per equity?
4. Confidence floor when analogs are few (<5) - fall back to curated prior, or mark `low-confidence` and still show?
