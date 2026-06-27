// ─────────────────────────────────────────────────────────────────────────────
// Shared types for the DATA & INTEGRATIONS (P4) layer.
// These will graduate to packages/shared once the full monorepo lands; for now
// they live here so this layer is self-contained and runnable with plain `node`.
// ─────────────────────────────────────────────────────────────────────────────

/** Every external venue we can route to. Add one here + a connector to support it. */
export type Venue = "alpaca" | "polymarket" | "kalshi";

/** What kind of thing an instrument is. Drives how it's priced / displayed. */
export type AssetClass = "equity" | "etf" | "option" | "crypto" | "event";

/**
 * A *resolved* venue-native instrument reference — i.e. a concrete thing we can
 * fetch a quote for or trade. `symbol` is whatever the venue calls it:
 *   alpaca:    "ITA", "LMT", "BTC/USD"
 *   polymarket: a CLOB token id (one per outcome)
 */
export interface VenueSymbol {
  venue: Venue;
  symbol: string;
  assetClass: AssetClass;
  /** Free-form venue extras (e.g. the event question + outcome for Polymarket). */
  meta?: Record<string, unknown>;
}

/**
 * The normalized output of every connector. Whatever the venue's wire format,
 * the rest of the app only ever sees this shape.
 * NOTE: for `event` assets, `mid` is a probability in [0,1], not a dollar price.
 */
export interface NormalizedQuote {
  venue: Venue;
  symbol: string;
  assetClass: AssetClass;
  bid?: number;
  ask?: number;
  /** Mid price. For events this is the implied probability (0..1). */
  mid: number;
  last?: number;
  ts: string; // ISO8601
}

// ── Instrument Mapping (★) ───────────────────────────────────────────────────

/** How a canonical instrument lists on a given venue. */
export interface CatalogListing {
  venue: Venue;
  /** Static venue-native symbol (equities/crypto). */
  symbol?: string;
  /** Dynamic resolution for event markets whose ids change over time. */
  match?: { search: string; outcome?: string };
}

/**
 * The canonical, venue-agnostic instrument. This is the heart of the layer:
 * one canonical id can have many venue listings ("is this the same market?").
 */
export interface CanonicalInstrument {
  /** Stable id, e.g. "crypto:BTC", "etf:ITA", "event:fifa-wc-2026-usa". */
  canonicalId: string;
  assetClass: AssetClass;
  label: string;
  description?: string;
  tags: string[];
  listings: CatalogListing[];
}

// ── Settlement / Reconciliation ──────────────────────────────────────────────

export interface LedgerEntry {
  orderId: string;
  canonicalId: string;
  side: "buy" | "sell";
  qty: number;
  expectedPrice: number;
}

export interface Fill {
  orderId: string;
  venue: Venue;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  ts: string;
}

export interface Break {
  orderId: string;
  kind: "missing_fill" | "qty_mismatch" | "price_slippage" | "unexpected_fill";
  detail: string;
}

// ── Wallet / Custody + Payments ──────────────────────────────────────────────

/** A funding rail. Different venues settle on different rails. */
export type Rail = "fiat_usd" | "usdc_polygon";

export interface Balance {
  rail: Rail;
  currency: string;
  available: number;
}
