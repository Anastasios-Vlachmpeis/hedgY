import type { NormalizedQuote, VenueSymbol } from "../types.ts";
import { httpJson, type VenueConnector } from "./base.ts";

const GAMMA = "https://gamma-api.polymarket.com";
const CLOB = "https://clob.polymarket.com";

/** Gamma returns some array fields as JSON strings; parse them safely. */
function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Polymarket — event markets. Reads are auth-free (Gamma for discovery, CLOB for
 * live prices). We deliberately do NOT implement placeOrder: trading is on-chain
 * (USDC on Polygon) and out of scope for the data layer — execution is mocked.
 */
export class PolymarketConnector implements VenueConnector {
  readonly venue = "polymarket" as const;
  readonly assetClasses = ["event"] as const;

  available() {
    return true;
  }

  /**
   * Discovery. We pull the most liquid active markets and filter client-side by
   * the query's words (robust — no dependency on a specific search endpoint).
   * Returns ONE VenueSymbol per outcome, since each outcome is its own CLOB token.
   */
  async listMarkets(query?: string): Promise<VenueSymbol[]> {
    const markets: any[] = await httpJson(`${GAMMA}/markets?closed=false&active=true&limit=200`);
    const words = (query ?? "").toLowerCase().split(/\s+/).filter(Boolean);

    const matched = markets
      .filter((m) => {
        if (words.length === 0) return true;
        const hay = String(m.question ?? "").toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .sort((a, b) => Number(b.volumeNum ?? b.volume ?? 0) - Number(a.volumeNum ?? a.volume ?? 0))
      .slice(0, 10);

    const out: VenueSymbol[] = [];
    for (const m of matched) {
      const outcomes = parseArr(m.outcomes);
      const tokenIds = parseArr(m.clobTokenIds);
      const prices = parseArr(m.outcomePrices);
      outcomes.forEach((outcome, i) => {
        if (!tokenIds[i]) return;
        out.push({
          venue: this.venue,
          symbol: tokenIds[i], // CLOB token id
          assetClass: "event",
          meta: { question: m.question, outcome, indicativePrice: Number(prices[i]) },
        });
      });
    }
    return out;
  }

  async getQuote(symbol: string): Promise<NormalizedQuote> {
    // CLOB midpoint returns the live implied probability for this outcome token.
    const mid = await httpJson(`${CLOB}/midpoint?token_id=${symbol}`);
    return {
      venue: this.venue,
      symbol,
      assetClass: "event",
      mid: Number(mid.mid), // probability in [0,1]
      ts: new Date().toISOString(),
    };
  }
}
