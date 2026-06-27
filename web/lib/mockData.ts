/**
 * Typed placeholder data contracts for the dashboard.
 *
 * These are SHAPES, not real data — wire real sources next session.
 * Components should import these types so the UI and the API converge
 * on the same field names.
 */

export type Direction = "up" | "down" | "flat";

/** Top-of-screen portfolio summary. */
export interface Portfolio {
  netLiquidity: number;
  dayChange: number;
  dayChangePct: number;
  buyingPower: number;
  positionsCount: number;
  currency: string;
}

/** A tradable equity shown in the Trending Stocks list. */
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  direction: Direction;
}

/** A prediction-market contract shown in the Trending list. */
export interface PredictionMarket {
  id: string;
  question: string;
  category: string;
  /** Implied probability of YES, 0–1. */
  yesProbability: number;
  /** 24h move in implied probability, in percentage points. */
  changePts: number;
  volume: number;
  direction: Direction;
}

/** A single leg inside the Structuring basket builder. */
export interface BasketLeg {
  symbol: string;
  weight: number;
  side: "long" | "short";
}

/** Aggregated preview of a structured position. */
export interface PositionPreview {
  notional: number;
  estCost: number;
  maxLoss: number;
  maxGain: number;
  legs: BasketLeg[];
}

// --- Placeholder fixtures (empty / zeroed — real data comes next session) ---

export const portfolio: Portfolio = {
  netLiquidity: 0,
  dayChange: 0,
  dayChangePct: 0,
  buyingPower: 0,
  positionsCount: 0,
  currency: "USD",
};

export const trendingStocks: Stock[] = [];

export const trendingMarkets: PredictionMarket[] = [];

export const positionPreview: PositionPreview = {
  notional: 0,
  estCost: 0,
  maxLoss: 0,
  maxGain: 0,
  legs: [],
};
