import { NextResponse } from "next/server";

const DATA = process.env.ALPACA_DATA_URL ?? "https://data.alpaca.markets";
const KEY = process.env.APCA_API_KEY_ID ?? "";
const SECRET = process.env.APCA_API_SECRET_KEY ?? "";

const SYMBOLS = ["AAPL", "NVDA", "LMT", "MSFT", "AMD", "TSLA", "AMZN", "META", "GOOGL", "JPM", "XOM", "NFLX", "V", "BA", "PLTR"];

export async function GET() {
  try {
    const res = await fetch(
      `${DATA}/v2/stocks/snapshots?symbols=${SYMBOLS.join(",")}`,
      {
        headers: {
          "APCA-API-KEY-ID": KEY,
          "APCA-API-SECRET-KEY": SECRET,
        },
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) throw new Error(`Alpaca ${res.status}`);
    const snap = await res.json();

    const prices: Record<string, { price: number; changePct: number; direction: "up" | "down" }> = {};
    for (const symbol of SYMBOLS) {
      const s = snap[symbol];
      if (!s) continue;
      const price = s.latestTrade?.p ?? s.dailyBar?.c;
      const prev = s.prevDailyBar?.c ?? price;
      if (price == null) continue;
      const changePct = prev ? ((price - prev) / prev) * 100 : 0;
      prices[symbol] = {
        price: Number(price.toFixed(2)),
        changePct: Number(changePct.toFixed(2)),
        direction: changePct >= 0 ? "up" : "down",
      };
    }

    return NextResponse.json(prices);
  } catch {
    return NextResponse.json({}, { status: 200 }); // graceful fallback
  }
}
