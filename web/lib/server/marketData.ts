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
  type MarketEvent,
  type MarketCategory,
  type FeaturedMarket,
  type FeaturedPoint,
  type Position,
  type Activity,
  trendingStocks as stocksFallback,
  trendingMarkets as marketsFallback,
  portfolio as portfolioFallback,
  portfolioSeries as seriesFallback,
  marketEvents as eventsFallback,
  marketCategories as categoriesFallback,
  featuredMarket as featuredFallback,
  positions as positionsFallback,
  activity as activityFallback,
} from "@/lib/mockData";
import { usd } from "@/lib/format";

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
  { symbol: "LMT", name: "Lockheed Martin" },
  { symbol: "RTX", name: "RTX Corp" },
  { symbol: "NOC", name: "Northrop Grumman" },
  { symbol: "GD", name: "General Dynamics" },
  { symbol: "PFE", name: "Pfizer" },
  { symbol: "MRK", name: "Merck & Co" },
  { symbol: "ZIM", name: "ZIM Integrated" },
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

interface PriceQuote {
  venue: string;
  price: number;
}

interface UnifiedMarket {
  id: string;
  canonical_question: string;
  best_yes: PriceQuote | null;
  best_no: PriceQuote | null;
  match_confidence: number;
  category: string | null;
  country: string | null;
  theme: string | null;
  venues: string[];
  volume: number;
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

// ── Markets discovery feed (Python aggregator → /markets UI models) ───────────
//
// The /markets discovery surface (MarketEvent grid, FeaturedMarket hero, category
// nav) is fed from the same cross-venue aggregator. Each fetcher maps the live
// UnifiedMarket shape into the existing FE model and falls back to the mock
// fixture on any error, so the page can never white-screen.

const SPORTS =
  /world cup|fifa|\bnba\b|\bnfl\b|super bowl|\bvs\b|premier league|champions league|grand prix/i;

interface FeCategory {
  category: string; // must match a MarketCategory.label
  icon: string; // emoji glyph
}

function feCategory(u: UnifiedMarket): FeCategory {
  const q = u.canonical_question.toLowerCase();
  const c = (u.category ?? "").toLowerCase();
  if (/bitcoin|ethereum|\bcrypto\b|stablecoin|\bbtc\b|\beth\b/.test(q) || c === "crypto")
    return { category: "Crypto", icon: "₿" };
  if (/\boil\b|brent|crude|opec|gas price|\benergy\b/.test(q))
    return { category: "Energy", icon: "🛢️" };
  if (/invade|\bwar\b|ceasefire|nato|nuclear|hormuz|taiwan|iran|russia|ukraine|gaza|israel|missile|regime|greenland/.test(q))
    return { category: "Geopolitics", icon: "🌍" };
  if (/\bfed\b|rate cut|rate hike|fomc|recession|inflation|\bgdp\b|jobs report|unemployment|tariff/.test(q))
    return { category: "Macro", icon: "💵" };
  if (/\bgpt\b|openai|\bai\b|nvidia|\bchip\b|layoffs|aliens|spacex|starship/.test(q) || c === "tech")
    return { category: "Tech", icon: "🤖" };
  if (/nominee|nomination|president|election|senate|congress|governor|prime minister|impeach/.test(q) || c === "politics")
    return { category: "Politics", icon: "🏛️" };
  if (c === "economics") return { category: "Macro", icon: "💵" };
  return { category: "Markets", icon: "📊" };
}

/** Worth showing as a discovery card: priced, not sports/junk, genuinely uncertain. */
function isInteresting(u: UnifiedMarket): boolean {
  if (!u.best_yes) return false;
  if (SPORTS.test(u.canonical_question)) return false;
  if (u.canonical_question.length > 110) return false;
  const p = u.best_yes.price;
  return p > 0.02 && p < 0.98;
}

/** Cross-venue clusters are the aggregator's headline value → rank first, then by volume. */
function discoveryRank(a: UnifiedMarket, b: UnifiedMarket): number {
  return b.venues.length - a.venues.length || b.volume - a.volume;
}

async function fetchUnified(): Promise<UnifiedMarket[]> {
  const res = await fetch(`${MARKETS_API}/markets`, { cache: "no-store" });
  if (!res.ok) throw new Error(`markets api ${res.status}`);
  return res.json();
}

export async function getMarketEvents(limit = 12): Promise<MarketEvent[]> {
  try {
    const events = (await fetchUnified())
      .filter(isInteresting)
      .sort(discoveryRank)
      .slice(0, limit)
      .map((u): MarketEvent => {
        const { category, icon } = feCategory(u);
        return {
          id: u.id,
          title: u.canonical_question,
          category,
          icon,
          kind: "binary",
          volume: u.volume,
          changePts: 0, // backend exposes no 24h delta yet
          direction: "flat",
          live: u.venues.length > 1, // cross-venue = aggregated best price
          yesProbability: u.best_yes!.price,
        };
      });
    return events.length >= 6 ? events : eventsFallback;
  } catch {
    return eventsFallback;
  }
}

export async function getMarketCategories(): Promise<MarketCategory[]> {
  try {
    const interesting = (await fetchUnified()).filter(isInteresting);
    if (interesting.length < 6) return categoriesFallback;
    const counts = new Map<string, number>();
    for (const u of interesting) {
      const { category } = feCategory(u);
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return [
      { id: "trending", label: "Trending", count: interesting.length },
      ...[...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({ id: label.toLowerCase(), label, count })),
    ];
  } catch {
    return categoriesFallback;
  }
}

const FEATURED_COLORS = ["#9580ff", "#181925", "#a3a3a3", "#b3a6ff", "#7c3aed"];

/** "Will Ro Khanna be the Democratic nominee in 2028?" → "Ro Khanna". */
function candidateLabel(question: string): string {
  const m = question.match(/^will\s+(.+?)\s+(?:be|win|become|to)\b/i);
  const name = (m?.[1] ?? question.replace(/^will\s+/i, "")).trim();
  return name.length > 22 ? `${name.slice(0, 21)}…` : name;
}

/**
 * No price history from the backend → synthesize a gentle 12-point series that
 * drifts into the real current odds. Deterministic (no Math.random) so SSR and
 * client render identically. Illustrative trend only; the END values are live.
 */
function synthSeries(finals: number[], labels: string[], steps = 12): FeaturedPoint[] {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const row: FeaturedPoint = { t: `D${i + 1}` };
    finals.forEach((final, k) => {
      const drift = final * 0.12 * (1 - t); // starts ~12% below, converges to live
      const wobble = Math.sin((i + k * 2) * 1.1) * 1.5 * (1 - t);
      row[labels[k]] = Math.max(0, Math.round(final - drift + wobble));
    });
    return row;
  });
}

function buildFeatured(all: UnifiedMarket[]): FeaturedMarket | null {
  // Prefer a real multi-candidate race (showcases cross-venue best-price odds).
  const race = all
    .filter(
      (u) =>
        u.best_yes != null &&
        /democratic.*nomin|nomin.*democratic/i.test(u.canonical_question),
    )
    .sort((a, b) => b.best_yes!.price - a.best_yes!.price);

  // Dedupe candidates by name — the same person can appear on both venues
  // uncombined; keep the best (highest, already sorted) price per unique name.
  // (Unique labels are required: the chart and React keys are keyed by label.)
  const seen = new Set<string>();
  const picks: { label: string; pct: number; source: UnifiedMarket }[] = [];
  for (const u of race) {
    const label = candidateLabel(u.canonical_question);
    if (seen.has(label)) continue;
    seen.add(label);
    picks.push({ label, pct: Math.round(u.best_yes!.price * 100), source: u });
  }

  if (picks.length >= 3) {
    const top = picks.slice(0, 4);
    const outcomes = top.map((c, i) => ({
      label: c.label,
      pct: c.pct,
      color: FEATURED_COLORS[i % FEATURED_COLORS.length],
      marketId: c.source.id, // each candidate is its own tradeable YES market
      side: "YES" as const,
    }));
    return {
      id: top[0].source.id,
      title: "2028 Democratic nominee — best cross-venue odds",
      category: "Politics",
      icon: "🗳️",
      volume: top.reduce((s, c) => s + c.source.volume, 0),
      live: top.some((c) => c.source.venues.length > 1),
      outcomes,
      series: synthSeries(
        outcomes.map((o) => o.pct),
        outcomes.map((o) => o.label),
      ),
    };
  }

  // Fallback: the single most interesting market as a Yes/No hero.
  const single = all.filter(isInteresting).sort(discoveryRank)[0];
  if (!single?.best_yes) return null;
  const yes = Math.round(single.best_yes.price * 100);
  const { category, icon } = feCategory(single);
  const outcomes = [
    { label: "Yes", pct: yes, color: "#9580ff", marketId: single.id, side: "YES" as const },
    { label: "No", pct: 100 - yes, color: "#181925", marketId: single.id, side: "NO" as const },
  ];
  return {
    id: single.id,
    title: single.canonical_question,
    category,
    icon,
    volume: single.volume,
    live: single.venues.length > 1,
    outcomes,
    series: synthSeries([yes, 100 - yes], ["Yes", "No"]),
  };
}

export async function getFeaturedMarket(): Promise<FeaturedMarket> {
  try {
    return buildFeatured(await fetchUnified()) ?? featuredFallback;
  } catch {
    return featuredFallback;
  }
}

// ── Paper-trading account (the live $1000 wallet) ────────────────────────────
//
// Reads the backend ledger (POST /account/deposit + /orders mutate it; see the
// /api route handlers). A fresh account legitimately reads $0 — that's the real
// "deposit to start" state, NOT an error — so we only fall back to mock on an
// actual fetch failure.

interface LiveAccount {
  cash: number;
  equity: number;
  buying_power: number;
  total_deposited: number;
  pnl: number;
  pnl_pct: number;
  positions_count: number;
  currency: string;
}

interface LivePosition {
  id: number;
  kind: "stock" | "prediction";
  symbol: string | null;
  market_id: string | null;
  side: "YES" | "NO" | null;
  qty: number;
  avg_entry: number;
  label: string | null;
  price: number;
  market_value: number;
  cost: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
}

export async function getAccount(): Promise<Portfolio> {
  try {
    const res = await fetch(`${MARKETS_API}/account`, { cache: "no-store" });
    if (!res.ok) throw new Error(`account ${res.status}`);
    const a: LiveAccount = await res.json();
    return {
      totalValue: a.equity,
      dayChange: a.pnl,
      dayChangePct: a.pnl_pct,
      buyingPower: a.buying_power,
      positionsCount: a.positions_count,
      currency: a.currency,
    };
  } catch {
    return portfolioFallback;
  }
}

export async function getPositions(): Promise<Position[]> {
  try {
    const res = await fetch(`${MARKETS_API}/positions`, { cache: "no-store" });
    if (!res.ok) throw new Error(`positions ${res.status}`);
    const live: LivePosition[] = await res.json();
    return live.map((p): Position => {
      if (p.kind === "stock") {
        return {
          id: `pos-${p.id}`,
          title: p.symbol ?? "—",
          type: "Equity",
          detail: `${p.qty.toFixed(4)} shares @ ${usd(p.avg_entry)} avg`,
          value: p.market_value,
          cost: p.cost,
          pnl: p.unrealized_pnl,
          pnlPct: p.unrealized_pnl_pct,
        };
      }
      const cents = Math.round(p.avg_entry * 100);
      return {
        id: `pos-${p.id}`,
        title: p.label ?? "Prediction",
        type: "Prediction",
        detail: `${p.side} · ${cents}¢ · ${Math.round(p.qty).toLocaleString()} contracts`,
        value: p.market_value,
        cost: p.cost,
        pnl: p.unrealized_pnl,
        pnlPct: p.unrealized_pnl_pct,
      };
    });
  } catch {
    return positionsFallback;
  }
}

interface LiveTrade {
  id: number;
  kind: "stock" | "prediction";
  action: "buy" | "sell";
  symbol: string | null;
  side: "YES" | "NO" | null;
  qty: number;
  price: number;
  notional: number;
  label: string | null;
  ts: number;
}

function relTime(secondsAgo: number): string {
  if (secondsAgo < 60) return "just now";
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86_400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  return `${Math.floor(secondsAgo / 86_400)}d ago`;
}

export async function getActivity(): Promise<Activity[]> {
  try {
    const res = await fetch(`${MARKETS_API}/trades`, { cache: "no-store" });
    if (!res.ok) throw new Error(`trades ${res.status}`);
    const trades: LiveTrade[] = await res.json();
    if (trades.length === 0) return []; // fresh account — empty is the real state
    const now = Date.now() / 1000;
    return trades.map((t): Activity => ({
      id: `t-${t.id}`,
      kind: t.action === "buy" ? "Bought" : "Sold",
      title: t.label ?? t.symbol ?? "Trade",
      detail:
        t.kind === "stock"
          ? `${t.qty.toFixed(4)} shares @ $${t.price.toFixed(2)}`
          : `${t.side} · ${Math.round(t.qty).toLocaleString()} contracts @ ${Math.round(t.price * 100)}¢`,
      amount: t.action === "buy" ? -t.notional : t.notional,
      time: relTime(now - t.ts),
    }));
  } catch {
    return activityFallback;
  }
}
