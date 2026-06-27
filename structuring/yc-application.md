# YC application - draft answers (P2)

> Drafted from our package. `[USER: ...]` marks things only the team can fill (names, traction, equity). Keep answers tight - YC rewards clarity over hype.

## Company

**Describe what your company does (50 chars):**
Express any market view, auto-hedged in one click.

**What is your company going to make?**
A trading app where a retail user picks a real-world view - long defense, long a biotech, long shipping - and we automatically build the *hedged* version of that position: the directional stock/ETF leg plus the matching prediction-market contract that pays out if the one event that would blow up the thesis happens (the election, the FDA decision, a Gulf blockade). We size the hedge to offset the expected loss, score how good a hedge it is, and disclose what it does and doesn't cover. The instruments already exist on separate venues; nobody assembles the hedged position for a retail user. We do, in one click.

**Category:** Fintech.

**Location:** [USER: where you live now / where based after YC]

## Progress & team

**How far along are you?**
We have the full structuring methodology, a hedge classifier spec, 5 calibrated combo templates, and a runnable reference engine that sizes and scores hedges end-to-end. [USER: backend connectors / live demo status from Abransh.]

**How long have you been working on this / full-time?** [USER]

**Are people using it? Revenue?** [USER: likely "not yet / building MVP."]

**Team & why you:** [USER: 5 builders - who does what, relevant background. P1 backend, P2 product/quant, P3 frontend, P4 data, P5 compliance/GTM.]

## The idea

**Why did you pick this idea?**
[USER: personal angle.] The structural reason: prediction markets just went from niche to infrastructure (Kalshi/Polymarket at multi-billion volumes; IBKR, Coinbase, and Robinhood all added event contracts in the last year). The rails exist, but every platform hands you a blank order ticket. The missing layer is structuring - turning a worldview into a correctly hedged position - which nobody does for retail.

**What's new about what you're making? What do people use instead?**
Today a sophisticated person hedges an event by hand-building an options structure or an OTC trade; everyone else just eats the risk. We make the hedge automatic and legible across two asset classes (equities + event contracts). New = the auto-structuring + a classifier that grades any (stock, event) pair as hedge / expression / unrelated, with a disclosed residual-risk %.

**Who are your competitors? Who do you fear most?**
- Aggregators already combine the venues: Interactive Brokers, Coinbase, Robinhood (stocks + prediction markets in one app). YC has funded prediction-market brokers/aggregators: River Markets, Valence, Dome (acquired by Polymarket).
- But all of them stop at *aggregation* - listing the markets. None do turnkey cross-asset *structuring* for retail. We fear the incumbents (IBKR/Robinhood) adding a structuring layer most; our defense is owning the structuring IP + calibration + the curated trust layer, not the aggregation they can already do.

**Unfair advantage / moat:**
The structuring engine (the hedge classifier + calibration) and cross-venue instrument mapping, plus a curated, disclosure-first trust layer. Suppliers can disintermediate an aggregator; they can't easily copy the structuring + the brand of "the place that hedges your view honestly."

## Business

**How do you make money? How much could you make?**
We act as an agent / riskless principal: we execute the client's instructed combined position through regulated venues and charge an **access + structuring fee** (a few bps to ~1% of structured notional, plus an access subscription). No proprietary risk - revenue scales with structured volume. TAM is the Robinhood-scale retail base intersected with the fast-growing prediction-market user base. [USER: tighten with a top-down number.]

**How will you get users?**
[USER: channels.] Hook: "hedge your portfolio against the news," concrete shareable payoffs (the defense+election, pharma+FDA combos), and the templates as viral, copyable "trade cards."

## Risks (name them - YC respects honesty)
Regulatory is the hard part: cross-jurisdiction access to event contracts. Mitigation: ship US-first / paper for v1, a geo-policy engine as the legal firewall, and a disclosure-first product (we show the hedge ratio + residual; we never claim a perfect hedge). See `regulatory-approach.md`.

## One-line pitch (for the video / intro)
"We're building the trading app that lets anyone express a view about the world and get it automatically hedged - the structuring layer that sits on top of stocks and prediction markets."
