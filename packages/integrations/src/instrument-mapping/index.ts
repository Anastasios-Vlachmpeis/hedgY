import { readFileSync } from "node:fs";
import type { CanonicalInstrument, Venue, VenueSymbol } from "../types.ts";
import type { VenueConnector } from "../connectors/base.ts";

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUMENT MAPPING ★  — the canonical taxonomy / "is this the same market?"
//
// This is the semantic core of the whole layer. It does two jobs:
//
//   1) RESOLVE  — turn a venue-agnostic canonical id ("crypto:BTC") into the
//      concrete venue symbols you actually quote/trade. Static listings are used
//      directly; event listings are resolved at runtime by searching the venue
//      (because prediction-market ids churn).
//
//   2) MATCH    — decide whether two venue listings are the SAME underlying
//      market. Exact when both are registered under one canonical id; otherwise
//      a fuzzy text-similarity score. This is what lets us combine products from
//      many venues and stay resilient when a new prediction market appears.
// ─────────────────────────────────────────────────────────────────────────────

interface Catalog {
  instruments: CanonicalInstrument[];
}

/** Normalize text for fuzzy comparison: lowercase, strip punctuation, tokenize. */
function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

/** Jaccard similarity over token sets → 0..1. */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

export class InstrumentMap {
  private readonly byId = new Map<string, CanonicalInstrument>();
  private readonly connectors: Map<Venue, VenueConnector>;

  constructor(connectors: Map<Venue, VenueConnector>, catalog?: Catalog) {
    this.connectors = connectors;
    const data = catalog ?? (JSON.parse(readFileSync(new URL("../seed/catalog.json", import.meta.url), "utf8")) as Catalog);
    for (const inst of data.instruments) this.byId.set(inst.canonicalId, inst);
  }

  all(): CanonicalInstrument[] {
    return [...this.byId.values()];
  }

  get(canonicalId: string): CanonicalInstrument | undefined {
    return this.byId.get(canonicalId);
  }

  /** Search the catalog by label, tags, or canonical id. */
  search(query: string): CanonicalInstrument[] {
    const q = query.toLowerCase();
    return this.all().filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.canonicalId.toLowerCase().includes(q) ||
        i.tags.some((t) => t.includes(q)),
    );
  }

  /** Reverse lookup: which canonical instrument does a venue symbol belong to? */
  canonicalForSymbol(venue: Venue, symbol: string): CanonicalInstrument | undefined {
    return this.all().find((i) => i.listings.some((l) => l.venue === venue && l.symbol === symbol));
  }

  /**
   * RESOLVE a canonical id into concrete, quotable venue symbols.
   * Static listings pass through; `match` listings are resolved live via the
   * venue connector's search.
   */
  async resolve(canonicalId: string): Promise<VenueSymbol[]> {
    const inst = this.byId.get(canonicalId);
    if (!inst) throw new Error(`unknown canonical id: ${canonicalId}`);

    const out: VenueSymbol[] = [];
    for (const listing of inst.listings) {
      if (listing.symbol) {
        out.push({ venue: listing.venue, symbol: listing.symbol, assetClass: inst.assetClass });
        continue;
      }
      if (listing.match) {
        const connector = this.connectors.get(listing.venue);
        if (!connector?.available()) continue;
        const candidates = await connector.listMarkets(listing.match.search);
        const pick = candidates.find(
          (c) => !listing.match!.outcome || c.meta?.outcome === listing.match!.outcome,
        );
        if (pick) out.push(pick);
      }
    }
    return out;
  }

  /**
   * MATCH — "is this the same market?" Returns a confidence in [0,1].
   * 1.0 when both symbols are registered under the same canonical id; otherwise
   * a fuzzy score over their descriptive labels.
   */
  sameMarket(
    a: { venue: Venue; symbol: string; label?: string },
    b: { venue: Venue; symbol: string; label?: string },
  ): { confidence: number; reason: string } {
    const ca = this.canonicalForSymbol(a.venue, a.symbol);
    const cb = this.canonicalForSymbol(b.venue, b.symbol);
    if (ca && cb && ca.canonicalId === cb.canonicalId) {
      return { confidence: 1, reason: `both registered under ${ca.canonicalId}` };
    }
    const la = a.label ?? ca?.label ?? a.symbol;
    const lb = b.label ?? cb?.label ?? b.symbol;
    const score = jaccard(tokens(la), tokens(lb));
    return { confidence: score, reason: `text similarity ${(score * 100).toFixed(0)}% on "${la}" vs "${lb}"` };
  }
}
