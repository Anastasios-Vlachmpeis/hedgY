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
import {
  HOLDINGS,
  MARKETS,
  PORTFOLIO,
  STOCKS,
  WATCHLIST,
  getMarket,
  getMarketChart,
  getStock,
  getStockChart,
} from "../../mock/seed";
import { computePayoff, rankSuggestions } from "../hedge";
import { computePortfolioExposure } from "../portfolio";

const LATENCY = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));
}

function filterByQuery<T extends { symbol?: string; name?: string; question?: string; id?: string }>(
  items: T[],
  q?: string,
): T[] {
  if (!q?.trim()) return items;
  const lower = q.toLowerCase();
  return items.filter(
    (item) =>
      item.symbol?.toLowerCase().includes(lower) ||
      item.name?.toLowerCase().includes(lower) ||
      item.question?.toLowerCase().includes(lower) ||
      item.id?.toLowerCase().includes(lower),
  );
}

export const mockApi = {
  async getPortfolio(): Promise<
    Portfolio & { watchlist: Holding[]; exposure: PortfolioExposure }
  > {
    return delay({
      ...PORTFOLIO,
      watchlist: WATCHLIST,
      exposure: computePortfolioExposure(PORTFOLIO.holdings),
    });
  },

  async listStocks(q?: string): Promise<Stock[]> {
    return delay(filterByQuery(STOCKS, q));
  },

  async listMarkets(q?: string): Promise<PredictionMarket[]> {
    return delay(filterByQuery(MARKETS, q));
  },

  async getStock(symbol: string): Promise<Stock & { chart: number[] }> {
    const stock = getStock(symbol);
    if (!stock) throw new Error(`Stock ${symbol} not found`);
    return delay({ ...stock, chart: getStockChart(symbol) });
  },

  async getMarket(id: string): Promise<PredictionMarket & { chart: number[] }> {
    const market = getMarket(id);
    if (!market) throw new Error(`Market ${id} not found`);
    return delay({ ...market, chart: getMarketChart(id) });
  },

  async getHedgeSuggestions(symbol: string): Promise<HedgeSuggestion[]> {
    return delay(rankSuggestions(symbol));
  },

  async computePayoff(
    symbol: string,
    suggestion: HedgeSuggestion,
    notional: number,
  ): Promise<PayoffResult> {
    const stock = getStock(symbol);
    const moves = stock
      ? Array.from({ length: 41 }, (_, i) => -0.2 + (i / 40) * 0.4)
      : [];
    return delay(computePayoff(moves, suggestion, notional));
  },

  async placeOrder(_o: OrderRequest): Promise<{ ok: true }> {
    return delay({ ok: true });
  },

  async getHoldings(): Promise<Holding[]> {
    return delay(HOLDINGS);
  },
};
