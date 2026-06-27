# Product tiers - templates seed it, the builder is the product (P2 decision)

> Decision (agreed): the 5 curated templates are NOT the product ceiling. The product is a **generator** that lets a user build their own hedged combo from any stock + any event. Templates are curated, hand-calibrated highlights on top of it. See `product-tiers.png`.

## Why not "just pre-generate a crazy number of combos"
~5,000 stocks/ETFs x ~1,000 live event markets = **~5M pairs**, and 99%+ are unrelated (no causal link). A giant precomputed list is impossible to maintain and mostly junk. You don't want all 5M - you want the tiny **linked** fraction, surfaced on demand. So "cover everything" = a **generator + filter**, not a list.

## The 3 tiers
| Tier | What the user does | Owner |
|---|---|---|
| 1 · Featured templates | Pick a ready-made combo (the 5). Onboarding + trust floor. | P2 (`templates.json`) |
| 2 · Guided builder | "I hold COIN - what can I hedge?" -> system suggests relevant event hedges, each scored. | Relationship engine (P1) + classifier |
| 3 · Free builder | Pick ANY stock + ANY event; system grades the combo, warns if weak. | Classifier discovery mode (P1) + builder UI (P3) |

Templates are the **trust floor**, not the ceiling. The builder is the actual product and the real wedge.

## The one hard part: auto-calibrating an arbitrary pair
The classifier already runs on any `(stock, event)` pair. The only thing templates add is a hand-set `move_adverse`. For a free builder we compute it automatically:
- **Pairs with history** (FDA, Fed, elections) -> run the event study -> `move_adverse` + confidence automatically. Solid.
- **Novel pairs** -> estimate via sector/beta or an LLM-assisted causal map, with **low-confidence flagged**. Weaker but honest.

## Why a free builder is safe (the guardrail)
Every combo comes back labeled `hedge | expression | unrelated` + hedge-quality + residual-risk % + confidence. So we can let the user build *anything* and the system **honestly grades it** instead of silently selling a fake hedge. That is also the compliance win for a broker (disclosure, not a risk claim).

## What ships for YC
Not hundreds of templates. Ship the **5 featured templates** (trust) **+ a basic builder** where the user picks a stock and sees suggested hedges scored live. Even rough discovery shows the real vision - "any view, automatically hedged" - which is a far stronger pitch than 5 canned combos.

## What's missing to get there
- Relationship engine to surface candidate events per stock (P1, his layer-3 "relationship engine").
- Discovery-mode `move_adverse` via event study (spec'd in `hedge-classifier.md`).
- Builder UI (P3).
The math/scoring is done (classifier runs on any pair).
