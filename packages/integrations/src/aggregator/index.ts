import type { NormalizedQuote, Venue, VenueSymbol } from "../types.ts";
import type { VenueConnector } from "../connectors/base.ts";

// ─────────────────────────────────────────────────────────────────────────────
// MARKET DATA AGGREGATOR
// Fans a request out across venues, normalizes the results (the connectors do the
// per-venue normalization; the aggregator handles fan-out, caching, failures, and
// the live-update loop). The rest of the app asks the aggregator for prices and
// never has to know which venue served them.
//
// Real-time: a true WS implementation would subscribe to each venue's socket. For
// a 24h demo we ship a polling `subscribe()` — robust on stage, same interface, so
// swapping in WS later is invisible to callers.
// ─────────────────────────────────────────────────────────────────────────────

export interface QuoteResult {
  ref: VenueSymbol;
  quote?: NormalizedQuote;
  error?: string;
}

/** Cross-venue view of one logical thing priced on multiple venues. */
export interface AggregatedQuote {
  quotes: NormalizedQuote[];
  /** Best (lowest) ask to buy, and which venue offers it. */
  bestAsk?: { venue: Venue; price: number };
  /** Best (highest) bid to sell, and which venue offers it. */
  bestBid?: { venue: Venue; price: number };
}

export class MarketDataAggregator {
  private readonly connectors: Map<Venue, VenueConnector>;

  constructor(connectors: Map<Venue, VenueConnector>) {
    this.connectors = connectors;
  }

  /** Venues that are actually usable right now. */
  activeVenues(): Venue[] {
    return [...this.connectors.values()].filter((c) => c.available()).map((c) => c.venue);
  }

  /** Quote a single venue symbol; failures are returned, not thrown. */
  async quote(ref: VenueSymbol): Promise<QuoteResult> {
    const connector = this.connectors.get(ref.venue);
    if (!connector) return { ref, error: `no connector for ${ref.venue}` };
    if (!connector.available()) return { ref, error: `${ref.venue} unavailable (missing keys?)` };
    try {
      return { ref, quote: await connector.getQuote(ref.symbol) };
    } catch (e: any) {
      return { ref, error: e.message ?? String(e) };
    }
  }

  /** Quote many symbols in parallel. */
  async quoteAll(refs: VenueSymbol[]): Promise<QuoteResult[]> {
    return Promise.all(refs.map((r) => this.quote(r)));
  }

  /**
   * Quote the SAME logical instrument across all its venue listings and compute
   * best bid/ask. This is what powers cross-venue best-execution in the UI.
   */
  async aggregate(refs: VenueSymbol[]): Promise<AggregatedQuote> {
    const results = await this.quoteAll(refs);
    const quotes = results.flatMap((r) => (r.quote ? [r.quote] : []));

    let bestAsk: AggregatedQuote["bestAsk"];
    let bestBid: AggregatedQuote["bestBid"];
    for (const q of quotes) {
      if (q.ask != null && (!bestAsk || q.ask < bestAsk.price)) bestAsk = { venue: q.venue, price: q.ask };
      if (q.bid != null && (!bestBid || q.bid > bestBid.price)) bestBid = { venue: q.venue, price: q.bid };
    }
    return { quotes, bestAsk, bestBid };
  }

  /**
   * Live updates. Polls every `intervalMs` and invokes `cb` with fresh quotes.
   * Returns an unsubscribe function. (WS-ready: same signature, swap internals.)
   */
  subscribe(refs: VenueSymbol[], cb: (quotes: QuoteResult[]) => void, intervalMs = 3000): () => void {
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      cb(await this.quoteAll(refs));
    };
    void tick();
    const handle = setInterval(tick, intervalMs);
    return () => {
      stopped = true;
      clearInterval(handle);
    };
  }
}
