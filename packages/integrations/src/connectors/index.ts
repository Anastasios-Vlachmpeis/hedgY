import type { Venue } from "../types.ts";
import type { VenueConnector } from "./base.ts";
import { AlpacaConnector } from "./alpaca.ts";
import { PolymarketConnector } from "./polymarket.ts";

export type { VenueConnector } from "./base.ts";

/** Instantiate every connector and index it by venue. */
export function buildConnectors(): Map<Venue, VenueConnector> {
  const all: VenueConnector[] = [
    new AlpacaConnector(),
    new PolymarketConnector(),
    // new KalshiConnector(),  // <- drop-in later; just implement VenueConnector
  ];
  return new Map(all.map((c) => [c.venue, c]));
}
