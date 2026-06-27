# Regulatory approach (P2 summary - needs counsel)

> Not legal advice. Captures the stance + phasing so the team builds compliantly. Real entity/licensing decisions need a securities lawyer.

## Stance: agent / riskless principal, not a fund
We do not take proprietary positions. We execute the client's instructed combined position through regulated venues and charge an access + structuring fee. Every trade is client-driven, which keeps us out of prop-risk and aligns with riskless-principal / agency execution.

## We structure + disclose, we do not advise
Framing matters: we provide execution + a structured product the client chooses, **with full disclosure** - not personalized investment advice. Structured products are "sold, not bought," so the regulator's focus is disclosure of value and risk. We lean into that: hedge ratio, residual risk, "estimate not guarantee," shown up front.

## Jurisdiction phasing (the legal firewall)
- v1 ships **US-first or paper-trading**; the geo-policy engine gates what each user can trade by jurisdiction.
- Do **not** build cross-border access to prediction markets where they are banned (EU bans etc.) in v1 - that is the regulatory-arbitrage landmine. Treat it as a later, counsel-led question.

## Disclosure duties (build into the UI)
- Hedge ratio + cost of protection.
- Residual / basis risk ("covers the event, not market/sector/idiosyncratic").
- `move_adverse` is an estimate; low-confidence is flagged.
- Event contracts are binary and can resolve to $0.

## KYC/AML + suitability
- Vendor KYC (Persona/Sumsub) at onboarding.
- Suitability gating for complex products.

## Open items for counsel
- Entity structure (US + EU).
- Licensing: broker-dealer / introducing broker; how event contracts are treated per venue/jurisdiction.
- Marketing/communications rules for any "hedging" claims.
