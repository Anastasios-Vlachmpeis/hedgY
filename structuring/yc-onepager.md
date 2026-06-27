# YC one-pager (P2 draft)

**One-liner:** A trading app where you express a real-world view and get it automatically hedged across stocks and prediction markets, in one click.

## Problem
Retail investors can take a view (long defense, long a biotech, long shipping) but can't easily protect it against the one event that would blow it up (the election, the FDA decision, a Gulf blockade). The instruments exist - equities on one venue, event contracts on another - but nobody assembles the hedged position for them. Aggregators (IBKR, Robinhood, Coinbase) now list both, yet they hand you a blank order ticket and leave the structuring to you.

## Solution
One platform that turns a worldview into a hedged, multi-instrument position: the directional equity leg + the matching prediction-market hedge, sized and scored automatically. You keep your upside, cap the event risk, and see exactly what is covered and what is not.

## The wedge
Not aggregation (commoditized - IBKR already does it). The wedge is **structuring + auto-hedge**: a classifier that, for any (stock, event) pair, decides hedge vs expression vs unrelated, sizes the hedge, and discloses the residual risk. Nobody does turnkey cross-asset event hedges for retail.

## How it works (3 tiers)
Featured templates (curated) -> guided builder (suggested hedges per holding) -> free builder (any stock + any event, graded live). See `product-tiers.md`.

## Why now
Prediction markets went from niche to infrastructure (Kalshi/Polymarket multi-billion volumes, IBKR/Coinbase/Robinhood integrations, CFTC thaw). The rails exist; the structuring layer for retail does not.

## Business model
We are an agent / riskless principal - we execute the client's instructed combined position through regulated venues and charge a small **access + structuring fee**. No proprietary risk; every trade is client-driven.
- Example economics: a structuring fee (a few bps to ~1% of structured notional) + a flat/again subscription access fee. Revenue scales with structured volume, not with us taking risk.

## Market
The same broad retail audience as Robinhood, with a wider product universe (equities + bonds + simple derivatives + event contracts) and a reason to come back (hedging real-world views).

## Defensibility
The structuring IP (classifier + calibration), the cross-venue instrument mapping, and the curated trust layer - not the aggregation, which suppliers can disintermediate. New entrants (even a Meta-launched prediction market) just become another product source we offer.

## Risks + mitigation
Regulatory is the hard part (cross-jurisdiction event-contract access). Mitigation: ship **US-first / paper** for v1, a geo-policy engine as the legal firewall, and a **disclosure-first** product (we show the hedge ratio + residual, we never claim a perfect hedge). See `regulatory-approach.md`.

## Team
5 builders: backend/core (P1), product/quant (P2), frontend (P3), data/integrations (P4), compliance/ops/GTM (P5).

## Ask
[fill at submission - raise / hiring / intros]
