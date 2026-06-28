import type { PredictionMarket } from "./types";
import { categorizeMarket } from "./utils";

const MARKETS = "/api/markets";

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

interface MemberMarketPayload {
  venue?: unknown;
  yes_price?: unknown;
  no_price?: unknown;
  volume?: unknown;
  close_time?: unknown;
}

interface MarketDetailPayload extends UnifiedMarket {
  member_markets?: MemberMarketPayload[];
}

const SPORTS =
  /world cup|fifa|\bnba\b|\bnfl\b|super bowl|\bvs\b|premier league|champions league|grand prix/i;

function isInteresting(u: UnifiedMarket): boolean {
  if (!u.best_yes) return false;
  if (SPORTS.test(u.canonical_question)) return false;
  if (u.canonical_question.length > 110) return false;
  const p = u.best_yes.price;
  return p > 0.02 && p < 0.98;
}

function discoveryRank(a: UnifiedMarket, b: UnifiedMarket): number {
  return b.venues.length - a.venues.length || b.volume - a.volume;
}

function mapUnified(u: UnifiedMarket): PredictionMarket {
  const yes = u.best_yes!.price;
  const no = u.best_no?.price ?? 1 - yes;
  const theme = u.theme ?? categorizeMarket(u.canonical_question);

  return {
    id: u.id,
    question: u.canonical_question,
    yesPrice: yes,
    noPrice: no,
    volume: u.volume,
    theme,
    region: u.country ?? (theme === "Geopolitics" || theme === "Politics" ? "United States" : "Global"),
    resolvesAt: new Date(Date.now() + 90 * 864e5).toISOString(),
    spark: [yes * 0.95, yes],
    venues: u.venues,
    yesVenue: u.best_yes?.venue,
    noVenue: u.best_no?.venue,
    matchConfidence: u.match_confidence,
  };
}

async function fetchUnified(): Promise<UnifiedMarket[]> {
  const res = await fetch(MARKETS);
  if (!res.ok) throw new Error(`markets api ${res.status}`);
  return res.json() as Promise<UnifiedMarket[]>;
}

export async function fetchAggregatorMarkets(limit = 50): Promise<PredictionMarket[]> {
  const all = await fetchUnified();
  const filtered = all.filter(isInteresting).sort(discoveryRank).slice(0, limit);
  const mapped = filtered.map(mapUnified);
  if (mapped.length < 3) throw new Error("aggregator returned too few markets");
  return mapped;
}

export async function fetchAggregatorMarket(
  id: string,
): Promise<PredictionMarket | null> {
  const res = await fetch(`${MARKETS}/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const detail = (await res.json()) as MarketDetailPayload;

  if (!detail.best_yes) return null;

  const market = mapUnified(detail);
  const close = detail.member_markets?.find((m) => m.close_time)?.close_time;
  if (typeof close === "string") market.resolvesAt = close;

  return market;
}

export async function checkAggregatorHealth(): Promise<boolean> {
  try {
    const markets = await fetchAggregatorMarkets(5);
    return markets.length >= 3;
  } catch {
    return false;
  }
}
