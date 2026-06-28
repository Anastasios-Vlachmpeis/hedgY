import { NextResponse } from "next/server";

const DATA = process.env.ALPACA_DATA_URL ?? "https://data.alpaca.markets";
const KEY = process.env.APCA_API_KEY_ID ?? "";
const SECRET = process.env.APCA_API_SECRET_KEY ?? "";

const DEFAULT_SYMBOLS = ["AAPL", "NVDA", "LMT", "MSFT", "AMD", "TSLA", "AMZN", "META", "GOOGL", "JPM", "XOM", "NFLX", "V", "BA", "PLTR"];

// Alpaca crypto pairs look like "BTC/USD"; equities never contain a slash.
const isCrypto = (s: string) => s.includes("/");

type Snapshot = {
  latestTrade?: { p?: number };
  dailyBar?: { c?: number };
  prevDailyBar?: { c?: number };
};

type Quote = { price: number; changePct: number; direction: "up" | "down" };

function toQuote(s: Snapshot | undefined): Quote | null {
  if (!s) return null;
  const price = s.latestTrade?.p ?? s.dailyBar?.c;
  if (price == null) return null;
  const prev = s.prevDailyBar?.c ?? price;
  const changePct = prev ? ((price - prev) / prev) * 100 : 0;
  return {
    price: Number(price.toFixed(2)),
    changePct: Number(changePct.toFixed(2)),
    direction: changePct >= 0 ? "up" : "down",
  };
}

const HEADERS = { "APCA-API-KEY-ID": KEY, "APCA-API-SECRET-KEY": SECRET };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");
  const symbolList = symbolsParam
    ? symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
    : DEFAULT_SYMBOLS;

  const stocks = symbolList.filter((s) => !isCrypto(s));
  const crypto = symbolList.filter(isCrypto);
  const prices: Record<string, Quote> = {};
  const fetchOpts = symbolsParam
    ? ({ headers: HEADERS, cache: "no-store" } as const)
    : ({ headers: HEADERS, next: { revalidate: 30 } } as const);

  try {
    if (stocks.length) {
      const res = await fetch(`${DATA}/v2/stocks/snapshots?symbols=${stocks.join(",")}`, fetchOpts);
      if (res.ok) {
        const snap: Record<string, Snapshot> = await res.json();
        for (const symbol of stocks) {
          const q = toQuote(snap[symbol]);
          if (q) prices[symbol] = q;
        }
      }
    }

    if (crypto.length) {
      // crypto snapshots live under a separate, free data feed
      const enc = crypto.map((s) => encodeURIComponent(s)).join(",");
      const res = await fetch(`${DATA}/v1beta3/crypto/us/snapshots?symbols=${enc}`, fetchOpts);
      if (res.ok) {
        const body = await res.json();
        const snaps: Record<string, Snapshot> = body.snapshots ?? {};
        for (const symbol of crypto) {
          const q = toQuote(snaps[symbol]);
          if (q) prices[symbol] = q;
        }
      }
    }

    return NextResponse.json(prices);
  } catch {
    return NextResponse.json(prices, { status: 200 });
  }
}
