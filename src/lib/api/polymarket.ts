import type { PredictionMarket } from "./types";
import {
  categorizeMarket,
  isDiscoverableMarket,
  parseJsonArray,
} from "./utils";

const GAMMA = "/api/polymarket";

interface GammaMarket {
  id?: string;
  slug?: string;
  conditionId?: string;
  question?: string;
  outcomes?: unknown;
  outcomePrices?: unknown;
  volumeNum?: number;
  volume?: number | string;
  endDate?: string;
  closed?: boolean;
  active?: boolean;
}

function yesNoPrices(item: GammaMarket): { yes: number; no: number } | null {
  const outcomes = parseJsonArray(item.outcomes);
  const prices = parseJsonArray(item.outcomePrices).map(Number);
  if (outcomes.length < 2 || prices.length < 2) return null;

  const yesIdx = outcomes.findIndex((o) => o.toLowerCase() === "yes");
  const noIdx = outcomes.findIndex((o) => o.toLowerCase() === "no");
  if (yesIdx < 0 || noIdx < 0) return null;

  const yes = Number(prices[yesIdx]);
  const no = Number(prices[noIdx]);
  if (!Number.isFinite(yes) || !Number.isFinite(no)) return null;
  if (yes <= 0.02 || yes >= 0.98) return null;

  return { yes, no };
}

function mapGammaMarket(item: GammaMarket): PredictionMarket | null {
  const question = item.question?.trim();
  if (!question || !isDiscoverableMarket(question)) return null;

  const prices = yesNoPrices(item);
  if (!prices) return null;

  const id = item.slug || item.conditionId || item.id;
  if (!id) return null;

  const volume = Number(item.volumeNum ?? item.volume ?? 0);
  const theme = categorizeMarket(question);

  return {
    id,
    question,
    yesPrice: prices.yes,
    noPrice: prices.no,
    volume,
    theme,
    region: theme === "Geopolitics" || theme === "Politics" ? "United States" : "Global",
    resolvesAt: item.endDate ?? new Date(Date.now() + 90 * 864e5).toISOString(),
    spark: [prices.yes * 0.95, prices.yes],
  };
}

async function gammaFetch(path: string): Promise<GammaMarket[]> {
  const res = await fetch(`${GAMMA}${path}`);
  if (!res.ok) throw new Error(`polymarket ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function fetchPolymarketMarkets(limit = 40): Promise<PredictionMarket[]> {
  const pageSize = 100;
  const raw: GammaMarket[] = [];

  for (let offset = 0; offset < 300; offset += pageSize) {
    const page = await gammaFetch(
      `/markets?closed=false&active=true&limit=${pageSize}&offset=${offset}&order=volumeNum&ascending=false`,
    );
    raw.push(...page);
    if (page.length < pageSize) break;
  }

  const mapped = raw
    .map(mapGammaMarket)
    .filter((m): m is PredictionMarket => m !== null);

  return mapped.slice(0, limit);
}

export async function fetchPolymarketMarket(id: string): Promise<PredictionMarket | null> {
  const bySlug = await gammaFetch(`/markets?slug=${encodeURIComponent(id)}`);
  const item = bySlug[0];
  if (item) return mapGammaMarket(item);

  const byId = await gammaFetch(`/markets?id=${encodeURIComponent(id)}`);
  return mapGammaMarket(byId[0] ?? {}) ?? null;
}

export async function fetchPolymarketChart(id: string): Promise<number[]> {
  const market = await fetchPolymarketMarket(id);
  if (!market) return [];

  // Gamma doesn't expose a simple price history on the list endpoint; use yes
  // price as a flat 30-point series so the chart renders without fake volatility.
  return Array.from({ length: 30 }, () => market.yesPrice);
}
