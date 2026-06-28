import type {
  HedgeSuggestion,
  Holding,
  OrderRequest,
  PayoffResult,
  Portfolio,
  PortfolioExposure,
  PredictionMarket,
  Stock,
} from "./types";
import type { Candle, Timeframe } from "../timeframes";
import { mockApi } from "./mock";
import {
  checkAggregatorHealth,
  fetchAggregatorMarket,
  fetchAggregatorMarkets,
} from "./aggregator";
import { fetchAlpacaBars, fetchAlpacaStock, fetchAlpacaStocks } from "./alpaca";
import {
  fetchPolymarketChart,
  fetchPolymarketMarket,
  fetchPolymarketMarkets,
} from "./polymarket";
import { filterByQuery } from "./utils";
import { getMarket, getStock, getStockChart, getMarketChart } from "../../mock/seed";

export interface Api {
  getPortfolio(): Promise<
    Portfolio & { watchlist: Holding[]; exposure: PortfolioExposure }
  >;
  listStocks(q?: string): Promise<Stock[]>;
  listMarkets(q?: string): Promise<PredictionMarket[]>;
  getStock(symbol: string): Promise<Stock & { chart: number[] }>;
  getMarket(id: string): Promise<PredictionMarket & { chart: number[] }>;
  getStockBars(symbol: string, timeframe: Timeframe): Promise<{ candles: Candle[]; live: boolean }>;
  getHedgeSuggestions(symbol: string): Promise<HedgeSuggestion[]>;
  computePayoff(
    symbol: string,
    suggestion: HedgeSuggestion,
    notional: number,
  ): Promise<PayoffResult>;
  placeOrder(o: OrderRequest): Promise<{ ok: true }>;
  getHoldings(): Promise<Holding[]>;
}

export interface DiscoverMeta {
  stocksLive: boolean;
  marketsLive: boolean;
  marketsUnified: boolean;
}

async function listStocksLive(q?: string): Promise<Stock[]> {
  const live = await fetchAlpacaStocks();
  return filterByQuery(live, q);
}

async function listMarketsAggregator(q?: string): Promise<PredictionMarket[]> {
  const live = await fetchAggregatorMarkets(50);
  if (!q?.trim()) return live;
  const lower = q.toLowerCase();
  return live.filter(
    (m) =>
      m.question.toLowerCase().includes(lower) ||
      m.id.toLowerCase().includes(lower) ||
      (m.theme?.toLowerCase().includes(lower) ?? false),
  );
}

async function listMarketsPolymarket(q?: string): Promise<PredictionMarket[]> {
  const live = await fetchPolymarketMarkets(50);
  if (!q?.trim()) return live;
  const lower = q.toLowerCase();
  return live.filter(
    (m) =>
      m.question.toLowerCase().includes(lower) ||
      m.id.toLowerCase().includes(lower) ||
      (m.theme?.toLowerCase().includes(lower) ?? false),
  );
}

async function listMarketsLive(q?: string): Promise<PredictionMarket[]> {
  try {
    const agg = await listMarketsAggregator(q);
    if (agg.length >= 3) return agg;
  } catch {
    /* fall through to polymarket */
  }
  return listMarketsPolymarket(q);
}

async function getStockLive(symbol: string): Promise<Stock & { chart: number[] }> {
  return fetchAlpacaStock(symbol);
}

async function getMarketLive(
  id: string,
): Promise<PredictionMarket & { chart: number[] }> {
  const agg = await fetchAggregatorMarket(id);
  if (agg) {
    const chart = await fetchPolymarketChart(id).catch(() => [agg.yesPrice * 0.95, agg.yesPrice]);
    return { ...agg, chart };
  }

  const market = await fetchPolymarketMarket(id);
  if (!market) throw new Error(`market ${id} not found`);
  const chart = await fetchPolymarketChart(id);
  return { ...market, chart };
}

export const api: Api = {
  ...mockApi,

  async listStocks(q) {
    try {
      const live = await listStocksLive(q);
      if (live.length >= 3) return live;
    } catch {
      /* fall through to mock */
    }
    return mockApi.listStocks(q);
  },

  async listMarkets(q) {
    try {
      const live = await listMarketsLive(q);
      if (live.length >= 3) return live;
    } catch {
      /* fall through to mock */
    }
    return mockApi.listMarkets(q);
  },

  async getStock(symbol) {
    try {
      return await getStockLive(symbol);
    } catch {
      /* mock fallback for demo symbols */
    }
    const stock = getStock(symbol);
    if (!stock) throw new Error(`Stock ${symbol} not found`);
    return { ...stock, chart: getStockChart(symbol) };
  },

  async getMarket(id) {
    try {
      return await getMarketLive(id);
    } catch {
      /* mock fallback for curated demo markets */
    }
    const market = getMarket(id);
    if (!market) throw new Error(`Market ${id} not found`);
    return { ...market, chart: getMarketChart(id) };
  },

  async getStockBars(symbol, timeframe) {
    const bars = await fetchAlpacaBars(symbol, timeframe);
    return { candles: bars.candles, live: bars.live };
  },

  async getHedgeSuggestions(symbol) {
    return mockApi.getHedgeSuggestions(symbol);
  },

  async computePayoff(symbol, suggestion, notional) {
    return mockApi.computePayoff(symbol, suggestion, notional);
  },

  async placeOrder(o) {
    return mockApi.placeOrder(o);
  },

  async getHoldings() {
    return mockApi.getHoldings();
  },
};

export async function getDiscoverMeta(): Promise<DiscoverMeta> {
  const meta: DiscoverMeta = {
    stocksLive: false,
    marketsLive: false,
    marketsUnified: false,
  };
  try {
    const stocks = await fetchAlpacaStocks();
    meta.stocksLive = stocks.length >= 3;
  } catch {
    /* no alpaca keys or market closed */
  }
  try {
    meta.marketsUnified = await checkAggregatorHealth();
    if (meta.marketsUnified) {
      meta.marketsLive = true;
      return meta;
    }
  } catch {
    /* aggregator down */
  }
  try {
    const markets = await fetchPolymarketMarkets(5);
    meta.marketsLive = markets.length >= 3;
  } catch {
    /* polymarket unreachable */
  }
  return meta;
}
