/**
 * Typed mock data for the dashboard. No backend — these fixtures make the
 * dashboard demo instantly on load. Shapes are the contract the UI and a
 * future API converge on.
 */

export type Direction = "up" | "down" | "flat";

/* ---------- Portfolio / overview ---------- */

export interface Portfolio {
  totalValue: number;
  dayChange: number; // absolute, in currency
  dayChangePct: number; // percent, e.g. 1.01
  buyingPower: number;
  positionsCount: number;
  currency: string;
}

export interface PortfolioPoint {
  t: string; // short label
  value: number;
}

export interface Exposure {
  label: string;
  pct: number; // 0–100
}

export const portfolio: Portfolio = {
  totalValue: 128540.32,
  dayChange: 1284.2,
  dayChangePct: 1.01,
  buyingPower: 42300.0,
  positionsCount: 14,
  currency: "USD",
};

/** ~30-point equity curve, gently rising into today. */
export const portfolioSeries: PortfolioPoint[] = [
  118420, 119010, 118650, 120240, 121100, 120680, 122050, 121770, 123180,
  124020, 123540, 124880, 125260, 124910, 126040, 125580, 126930, 127410,
  126980, 128120, 127640, 128990, 129480, 128760, 130110, 129540, 130880,
  129960, 127980, 128540,
].map((value, i) => ({ t: `D${i + 1}`, value }));

export const exposure: Exposure[] = [
  { label: "Equities", pct: 52 },
  { label: "Prediction Markets", pct: 18 },
  { label: "Derivatives", pct: 14 },
  { label: "Bonds", pct: 16 },
];

/* ---------- Trending stocks ---------- */

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  changePct: number; // e.g. 1.2 or -0.6
  direction: Direction;
  spark: number[];
}

const up = (a: number[]): number[] => a;
export const trendingStocks: Stock[] = [
  { symbol: "LMT", name: "Lockheed Martin", price: 472.3, changePct: 1.2, direction: "up", spark: up([465, 466, 464, 468, 467, 470, 469, 471, 472.3]) },
  { symbol: "RTX", name: "RTX Corp", price: 118.4, changePct: 0.8, direction: "up", spark: up([116.9, 117.2, 117.0, 117.6, 117.4, 118.0, 117.9, 118.2, 118.4]) },
  { symbol: "NOC", name: "Northrop Grumman", price: 511.2, changePct: 1.5, direction: "up", spark: up([503, 504, 502, 506, 505, 508, 507, 510, 511.2]) },
  { symbol: "GD", name: "General Dynamics", price: 298.1, changePct: 0.4, direction: "up", spark: up([296.8, 297.0, 296.6, 297.4, 297.2, 297.6, 297.5, 297.9, 298.1]) },
  { symbol: "PFE", name: "Pfizer", price: 28.6, changePct: -0.6, direction: "down", spark: up([28.8, 28.78, 28.82, 28.72, 28.74, 28.66, 28.69, 28.62, 28.6]) },
  { symbol: "MRK", name: "Merck & Co", price: 104.2, changePct: 0.3, direction: "up", spark: up([103.8, 103.9, 103.7, 104.0, 103.95, 104.1, 104.05, 104.18, 104.2]) },
  { symbol: "ZIM", name: "ZIM Integrated", price: 22.4, changePct: 3.1, direction: "up", spark: up([21.6, 21.7, 21.55, 21.9, 21.8, 22.1, 22.0, 22.3, 22.4]) },
];

/* ---------- Trending prediction markets ---------- */

export interface PredictionMarket {
  id: string;
  question: string;
  category: string;
  yesProbability: number; // 0–1
  changePts: number; // 24h move in percentage points
  volume: number; // USD
  direction: Direction;
}

export const trendingMarkets: PredictionMarket[] = [
  { id: "fed-jul", question: "Fed cuts rates in July 2026?", category: "Macro", yesProbability: 0.38, changePts: 4, volume: 2_100_000, direction: "up" },
  { id: "hormuz", question: "Strait of Hormuz blockade in 2026?", category: "Geopolitics", yesProbability: 0.17, changePts: 2, volume: 900_000, direction: "up" },
  { id: "incumbent", question: "Incumbent wins 2026 election?", category: "Politics", yesProbability: 0.43, changePts: -1, volume: 12_400_000, direction: "down" },
  { id: "recession", question: "US recession declared in 2026?", category: "Macro", yesProbability: 0.29, changePts: 3, volume: 3_600_000, direction: "up" },
];

/* ---------- Combined position (Structuring) ---------- */

export interface EquityLeg {
  label: string;
  symbols: string[];
  size: number; // notional USD
}

export interface HedgeLeg {
  label: string;
  side: "YES" | "NO";
  marketPrice: number; // 0–1 implied price of the side being bought
  /** baseline size at the default hedge ratio (display reference) */
  size: number;
}

export interface CombinedPosition {
  thesis: string;
  equityLeg: EquityLeg;
  hedgeLeg: HedgeLeg;
  defaultHedgeRatio: number; // 0–1
  /** plain-language nouns used to build the summary sentence */
  equityNoun: string; // e.g. "defense equities"
  hedgeAgainst: string; // e.g. "the incumbent winning"
}

export const combinedPosition: CombinedPosition = {
  thesis: "Long defense, hedge the election.",
  equityLeg: { label: "Defense basket", symbols: ["LMT", "RTX", "NOC"], size: 5000 },
  hedgeLeg: { label: "NO — incumbent wins", side: "NO", marketPrice: 0.57, size: 1500 },
  defaultHedgeRatio: 0.3,
  equityNoun: "defense equities",
  hedgeAgainst: "the incumbent winning",
};

/** Result of recomputing the preview for a given hedge ratio. */
export interface PreviewResult {
  hedgeRatio: number; // 0–1
  hedgeSize: number;
  netCost: number;
  maxGain: number; // >= 0
  maxLoss: number; // <= 0
}

/**
 * Illustrative (NOT financially exact) preview math. Designed to move
 * sensibly as the hedge ratio changes:
 *   - more hedge  → higher net cost, smaller downside, slightly capped upside.
 */
export function computePreview(
  p: CombinedPosition,
  hedgeRatio: number,
): PreviewResult {
  const equity = p.equityLeg.size;
  const hedgeSize = Math.round(equity * hedgeRatio);
  const netCost = equity + hedgeSize;
  const maxGain = Math.max(0, Math.round(equity * 0.25 - hedgeSize * 0.35));
  const maxLoss = Math.min(0, Math.round(-(equity * 0.2) + hedgeSize * 0.55));
  return { hedgeRatio, hedgeSize, netCost, maxGain, maxLoss };
}

/** Plain-English description of the structured position. */
export function summarize(p: CombinedPosition, hedgeRatio: number): string {
  const k = Math.round(p.equityLeg.size / 1000);
  const pct = Math.round(hedgeRatio * 100);
  return `Long ~$${k}k ${p.equityNoun}, hedged ${pct}% against ${p.hedgeAgainst}.`;
}

/** One point on the payoff/scenario chart. */
export interface PayoffPoint {
  /** 0 = downside scenario (incumbent wins), 1 = upside (incumbent loses) */
  x: number;
  /** non-empty only at the two ends, used as axis labels */
  scenario: string;
  hedged: number; // combined P&L with the prediction hedge
  unhedged: number; // combined P&L if you held only the equity leg
}

/**
 * Combined P&L across the election outcomes. The left end ("Incumbent wins")
 * is the downside; raising the hedge ratio lifts the hedged curve there,
 * visibly cushioning the loss while the unhedged curve stays put.
 */
export function computePayoff(
  p: CombinedPosition,
  hedgeRatio: number,
  steps = 7,
): PayoffPoint[] {
  const cur = computePreview(p, hedgeRatio);
  const base = computePreview(p, 0); // unhedged reference
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  return Array.from({ length: steps }, (_, i) => {
    const x = i / (steps - 1);
    return {
      x,
      scenario:
        i === 0 ? "Incumbent wins" : i === steps - 1 ? "Incumbent loses" : "",
      hedged: Math.round(lerp(cur.maxLoss, cur.maxGain, x)),
      unhedged: Math.round(lerp(base.maxLoss, base.maxGain, x)),
    };
  });
}

/* ---------- By region ---------- */

export interface RegionExposure {
  region: string;
  pct: number; // 0–100
}

export const regionExposure: RegionExposure[] = [
  { region: "North America", pct: 58 },
  { region: "Europe", pct: 19 },
  { region: "Asia", pct: 14 },
  { region: "Middle East", pct: 9 },
];

/* ---------- By sector ---------- */

export interface SectorWeight {
  sector: string;
  pct: number; // 0–100
  color: string;
}

export const sectorWeights: SectorWeight[] = [
  { sector: "Defense", pct: 24, color: "#9580ff" },
  { sector: "Tech", pct: 22, color: "#7c3aed" },
  { sector: "Pharma", pct: 18, color: "#b3a6ff" },
  { sector: "Energy", pct: 14, color: "#cdbcff" },
  { sector: "Shipping", pct: 12, color: "#a3a3a3" },
  { sector: "Financials", pct: 10, color: "#c9c9d4" },
];

/* ---------- Hedge suggestions (curated) ---------- */

export interface HedgeSuggestion {
  id: string;
  equityLabel: string;
  equitySymbols: string[];
  hedgeMarket: string;
  hedgeSide: "YES" | "NO";
  hedgePrice: number; // 0–1
  rationale: string;
  strength: "Strong" | "Moderate" | "Light";
  /** pre-fills the /structure builder when "Build this" is clicked */
  position: CombinedPosition;
}

export const hedgeSuggestions: HedgeSuggestion[] = [
  {
    id: "defense-election",
    equityLabel: "Long Defense",
    equitySymbols: ["LMT", "RTX", "NOC"],
    hedgeMarket: "Incumbent wins 2026",
    hedgeSide: "NO",
    hedgePrice: 0.57,
    rationale: "Defense budgets track the administration.",
    strength: "Strong",
    position: combinedPosition,
  },
  {
    id: "pharma-trial",
    equityLabel: "Long Pharma",
    equitySymbols: ["PFE", "MRK"],
    hedgeMarket: "Drug X Phase 3 succeeds",
    hedgeSide: "NO",
    hedgePrice: 0.61,
    rationale: "Single binary clinical-trial risk.",
    strength: "Moderate",
    position: {
      thesis: "Long pharma, hedge the trial.",
      equityLeg: { label: "Pharma basket", symbols: ["PFE", "MRK"], size: 5000 },
      hedgeLeg: { label: "NO — Drug X Phase 3 succeeds", side: "NO", marketPrice: 0.61, size: 1500 },
      defaultHedgeRatio: 0.3,
      equityNoun: "pharma names",
      hedgeAgainst: "a failed Phase 3 readout",
    },
  },
  {
    id: "shipping-hormuz",
    equityLabel: "Long Shipping",
    equitySymbols: ["ZIM"],
    hedgeMarket: "Hormuz blockade 2026",
    hedgeSide: "YES",
    hedgePrice: 0.17,
    rationale: "Route disruption offset by the hedge payout.",
    strength: "Light",
    position: {
      thesis: "Long shipping, hedge route risk.",
      equityLeg: { label: "Shipping", symbols: ["ZIM"], size: 5000 },
      hedgeLeg: { label: "YES — Hormuz blockade 2026", side: "YES", marketPrice: 0.17, size: 1500 },
      defaultHedgeRatio: 0.3,
      equityNoun: "shipping (ZIM)",
      hedgeAgainst: "a Hormuz blockade",
    },
  },
];

/** Look up a suggestion's pre-fill position by id (for /structure?from=). */
export function positionFromSuggestion(id?: string): CombinedPosition {
  return hedgeSuggestions.find((s) => s.id === id)?.position ?? combinedPosition;
}

/* ====================================================================
   MARKETS DISCOVERY FEED  (/markets)
   ==================================================================== */

/* ---------- Category nav ---------- */

export interface MarketCategory {
  id: string;
  label: string;
  count: number;
}

export const marketCategories: MarketCategory[] = [
  { id: "trending", label: "Trending", count: 128 },
  { id: "politics", label: "Politics", count: 42 },
  { id: "macro", label: "Macro", count: 36 },
  { id: "geopolitics", label: "Geopolitics", count: 24 },
  { id: "equities", label: "Equities", count: 57 },
  { id: "crypto", label: "Crypto", count: 31 },
  { id: "tech", label: "Tech", count: 19 },
  { id: "energy", label: "Energy", count: 14 },
];

/* ---------- Market cards (grid) ----------
   yesProbability/yes is 0–1; cents = round(p*100); No = 100 − cents.    */

export type MarketKind = "binary" | "multi" | "threshold";

export interface MarketOutcomeRow {
  label: string;
  yes: number; // 0–1 implied probability (¢ = yes*100)
  dir?: "up" | "down"; // threshold direction arrow
}

export interface MarketEvent {
  id: string;
  title: string;
  category: string; // matches a MarketCategory.label
  icon: string; // emoji glyph
  kind: MarketKind;
  volume: number; // USD
  changePts: number; // 24h move in pts
  direction: Direction;
  cadence?: string; // "Daily" | "Weekly" | "Monthly"
  live?: boolean;
  yesProbability?: number; // binary
  outcomes?: MarketOutcomeRow[]; // multi / threshold (ranked)
}

export const marketEvents: MarketEvent[] = [
  {
    id: "incumbent-2026",
    title: "Incumbent wins the 2026 election?",
    category: "Politics",
    icon: "🏛️",
    kind: "binary",
    yesProbability: 0.43,
    volume: 12_400_000,
    changePts: -1,
    direction: "down",
    live: true,
  },
  {
    id: "election-winner-2026",
    title: "2026 Presidential election winner",
    category: "Politics",
    icon: "🗳️",
    kind: "multi",
    volume: 64_000_000,
    changePts: 2,
    direction: "up",
    cadence: "Live",
    outcomes: [
      { label: "Incumbent", yes: 0.43 },
      { label: "Challenger A", yes: 0.31 },
      { label: "Challenger B", yes: 0.18 },
      { label: "Field", yes: 0.08 },
    ],
  },
  {
    id: "fed-july",
    title: "Fed cuts rates in July 2026?",
    category: "Macro",
    icon: "💵",
    kind: "binary",
    yesProbability: 0.38,
    volume: 2_100_000,
    changePts: 4,
    direction: "up",
    cadence: "Monthly",
  },
  {
    id: "fed-decision",
    title: "Fed decision at the next meeting",
    category: "Macro",
    icon: "🏦",
    kind: "multi",
    volume: 5_000_000,
    changePts: 3,
    direction: "up",
    cadence: "Monthly",
    outcomes: [
      { label: "No change", yes: 0.62 },
      { label: "25 bps cut", yes: 0.3 },
      { label: "50 bps cut", yes: 0.08 },
    ],
  },
  {
    id: "btc-2026",
    title: "What price will Bitcoin hit in 2026?",
    category: "Crypto",
    icon: "₿",
    kind: "threshold",
    volume: 8_200_000,
    changePts: 5,
    direction: "up",
    cadence: "Daily",
    live: true,
    outcomes: [
      { label: "$80,000", yes: 0.71, dir: "down" },
      { label: "$100,000", yes: 0.54, dir: "up" },
      { label: "$120,000", yes: 0.28, dir: "up" },
    ],
  },
  {
    id: "recession-2026",
    title: "US recession declared in 2026?",
    category: "Macro",
    icon: "📉",
    kind: "binary",
    yesProbability: 0.29,
    volume: 3_600_000,
    changePts: 3,
    direction: "up",
  },
  {
    id: "hormuz-2026",
    title: "Strait of Hormuz blockade in 2026?",
    category: "Geopolitics",
    icon: "⚓",
    kind: "binary",
    yesProbability: 0.17,
    volume: 900_000,
    changePts: 2,
    direction: "up",
  },
  {
    id: "drugx-phase3",
    title: "Drug X Phase 3 trial succeeds?",
    category: "Tech",
    icon: "💊",
    kind: "binary",
    yesProbability: 0.61,
    volume: 1_400_000,
    changePts: -2,
    direction: "down",
  },
  {
    id: "gpt6-2026",
    title: "OpenAI releases GPT-6 in 2026?",
    category: "Tech",
    icon: "🤖",
    kind: "binary",
    yesProbability: 0.47,
    volume: 2_800_000,
    changePts: 6,
    direction: "up",
  },
  {
    id: "defense-budget",
    title: "US defense budget exceeds $900B?",
    category: "Politics",
    icon: "🛡️",
    kind: "binary",
    yesProbability: 0.55,
    volume: 1_100_000,
    changePts: 1,
    direction: "up",
  },
  {
    id: "oil-100",
    title: "Brent crude above $100 in 2026?",
    category: "Energy",
    icon: "🛢️",
    kind: "binary",
    yesProbability: 0.34,
    volume: 1_900_000,
    changePts: 2,
    direction: "up",
  },
  {
    id: "nvda-4t",
    title: "Does Nvidia hit a $4T market cap?",
    category: "Equities",
    icon: "📈",
    kind: "binary",
    yesProbability: 0.49,
    volume: 4_300_000,
    changePts: 3,
    direction: "up",
  },
];

/* ---------- Featured market (hero, multi-line chart) ---------- */

export interface FeaturedOutcome {
  label: string;
  pct: number; // 0–100
  color: string;
}

export interface FeaturedPoint {
  t: string;
  [outcome: string]: number | string;
}

export interface FeaturedMarket {
  id: string;
  title: string;
  category: string;
  icon: string;
  volume: number;
  live: boolean;
  outcomes: FeaturedOutcome[];
  /** time series; one numeric key per outcome label (probability 0–100) */
  series: FeaturedPoint[];
}

const FEATURED_SERIES: Array<[number, number, number]> = [
  [39, 41, 20],
  [40, 40, 20],
  [41, 39, 20],
  [40, 40, 20],
  [42, 38, 20],
  [41, 39, 20],
  [43, 37, 20],
  [42, 38, 20],
  [44, 37, 19],
  [43, 38, 19],
  [44, 37, 19],
  [43, 38, 19],
];

export const featuredMarket: FeaturedMarket = {
  id: "election-winner-2026",
  title: "Who will win the 2026 Presidential election?",
  category: "Politics",
  icon: "🗳️",
  volume: 64_000_000,
  live: true,
  outcomes: [
    { label: "Incumbent", pct: 43, color: "#9580ff" },
    { label: "Challenger", pct: 38, color: "#181925" },
    { label: "Field", pct: 19, color: "#a3a3a3" },
  ],
  series: FEATURED_SERIES.map(([inc, chal, field], i) => ({
    t: `D${i + 1}`,
    Incumbent: inc,
    Challenger: chal,
    Field: field,
  })),
};

/* ====================================================================
   PORTFOLIO POSITIONS  (/dashboard)
   ==================================================================== */

export interface Position {
  id: string;
  title: string;
  type: "Combined" | "Equity" | "Prediction";
  detail: string;
  value: number; // current market value
  cost: number; // cost basis
  pnl: number; // value − cost
  pnlPct: number;
}

export const positions: Position[] = [
  {
    id: "p-defense",
    title: "Long defense, hedge the election",
    type: "Combined",
    detail: "LMT·RTX·NOC + NO Incumbent wins",
    value: 10_840,
    cost: 10_000,
    pnl: 840,
    pnlPct: 8.4,
  },
  {
    id: "p-lmt",
    title: "Lockheed Martin",
    type: "Equity",
    detail: "12 sh @ $452.10 avg",
    value: 5_667.6,
    cost: 5_425.2,
    pnl: 242.4,
    pnlPct: 4.5,
  },
  {
    id: "p-pharma",
    title: "Long pharma, hedge the trial",
    type: "Combined",
    detail: "PFE·MRK + NO Phase 3",
    value: 6_320,
    cost: 6_500,
    pnl: -180,
    pnlPct: -2.8,
  },
  {
    id: "p-fed",
    title: "Fed cuts rates in July 2026",
    type: "Prediction",
    detail: "YES · 38¢ · 200 contracts",
    value: 84,
    cost: 76,
    pnl: 8,
    pnlPct: 10.5,
  },
  {
    id: "p-zim",
    title: "ZIM Integrated",
    type: "Equity",
    detail: "240 sh @ $20.90 avg",
    value: 5_376,
    cost: 5_016,
    pnl: 360,
    pnlPct: 7.2,
  },
  {
    id: "p-recession",
    title: "US recession declared in 2026",
    type: "Prediction",
    detail: "NO · 71¢ · 150 contracts",
    value: 102,
    cost: 106.5,
    pnl: -4.5,
    pnlPct: -4.2,
  },
];

/** Cents helpers for the prediction-market pricing convention. */
export function yesCents(prob: number): number {
  return Math.round(prob * 100);
}
export function noCents(prob: number): number {
  return 100 - Math.round(prob * 100);
}
