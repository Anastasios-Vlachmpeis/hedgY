// ─────────────────────────────────────────────────────────────────────────────
// DATA & INTEGRATIONS (P4) — public surface of the layer.
// Everything above this line is internal; the rest of the app imports from here.
// ─────────────────────────────────────────────────────────────────────────────

import { buildConnectors } from "./connectors/index.ts";
import { MarketDataAggregator } from "./aggregator/index.ts";
import { InstrumentMap } from "./instrument-mapping/index.ts";
import { Custody } from "./custody/index.ts";

export * from "./types.ts";
export { MarketDataAggregator } from "./aggregator/index.ts";
export { InstrumentMap } from "./instrument-mapping/index.ts";
export { reconcile } from "./settlement/index.ts";
export { Custody, fundingRailFor } from "./custody/index.ts";
export type { VenueConnector } from "./connectors/base.ts";

/** Wire the whole data layer together in one call. */
export function createDataLayer() {
  const connectors = buildConnectors();
  return {
    connectors,
    aggregator: new MarketDataAggregator(connectors),
    instruments: new InstrumentMap(connectors),
    custody: new Custody(),
  };
}
