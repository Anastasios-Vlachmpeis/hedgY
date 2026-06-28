import type { Candle, Timeframe } from "../timeframes";
import { TIMEFRAME_LOOKBACK_DAYS, TIMEFRAME_SECONDS } from "../timeframes";
import type { Stock } from "./types";

const ALPACA = "/api/alpaca";

/** Curated universe from main branch live-wiring + demo seed symbols. */
export const STOCK_UNIVERSE: { symbol: string; name: string; sector?: string }[] = [
  { symbol: "TAN", name: "Invesco Solar ETF", sector: "Clean Energy" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
  { symbol: "XLE", name: "Energy Select Sector SPDR", sector: "Energy" },
  { symbol: "GLD", name: "SPDR Gold Shares", sector: "Commodities" },
  { symbol: "ARKK", name: "ARK Innovation ETF", sector: "Technology" },
  { symbol: "LMT", name: "Lockheed Martin", sector: "Defense" },
  { symbol: "RTX", name: "RTX Corp", sector: "Defense" },
  { symbol: "NOC", name: "Northrop Grumman", sector: "Defense" },
  { symbol: "GD", name: "General Dynamics", sector: "Defense" },
  { symbol: "PFE", name: "Pfizer", sector: "Healthcare" },
  { symbol: "MRK", name: "Merck & Co", sector: "Healthcare" },
  { symbol: "ZIM", name: "ZIM Integrated", sector: "Shipping" },
];

interface AlpacaSnapshot {
  latestTrade?: { p?: number };
  dailyBar?: { c?: number };
  prevDailyBar?: { c?: number };
}

interface AlpacaBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface PriceBars {
  symbol: string;
  candles: Candle[];
  live: boolean;
}

function bucket(sec: number, tfSec: number): number {
  return Math.floor(sec / tfSec) * tfSec;
}

const toCandle = (b: AlpacaBar, tfSec: number): Candle => ({
  time: bucket(Math.floor(Date.parse(b.t) / 1000), tfSec),
  open: b.o,
  high: b.h,
  low: b.l,
  close: b.c,
});

function synthCandles(symbol: string, tfSec: number, count = 160): Candle[] {
  let seed = [...symbol].reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  let price = 100 + (seed % 200);
  const out: Candle[] = [];
  const end = bucket(Math.floor(Date.now() / 1000), tfSec);
  for (let i = count - 1; i >= 0; i--) {
    const time = end - i * tfSec;
    const open = price;
    const drift = (rand() - 0.48) * price * 0.03;
    const close = Math.max(1, open + drift);
    const high = Math.max(open, close) * (1 + rand() * 0.015);
    const low = Math.min(open, close) * (1 - rand() * 0.015);
    out.push({
      time,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
    });
    price = close;
  }
  return out;
}

async function alpacaFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${ALPACA}${path}`);
  if (!res.ok) throw new Error(`alpaca ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchAlpacaStocks(): Promise<Stock[]> {
  const symbols = STOCK_UNIVERSE.map((s) => s.symbol).join(",");
  const snap = await alpacaFetch<Record<string, AlpacaSnapshot>>(
    `/v2/stocks/snapshots?symbols=${symbols}`,
  );

  const stocks = STOCK_UNIVERSE.map(({ symbol, name, sector }): Stock | null => {
    const s = snap[symbol];
    const price = s?.latestTrade?.p ?? s?.dailyBar?.c;
    if (price == null) return null;
    const prev = s?.prevDailyBar?.c ?? price;
    const changePct = prev ? (price - prev) / prev : 0;
    return {
      symbol,
      name,
      price,
      changePct,
      sector,
      country: "United States",
      spark: [prev, price],
    };
  }).filter((s): s is Stock => s !== null);

  if (stocks.length === 0) throw new Error("alpaca returned no snapshots");
  return stocks;
}

export async function fetchAlpacaStock(symbol: string): Promise<Stock & { chart: number[] }> {
  const meta = STOCK_UNIVERSE.find((s) => s.symbol === symbol);
  const start = new Date(Date.now() - 60 * 864e5).toISOString();

  const [snap, barsRes] = await Promise.all([
    alpacaFetch<Record<string, AlpacaSnapshot>>(
      `/v2/stocks/snapshots?symbols=${encodeURIComponent(symbol)}`,
    ),
    alpacaFetch<{ bars?: AlpacaBar[] }>(
      `/v2/stocks/${encodeURIComponent(symbol)}/bars?timeframe=1Day&start=${start}&limit=60&feed=iex`,
    ).catch(() => ({ bars: [] })),
  ]);

  const s = snap[symbol];
  const price = s?.latestTrade?.p ?? s?.dailyBar?.c;
  if (price == null) throw new Error(`no quote for ${symbol}`);

  const prev = s?.prevDailyBar?.c ?? price;
  const changePct = prev ? (price - prev) / prev : 0;
  const bars = barsRes.bars ?? [];
  const chart =
    bars.length >= 2
      ? bars.map((b) => b.c)
      : Array.from({ length: 30 }, (_, i) => price * (0.97 + (i / 29) * 0.03));

  return {
    symbol,
    name: meta?.name ?? symbol,
    price,
    changePct,
    sector: meta?.sector,
    country: "United States",
    spark: chart.length > 1 ? chart.slice(-30) : [prev, price],
    chart,
  };
}

export async function fetchAlpacaBars(
  symbol: string,
  timeframe: Timeframe = "1Day",
): Promise<PriceBars> {
  const isCrypto = symbol.includes("/");
  const tfSec = TIMEFRAME_SECONDS[timeframe];
  const lookback = TIMEFRAME_LOOKBACK_DAYS[timeframe];
  const start = new Date(Date.now() - lookback * 864e5).toISOString();

  try {
    const url = isCrypto
      ? `/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(symbol)}&timeframe=${timeframe}&start=${start}&limit=10000`
      : `/v2/stocks/${encodeURIComponent(symbol)}/bars?timeframe=${timeframe}&start=${start}&limit=10000&feed=iex`;

    const data = await alpacaFetch<{ bars?: AlpacaBar[] | Record<string, AlpacaBar[]> }>(url);
    const raw: AlpacaBar[] = isCrypto
      ? (data.bars as Record<string, AlpacaBar[]>)?.[symbol] ?? []
      : (data.bars as AlpacaBar[]) ?? [];

    const seen = new Set<number>();
    const candles: Candle[] = [];
    for (const b of raw) {
      const c = toCandle(b, tfSec);
      if (seen.has(c.time)) continue;
      seen.add(c.time);
      candles.push(c);
    }
    if (candles.length < 5) throw new Error("too few bars");
    return { symbol, candles, live: true };
  } catch {
    return { symbol, candles: synthCandles(symbol, tfSec), live: false };
  }
}