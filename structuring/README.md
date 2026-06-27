# /structuring - the P2 package

The product / strategy / quant rulebook. **P2 owns the methodology; P1 implements it in the backend; P3 builds the UI.** Docs only - no backend code, no changes to `contracts/` or the OMS.

## Read in this order
1. **product-tiers.md** - the product shape (templates seed it, the builder is the product).
2. **METHODOLOGY.md** - how a view becomes a hedged position (incl. linkage & hedge effectiveness).
3. **templates.md** / **templates.json** - the 5 starter combos + machine-readable config.
4. **hedge-classifier.md** - implementation spec for P1's layer-3 (formulas, thresholds, pseudocode, output).
5. **strategy-schema.proposal.md** - `StrategyIntent` -> `OrderPlan` (DRAFT, for P1 to ratify into `/contracts`).
6. **demo_classifier.py** - runnable reference implementation. `python3 demo_classifier.py`.
7. **builder-ux.md** - the 3 tiers as screens, for P3.
8. **regulatory-approach.md** - compliance stance + phasing.
9. **yc-onepager.md** - the pitch.
10. **yc-application.md** - draft answers to the standard YC application questions.

Diagrams: `methodology-scheme.png`, `linkage-hedge-graph.png`, `demo-results.png`, `product-tiers.png`.

## Boundary (no overlap)
- **P2** = the rules: hedge math, templates, calibration (`move_adverse`), residual-risk definition, the schema shape.
- **P1** = the engine: relationship engine, hedge classifier, payoff engine, OMS, connectors, ledger.
- **P3** = the builder UI.
See METHODOLOGY.md section 8.

## Decisions (resolved with P1)
1. Hedge sizing: **full offset by default + optional premium cap**.
2. Execution: **atomic / all-or-nothing** basket.
3. `move_adverse` source: **`templates.json`** (P2-editable).
4. Scope: **binary (yes/no) event contracts only** for v1.
