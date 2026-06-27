import type { Fill, NormalizedQuote, VenueSymbol } from "../types.ts";
import { httpJson, type VenueConnector } from "./base.ts";

const KEY = process.env.APCA_API_KEY_ID;
const SECRET = process.env.APCA_API_SECRET_KEY;
const TRADING = process.env.ALPACA_TRADING_URL ?? "https://paper-api.alpaca.markets";
const DATA = process.env.ALPACA_DATA_URL ?? "https://data.alpaca.markets";

const authHeaders = {
  "APCA-API-KEY-ID": KEY ?? "",
  "APCA-API-SECRET-KEY": SECRET ?? "",
};

// Alpaca crypto symbols use a slash ("BTC/USD"); equities don't ("ITA").
const isCrypto = (symbol: string) => symbol.includes("/");

/** Alpaca — equities, ETFs, options, crypto + paper execution. Needs API keys. */
export class AlpacaConnector implements VenueConnector {
  readonly venue = "alpaca" as const;
  readonly assetClasses = ["equity", "etf", "option", "crypto"] as const;

  available() {
    return Boolean(KEY && SECRET);
  }

  async listMarkets(query?: string): Promise<VenueSymbol[]> {
    const assets: any[] = await httpJson(
      `${DATA.replace("data", "paper-api")}/v2/assets?status=active&asset_class=us_equity`,
      { headers: authHeaders },
    );
    const q = query?.toLowerCase();
    return assets
      .filter((a) => a.tradable && (!q || a.symbol.toLowerCase().includes(q) || a.name?.toLowerCase().includes(q)))
      .slice(0, 50)
      .map((a) => ({ venue: this.venue, symbol: a.symbol, assetClass: "equity" as const, meta: { name: a.name } }));
  }

  async getQuote(symbol: string): Promise<NormalizedQuote> {
    if (isCrypto(symbol)) {
      const enc = encodeURIComponent(symbol);
      const data = await httpJson(`${DATA}/v1beta3/crypto/us/latest/quotes?symbols=${enc}`, { headers: authHeaders });
      const q = data.quotes[symbol];
      return { venue: this.venue, symbol, assetClass: "crypto", bid: q.bp, ask: q.ap, mid: (q.bp + q.ap) / 2, ts: q.t };
    }
    const data = await httpJson(`${DATA}/v2/stocks/${symbol}/quotes/latest`, { headers: authHeaders });
    const q = data.quote;
    return { venue: this.venue, symbol, assetClass: "equity", bid: q.bp, ask: q.ap, mid: (q.bp + q.ap) / 2, ts: q.t };
  }

  async placeOrder(order: { symbol: string; side: "buy" | "sell"; qty: number }): Promise<Fill> {
    const res = await fetch(`${TRADING}/v2/orders`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ...order, type: "market", time_in_force: "day" }),
    });
    const o = await res.json();
    if (!res.ok) throw new Error(`Alpaca order rejected: ${o.message ?? JSON.stringify(o)}`);
    return {
      orderId: o.id,
      venue: this.venue,
      symbol: o.symbol,
      side: o.side,
      qty: Number(o.qty),
      price: Number(o.filled_avg_price ?? 0),
      ts: o.submitted_at ?? new Date().toISOString(),
    };
  }
}
