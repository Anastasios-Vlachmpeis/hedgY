import { NextResponse } from "next/server";

const DATA = process.env.ALPACA_DATA_URL ?? "https://data.alpaca.markets";
const KEY = process.env.APCA_API_KEY_ID ?? "";
const SECRET = process.env.APCA_API_SECRET_KEY ?? "";

function oneYearAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
  if (!symbol) return NextResponse.json([], { status: 400 });

  const isCrypto = symbol.includes("/");
  const url = isCrypto
    ? `${DATA}/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(symbol)}&timeframe=1Day&start=${oneYearAgo()}&limit=400`
    : `${DATA}/v2/stocks/bars?symbols=${symbol}&timeframe=1D&start=${oneYearAgo()}&limit=260&adjustment=raw`;

  try {
    const res = await fetch(url, {
      headers: { "APCA-API-KEY-ID": KEY, "APCA-API-SECRET-KEY": SECRET },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Alpaca ${res.status}`);
    const data = await res.json();
    const bars: Array<{ t: string; c: number }> = data.bars?.[symbol] ?? [];
    return NextResponse.json(bars.map((b) => ({ date: b.t.split("T")[0], close: Number(b.c.toFixed(2)) })));
  } catch {
    return NextResponse.json([]);
  }
}
