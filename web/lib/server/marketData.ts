// ─────────────────────────────────────────────────────────────────────────────
// SERVER-ONLY market data. Runs only on the server (imported by the dashboard
// Server Component), so the Alpaca secret never reaches the browser. Every
// fetcher maps a live venue response into the EXISTING mockData shapes and falls
// back to the mock fixture on any error — the demo can never white-screen.
//
// ⚠️ Do not import this from a "use client" component (would leak the key).
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Portfolio,
  type PortfolioPoint,
  type PredictionMarket,
  type Stock,
  trendingStocks as stocksFallback,
  trendingMarkets as marketsFallback,
  portfolio as portfolioFallback,
  portfolioSeries as seriesFallback,
} from "@/lib/mockData";

const DATA = "https://data.alpaca.markets";
const TRADING = "https://paper-api.alpaca.markets";

const ALP = {
  headers: {
    "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID ?? "",
    "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY ?? "",
  },
  cache: "no-store" as const,
};

// ── Trending stocks (Alpaca) ─────────────────────────────────────────────────

const STOCKS: { symbol: string; name: string }[] = [
  { symbol: "AAPL",  name: "Apple Inc."            },
  { symbol: "MSFT",  name: "Microsoft Corp."        },
  { symbol: "NVDA",  name: "NVIDIA Corp."           },
  { symbol: "TSLA",  name: "Tesla Inc."             },
  { symbol: "AMZN",  name: "Amazon.com Inc."        },
  { symbol: "META",  name: "Meta Platforms"         },
  { symbol: "GOOGL", name: "Alphabet Inc."          },
  { symbol: "JPM",   name: "JPMorgan Chase"         },
  { symbol: "LMT",   name: "Lockheed Martin"        },
  { symbol: "XOM",   name: "Exxon Mobil"            },
  { symbol: "AMD",   name: "Advanced Micro Devices" },
  { symbol: "NFLX",  name: "Netflix Inc."           },
  { symbol: "V",     name: "Visa Inc."              },
  { symbol: "BA",    name: "Boeing Co."             },
  { symbol: "PLTR",  name: "Palantir Technologies"  },
];

export async function getTrendingStocks(): Promise<Stock[]> {
  try {
    const symbols = STOCKS.map((s) => s.symbol).join(",");
    const res = await fetch(`${DATA}/v2/stocks/snapshots?symbols=${symbols}`, ALP);
    if (!res.ok) throw new Error(`alpaca ${res.status}`);
    const snap = await res.json();

    const out = STOCKS.map(({ symbol, name }): Stock | null => {
      const s = snap[symbol];
      const price = s?.latestTrade?.p ?? s?.dailyBar?.c;
      if (price == null) return null;
      const prev = s?.prevDailyBar?.c ?? price;
      const changePct = prev ? ((price - prev) / prev) * 100 : 0;
      return {
        symbol,
        name,
        price,
        changePct: Number(changePct.toFixed(2)),
        direction: changePct >= 0 ? "up" : "down",
        // Free-tier Alpaca has no bar history, so the sparkline is a 2-point
        // prev-close → last line (real direction). Enrich if you add bar data.
        spark: [prev, price],
      };
    }).filter((s): s is Stock => s !== null);

    return out.length ? out : stocksFallback;
  } catch {
    return stocksFallback;
  }
}

// ── Portfolio (Alpaca paper account) ─────────────────────────────────────────

export async function getPortfolio(): Promise<Portfolio> {
  try {
    const [acctRes, posRes] = await Promise.all([
      fetch(`${TRADING}/v2/account`, ALP),
      fetch(`${TRADING}/v2/positions`, ALP),
    ]);
    if (!acctRes.ok) throw new Error(`alpaca account ${acctRes.status}`);
    const a = await acctRes.json();
    const positions = posRes.ok ? await posRes.json() : [];
    const equity = Number(a.equity);
    const lastEquity = Number(a.last_equity) || equity;
    const dayChange = equity - lastEquity;
    return {
      totalValue: equity,
      dayChange,
      dayChangePct: lastEquity ? (dayChange / lastEquity) * 100 : 0,
      buyingPower: Number(a.buying_power),
      positionsCount: Array.isArray(positions) ? positions.length : 0,
      currency: a.currency ?? "USD",
    };
  } catch {
    return portfolioFallback;
  }
}

export async function getPortfolioSeries(): Promise<PortfolioPoint[]> {
  try {
    const res = await fetch(`${TRADING}/v2/account/portfolio/history?period=1M&timeframe=1D`, ALP);
    if (!res.ok) throw new Error(`alpaca history ${res.status}`);
    const h = await res.json();
    // A fresh account's history is mostly zeros (pre-funding). Keep real points;
    // if the account is flat/empty, render a clean flat line at current equity.
    const eq: number[] = (h.equity ?? []).filter((v: number) => v > 0);
    if (eq.length < 2) {
      const v = eq[0] ?? Number(h.base_value) ?? 0;
      return Array.from({ length: 10 }, (_, i) => ({ t: `D${i + 1}`, value: v }));
    }
    return eq.map((value, i) => ({ t: `D${i + 1}`, value }));
  } catch {
    return seriesFallback;
  }
}

// ── Trending prediction markets (Python aggregator backend) ──────────────────

// Sourced from the FastAPI cross-venue aggregator (app/, /markets) — Kalshi +
// Polymarket clustered into one "unified market" with the best price per side.
// We map its UnifiedMarket → the FE PredictionMarket shape. Backend down → mock.
const MARKETS_API = process.env.MARKETS_API_URL ?? "http://localhost:8000";

interface UnifiedMarket {
  id: string;
  canonical_question: string;
  best_yes: { venue: string; price: number } | null;
  match_confidence: number;
  category: string | null;
  venues: string[];
}

// Drop sports + the celebrity 2028-nomination longshots that dominate both venues.
const DROP = /world cup|fifa|nba|nfl|super bowl|\bvs\b|nomination/i;

function categorize(q: string): string {
  if (/putin|russia|ukraine|israel|iran|gaza|taiwan|china|nato|nuclear|opec/i.test(q)) return "Geopolitics";
  if (/bitcoin|ethereum|crypto/i.test(q)) return "Crypto";
  if (/fed|rate|recession|inflation|gdp|tariff|oil|debt|s&p|nasdaq/i.test(q)) return "Macro";
  if (/president|election|government|senate|congress/i.test(q)) return "Politics";
  return "Markets";
}

// UnifiedMarket (list) has no volume; the detail endpoint embeds member markets.
async function marketVolume(id: string): Promise<number> {
  try {
    const r = await fetch(`${MARKETS_API}/markets/${id}`, { cache: "no-store" });
    if (!r.ok) return 0;
    const d = await r.json();
    return (d.member_markets ?? []).reduce((s: number, m: any) => s + Number(m.volume ?? 0), 0);
  } catch {
    return 0;
  }
}

export async function getTrendingMarkets(limit = 4): Promise<PredictionMarket[]> {
  try {
    const res = await fetch(`${MARKETS_API}/markets`, { cache: "no-store" });
    if (!res.ok) throw new Error(`markets api ${res.status}`);
    const all: UnifiedMarket[] = await res.json();

    const top = all
      .filter(
        (u) =>
          u.best_yes != null &&
          !DROP.test(u.canonical_question) &&
          u.canonical_question.length <= 110 && // drop malformed mega-questions
          u.best_yes.price > 0.04 &&
          u.best_yes.price < 0.96, // genuinely uncertain
      )
      // cross-venue clusters first (the aggregator's value), then best-matched
      .sort((a, b) => b.venues.length - a.venues.length || b.match_confidence - a.match_confidence)
      .slice(0, limit);

    const mapped = await Promise.all(
      top.map(async (u): Promise<PredictionMarket> => ({
        id: u.id,
        question: u.canonical_question,
        category: u.category ?? categorize(u.canonical_question),
        yesProbability: u.best_yes!.price,
        changePts: 0, // backend doesn't expose a 24h delta yet
        volume: await marketVolume(u.id),
        direction: "flat",
      })),
    );

    // Too thin (or backend empty)? Keep the clean mock so the panel looks full.
    return mapped.length >= 3 ? mapped : marketsFallback;
  } catch {
    return marketsFallback;
  }
}
