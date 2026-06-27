import type { Balance, Rail, Venue } from "../types.ts";

// ─────────────────────────────────────────────────────────────────────────────
// WALLET / CUSTODY + PAYMENTS
// Different venues settle on different rails: Polymarket needs USDC on Polygon,
// everything else here is fiat USD. This module owns "which rail funds which
// venue" and (eventually) real deposits/transfers. For the demo it's a seeded,
// in-memory stub — the routing logic is real, the money movement is mocked.
// ─────────────────────────────────────────────────────────────────────────────

/** The funding rail each venue settles on. This is the regulatory/entity story in code. */
const RAIL_BY_VENUE: Record<Venue, Rail> = {
  polymarket: "usdc_polygon",
  kalshi: "fiat_usd",
  alpaca: "fiat_usd",
};

export function fundingRailFor(venue: Venue): Rail {
  return RAIL_BY_VENUE[venue];
}

export class Custody {
  // Seeded balances; in production these come from real wallet/bank integrations.
  private balances: Record<Rail, Balance> = {
    fiat_usd: { rail: "fiat_usd", currency: "USD", available: 100_000 },
    usdc_polygon: { rail: "usdc_polygon", currency: "USDC", available: 50_000 },
  };

  getBalances(): Balance[] {
    return Object.values(this.balances);
  }

  /** Can we fund a trade of `notional` on `venue`? Checks the right rail. */
  canFund(venue: Venue, notional: number): { ok: boolean; rail: Rail; available: number } {
    const rail = fundingRailFor(venue);
    const available = this.balances[rail].available;
    return { ok: available >= notional, rail, available };
  }

  /** Mocked debit — real version initiates a transfer on the rail. */
  reserve(venue: Venue, notional: number): void {
    const rail = fundingRailFor(venue);
    this.balances[rail].available -= notional;
  }
}
