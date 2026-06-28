export type AssetKind = "stock" | "market";

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  sector?: string;
  country?: string;
  spark: number[];
}

export interface PredictionMarket {
  id: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  theme?: string;
  region?: string;
  resolvesAt: string;
  spark: number[];
  venues?: string[];
  yesVenue?: string;
  noVenue?: string;
  matchConfidence?: number;
}

export interface Holding {
  kind: AssetKind;
  id: string;
  label: string;
  qty: number;
  avgCost: number;
  price: number;
  side?: "YES" | "NO";
}

export interface HedgeSuggestion {
  market: PredictionMarket;
  side: "YES" | "NO";
  direction: "hedge" | "expression";
  offsetScore: number;
  residualRisk: number;
  rationale: string;
}

export interface PayoffPoint {
  x: number;
  unhedged: number;
  combined: number;
}

export interface PayoffResult {
  points: PayoffPoint[];
  varianceRemovedPct: number;
  residualRiskPct: number;
  hedgeCostBps: number;
}

export interface Portfolio {
  totalValue: number;
  dayChangePct: number;
  chart: number[];
  holdings: Holding[];
}

export interface ExposureSlice {
  label: string;
  value: number;
  pct: number;
}

export interface PortfolioExposure {
  bySector: ExposureSlice[];
  byCountry: ExposureSlice[];
  byAssetType: ExposureSlice[];
}

export interface OrderRequest {
  kind: AssetKind;
  id: string;
  side: string;
  qty: number;
}
