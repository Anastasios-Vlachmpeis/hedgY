# Builder UX spec (for P3)

> How the 3 product tiers become screens. Each screen's data maps to `StrategyIntent` (in) and `OrderPlan` / `HedgeAssessment` (out). Read with `product-tiers.md`, `strategy-schema.proposal.md`, `hedge-classifier.md`.

## Shared "Review & Confirm" component (used by every tier)
Given an `OrderPlan`, show:
- The two legs (primary equity + hedge contract) and their sizes.
- **Hedge ratio** (cost of protection as % of notional) - prominent.
- **Payoff preview:** P&L if the adverse event happens (~0, "you're protected") vs if it does not ("you paid the premium, kept your upside").
- **Residual-risk %** - disclosed clearly: "covers the [event]; does NOT cover market/sector moves."
- Classification chip (hedge / expression) + any low-confidence warning.
- Paper vs live toggle (availability controlled by P1).
- Confirm -> `POST /orders`.

## Tier 1 - Featured templates
- Gallery of the 5 cards (thesis + one-line "what it hedges").
- Tap a card -> combo detail -> enter amount -> Review & Confirm.
- Data: `templates.json` for the cards; engine builds the `OrderPlan` from the amount.

## Tier 2 - Guided builder
- "What do you hold / what's your view?" -> pick a stock or theme.
- System lists **suggested hedges**, each a scored row: event, hedge ratio, residual, confidence, classification.
- Pick one -> enter amount -> Review & Confirm.
- Data: relationship engine returns candidate events; classifier scores each (a list of `HedgeAssessment`).

## Tier 3 - Free builder
- Pick any stock (search) + any event (search).
- Live **assessment panel:** classification (hedge / expression / unrelated), hedge quality, residual, confidence, warnings.
- If unrelated/expression -> explain why and suggest the correct leg.
- If hedge -> enter amount -> Review & Confirm.
- Data: classifier in discovery mode on the chosen pair.

## UX principles
- **Disclosure is a feature:** hedge ratio + residual are always visible, never buried.
- Color-code classification: green = hedge, amber = expression, grey = unrelated.
- Never present a low-confidence estimate as fact - show the flag.
- Plain-language payoff: "if X happens you're protected; if not, you paid $Y and kept your upside."
