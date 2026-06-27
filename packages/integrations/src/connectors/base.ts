import type { AssetClass, Fill, NormalizedQuote, Venue, VenueSymbol } from "../types.ts";

// ─────────────────────────────────────────────────────────────────────────────
// VENUE CONNECTORS / ADAPTERS
// "One common interface per venue." Every venue (Alpaca, Polymarket, later
// Kalshi) implements this exact interface. The rest of the app never talks
// to a venue's raw API — it talks to a VenueConnector. Adding a venue = adding a
// file that implements this. Nothing downstream changes.
// ─────────────────────────────────────────────────────────────────────────────

export interface VenueConnector {
  readonly venue: Venue;
  /** Which asset classes this venue can serve. */
  readonly assetClasses: readonly AssetClass[];

  /** True if the connector is usable right now (e.g. Alpaca needs API keys). */
  available(): boolean;

  /** Discover markets, optionally filtered by a free-text query. */
  listMarkets(query?: string): Promise<VenueSymbol[]>;

  /** Fetch one normalized quote by venue-native symbol. */
  getQuote(symbol: string): Promise<NormalizedQuote>;

  /** Execution. Optional — read-only venues (Polymarket via our setup) omit it. */
  placeOrder?(order: { symbol: string; side: "buy" | "sell"; qty: number }): Promise<Fill>;
}

/** Small shared fetch helper with a clear error on non-2xx. */
export async function httpJson(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} on ${url}\n${await res.text()}`);
  }
  return res.json();
}
