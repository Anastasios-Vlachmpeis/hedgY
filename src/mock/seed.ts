import type { Holding, PredictionMarket, Stock } from "../lib/api/types";

function spark(base: number, volatility = 0.02, points = 30): number[] {
  const result: number[] = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    v *= 1 + (Math.random() - 0.48) * volatility;
    result.push(v);
  }
  return result;
}

function chart(base: number, points = 60): number[] {
  return spark(base, 0.015, points);
}

export const STOCKS: Stock[] = [
  {
    symbol: "TAN",
    name: "Invesco Solar ETF",
    price: 42.18,
    changePct: -0.021,
    sector: "Clean Energy",
    country: "United States",
    spark: spark(42.18, 0.025),
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 128.44,
    changePct: 0.018,
    sector: "Technology",
    country: "United States",
    spark: spark(128.44, 0.02),
  },
  {
    symbol: "XLE",
    name: "Energy Select Sector SPDR",
    price: 89.32,
    changePct: 0.012,
    sector: "Energy",
    country: "United States",
    spark: spark(89.32, 0.018),
  },
  {
    symbol: "GLD",
    name: "SPDR Gold Shares",
    price: 234.67,
    changePct: 0.005,
    sector: "Commodities",
    country: "Global",
    spark: spark(234.67, 0.01),
  },
  {
    symbol: "ARKK",
    name: "ARK Innovation ETF",
    price: 52.91,
    changePct: -0.034,
    sector: "Technology",
    country: "United States",
    spark: spark(52.91, 0.03),
  },
];

export const MARKETS: PredictionMarket[] = [
  {
    id: "trump-2024",
    question: "Will Donald Trump win the 2024 US Presidential election?",
    yesPrice: 0.62,
    noPrice: 0.38,
    volume: 2_400_000_000,
    theme: "Politics",
    region: "United States",
    resolvesAt: "2024-11-05T00:00:00Z",
    spark: spark(0.62, 0.04),
  },
  {
    id: "fed-cut-mar",
    question: "Will the Fed cut rates by March 2025?",
    yesPrice: 0.44,
    noPrice: 0.56,
    volume: 890_000_000,
    theme: "Macro",
    region: "United States",
    resolvesAt: "2025-03-31T00:00:00Z",
    spark: spark(0.44, 0.03),
  },
  {
    id: "btc-100k",
    question: "Will Bitcoin exceed $100k before end of 2025?",
    yesPrice: 0.71,
    noPrice: 0.29,
    volume: 1_200_000_000,
    theme: "Crypto",
    region: "Global",
    resolvesAt: "2025-12-31T00:00:00Z",
    spark: spark(0.71, 0.05),
  },
  {
    id: "solar-subsidy",
    question: "Will US solar subsidies expand in 2025?",
    yesPrice: 0.35,
    noPrice: 0.65,
    volume: 320_000_000,
    theme: "Politics",
    region: "United States",
    resolvesAt: "2025-06-30T00:00:00Z",
    spark: spark(0.35, 0.03),
  },
  {
    id: "oil-90",
    question: "Will WTI crude oil exceed $90/barrel in Q1 2025?",
    yesPrice: 0.48,
    noPrice: 0.52,
    volume: 560_000_000,
    theme: "Macro",
    region: "United States",
    resolvesAt: "2025-03-31T00:00:00Z",
    spark: spark(0.48, 0.035),
  },
];

export const HOLDINGS: Holding[] = [
  {
    kind: "stock",
    id: "TAN",
    label: "Invesco Solar ETF",
    qty: 2370,
    avgCost: 38.5,
    price: 42.18,
  },
  {
    kind: "stock",
    id: "NVDA",
    label: "NVIDIA Corporation",
    qty: 120,
    avgCost: 95.2,
    price: 128.44,
  },
  {
    kind: "market",
    id: "fed-cut-mar",
    label: "Fed cut by March 2025?",
    qty: 500,
    avgCost: 0.38,
    price: 0.44,
    side: "YES",
  },
];

export const WATCHLIST: Holding[] = [
  {
    kind: "stock",
    id: "XLE",
    label: "Energy Select Sector SPDR",
    qty: 0,
    avgCost: 0,
    price: 89.32,
  },
  {
    kind: "stock",
    id: "GLD",
    label: "SPDR Gold Shares",
    qty: 0,
    avgCost: 0,
    price: 234.67,
  },
  {
    kind: "market",
    id: "trump-2024",
    label: "Trump wins 2024 election?",
    qty: 0,
    avgCost: 0,
    price: 0.62,
    side: "YES",
  },
  {
    kind: "market",
    id: "btc-100k",
    label: "Bitcoin exceeds $100k?",
    qty: 0,
    avgCost: 0,
    price: 0.71,
    side: "YES",
  },
];

export const PORTFOLIO_CHART = chart(142_500, 60);

export const PORTFOLIO = {
  totalValue: 142_847.32,
  dayChangePct: -0.008,
  chart: PORTFOLIO_CHART,
  holdings: HOLDINGS,
};

/** Pre-seeded hedge suggestions keyed by stock symbol */
export const CURATED_HEDGES: Record<
  string,
  Array<{
    marketId: string;
    side: "YES" | "NO";
    direction: "hedge" | "expression";
    offsetScore: number;
    residualRisk: number;
    rationale: string;
  }>
> = {
  TAN: [
    {
      marketId: "trump-2024",
      side: "NO",
      direction: "hedge",
      offsetScore: 0.87,
      residualRisk: 0.11,
      rationale:
        "Republican win historically correlates with reduced clean-energy policy support — NO on Trump hedges TAN downside.",
    },
    {
      marketId: "solar-subsidy",
      side: "NO",
      direction: "hedge",
      offsetScore: 0.72,
      residualRisk: 0.24,
      rationale:
        "If solar subsidies fail to expand, TAN faces headwinds — NO contract offsets policy risk.",
    },
    {
      marketId: "oil-90",
      side: "YES",
      direction: "expression",
      offsetScore: 0.65,
      residualRisk: 0.31,
      rationale:
        "Higher oil prices amplify the energy transition narrative — YES on oil amplifies TAN upside.",
    },
  ],
  NVDA: [
    {
      marketId: "btc-100k",
      side: "YES",
      direction: "expression",
      offsetScore: 0.68,
      residualRisk: 0.28,
      rationale:
        "Crypto/AI compute demand overlap — YES on BTC amplifies NVDA upside exposure.",
    },
    {
      marketId: "fed-cut-mar",
      side: "YES",
      direction: "hedge",
      offsetScore: 0.55,
      residualRisk: 0.35,
      rationale:
        "Rate cuts support growth stocks — YES on Fed cut hedges NVDA rate-sensitivity downside.",
    },
  ],
  XLE: [
    {
      marketId: "oil-90",
      side: "YES",
      direction: "expression",
      offsetScore: 0.91,
      residualRisk: 0.08,
      rationale: "Direct oil price exposure — YES on $90 oil amplifies XLE.",
    },
    {
      marketId: "trump-2024",
      side: "YES",
      direction: "hedge",
      offsetScore: 0.58,
      residualRisk: 0.32,
      rationale:
        "Republican energy policy tends to favor fossil fuels — YES on Trump hedges regulatory downside for XLE.",
    },
  ],
};

export function getStock(symbol: string): Stock | undefined {
  return STOCKS.find((s) => s.symbol === symbol);
}

export function getMarket(id: string): PredictionMarket | undefined {
  return MARKETS.find((m) => m.id === id);
}

export function getStockChart(symbol: string): number[] {
  const stock = getStock(symbol);
  return stock ? chart(stock.price, 60) : [];
}

export function getMarketChart(id: string): number[] {
  const market = getMarket(id);
  return market ? chart(market.yesPrice, 60) : [];
}
