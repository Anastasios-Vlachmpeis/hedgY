/**
 * Typed mock data for the dashboard. No backend — these fixtures make the
 * dashboard demo instantly on load. Shapes are the contract the UI and a
 * future API converge on.
 */

import {
  hedgedWealth,
  scaleSizing,
  sizeTwoState,
  type HedgeCalibration,
} from "@/lib/hedgeMath";

export type Direction = "up" | "down" | "flat";

/* ---------- Portfolio / overview ---------- */

export interface Portfolio {
  totalValue: number;
  dayChange: number; // absolute, in currency
  dayChangePct: number; // percent, e.g. 1.01
  buyingPower: number;
  cash: number;
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
  cash: 42000.32,
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
  { id: "republicans-2026", question: "Republicans win 2026 midterms?", category: "Politics", yesProbability: 0.43, changePts: -1, volume: 12_400_000, direction: "down" },
  { id: "recession", question: "US recession declared in 2026?", category: "Macro", yesProbability: 0.29, changePts: 3, volume: 3_600_000, direction: "up" },
];

/* ---------- Combined position (Structuring) ---------- */

export interface EquityLeg {
  label: string;
  symbols: string[];
  size: number; // notional USD
  /** Small gray caption under the instrument. */
  approach?: string;
}

export interface HedgeLeg {
  label: string;
  side: "YES" | "NO";
  marketPrice: number; // 0–1 implied price of the side being bought
  /** baseline size at the default hedge ratio (display reference) */
  size: number;
  approach?: string;
}

export interface CombinedPosition {
  thesis: string;
  equityLeg: EquityLeg;
  hedgeLeg: HedgeLeg;
  defaultHedgeRatio: number; // 0–1
  /** plain-language nouns used to build the summary sentence */
  equityNoun: string; // e.g. "defense equities"
  hedgeAgainst: string; // e.g. "Republicans winning the midterms"
  /** Two-state calibration (hedgingresearch model). */
  calibration: HedgeCalibration;
}

const defenseCalibration: HedgeCalibration = {
  moveAdverse: -0.08,
  moveFavorable: 0.05,
  yesProbability: 0.43,
  hedgeLeg: "NO",
};

export const combinedPosition: CombinedPosition = {
  thesis: "Long defense, hedge midterms.",
  equityLeg: {
    label: "LMT · RTX · NOC",
    symbols: ["LMT", "RTX", "NOC"],
    size: 5000,
    approach: "Modeled −8% if adverse outcome, +5% if favorable (template prior).",
  },
  hedgeLeg: {
    label: "NO — Republicans win House",
    side: "NO",
    marketPrice: 0.57,
    size: 1500,
    approach: "",
  },
  defaultHedgeRatio: 0.3,
  equityNoun: "defense equities",
  hedgeAgainst: "Republicans winning the midterms",
  calibration: defenseCalibration,
};

// Fill hedge approach from sizing at default ratio.
(() => {
  const full = sizeTwoState(combinedPosition.equityLeg.size, defenseCalibration);
  combinedPosition.hedgeLeg.approach = full.approachNote;
  combinedPosition.hedgeLeg.size = Math.round(
    scaleSizing(combinedPosition.equityLeg.size, full, combinedPosition.defaultHedgeRatio)
      .premiumUsd,
  );
})();

/** Result of recomputing the preview for a given hedge ratio. */
export interface PreviewResult {
  hedgeRatio: number; // 0–1
  hedgeSize: number;
  netCost: number;
  maxGain: number; // >= 0
  maxLoss: number; // <= 0
  hedgeQuality: number;
  unhedgedWorst: number;
}

/**
 * Two-state hedge preview: scales N = notional × (r_no − r_yes) by hedge ratio.
 */
export function computePreview(
  p: CombinedPosition,
  hedgeRatio: number,
): PreviewResult {
  const equity = p.equityLeg.size;
  const full = sizeTwoState(equity, p.calibration);
  const scaled = scaleSizing(equity, full, hedgeRatio);
  const { nYes, yesCost, retIfYes, retIfNo } = scaled;

  const pnlYes = hedgedWealth(equity, retIfYes, nYes, yesCost, true) - equity;
  const pnlNo = hedgedWealth(equity, retIfNo, nYes, yesCost, false) - equity;
  const unhedgedYes = equity * retIfYes;
  const unhedgedNo = equity * retIfNo;

  return {
    hedgeRatio,
    hedgeSize: scaled.premiumUsd,
    netCost: equity + scaled.premiumUsd,
    maxGain: Math.max(0, Math.round(Math.max(pnlYes, pnlNo))),
    maxLoss: Math.min(0, Math.round(Math.min(pnlYes, pnlNo))),
    hedgeQuality: scaled.hedgeQuality,
    unhedgedWorst: Math.round(Math.min(unhedgedYes, unhedgedNo)),
  };
}

/** Plain-English description of the structured position. */
export function summarize(p: CombinedPosition, hedgeRatio: number): string {
  const k = Math.round(p.equityLeg.size / 1000);
  const pct = Math.round(hedgeRatio * 100);
  return `Long ~$${k}k ${p.equityNoun}, hedged ${pct}% against ${p.hedgeAgainst}.`;
}

/** One point on the payoff/scenario chart. */
export interface PayoffPoint {
  /** 0 = downside scenario (Republicans win), 1 = upside (Republicans lose) */
  x: number;
  /** non-empty only at the two ends, used as axis labels */
  scenario: string;
  hedged: number; // combined P&L with the prediction hedge
  unhedged: number; // combined P&L if you held only the equity leg
}

/**
 * Combined P&L at the two resolution states (interpolated for the chart).
 */
export function computePayoff(
  p: CombinedPosition,
  hedgeRatio: number,
  steps = 7,
): PayoffPoint[] {
  const equity = p.equityLeg.size;
  const full = sizeTwoState(equity, p.calibration);
  const scaled = scaleSizing(equity, full, hedgeRatio);
  const { nYes, yesCost, retIfYes, retIfNo } = scaled;

  const hedgedYes = hedgedWealth(equity, retIfYes, nYes, yesCost, true) - equity;
  const hedgedNo = hedgedWealth(equity, retIfNo, nYes, yesCost, false) - equity;
  const unhedgedYes = equity * retIfYes;
  const unhedgedNo = equity * retIfNo;

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const adverseLabel =
    p.calibration.moveAdverse < 0 ? "Adverse outcome" : "Downside";
  const favorableLabel = "Favorable outcome";

  return Array.from({ length: steps }, (_, i) => {
    const x = i / (steps - 1);
    return {
      x,
      scenario: i === 0 ? adverseLabel : i === steps - 1 ? favorableLabel : "",
      hedged: Math.round(lerp(hedgedYes, hedgedNo, x)),
      unhedged: Math.round(lerp(unhedgedYes, unhedgedNo, x)),
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
  { sector: "Defense", pct: 24, color: "#0a0a0a" },
  { sector: "Tech", pct: 22, color: "#404040" },
  { sector: "Pharma", pct: 18, color: "#737373" },
  { sector: "Energy", pct: 14, color: "#a3a3a3" },
  { sector: "Shipping", pct: 12, color: "#c4c4c4" },
  { sector: "Financials", pct: 10, color: "#dedede" },
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
  approachNote: string;
  /** pre-fills the /structure builder when "Build this" is clicked */
  position: CombinedPosition;
}

function buildSuggestion(
  id: string,
  equityLabel: string,
  equitySymbols: string[],
  hedgeMarket: string,
  hedgeSide: "YES" | "NO",
  hedgePrice: number,
  rationale: string,
  strength: HedgeSuggestion["strength"],
  position: CombinedPosition,
): HedgeSuggestion {
  const full = sizeTwoState(position.equityLeg.size, position.calibration);
  return {
    id,
    equityLabel,
    equitySymbols,
    hedgeMarket,
    hedgeSide,
    hedgePrice,
    rationale,
    strength,
    approachNote: full.approachNote,
    position,
  };
}

export const hedgeSuggestions: HedgeSuggestion[] = [
  buildSuggestion(
    "defense-election",
    "Long Defense",
    ["LMT", "RTX", "NOC"],
    "Republicans win 2026 midterms",
    "NO",
    0.57,
    "Defense budgets track the administration.",
    "Strong",
    combinedPosition,
  ),
  buildSuggestion(
    "pharma-fda",
    "Long Pharma",
    ["PFE", "MRK"],
    "Pfizer GLP-1 FDA approval 2026",
    "NO",
    0.61,
    "Binary FDA readout risk on the lead asset.",
    "Moderate",
    {
      thesis: "Long Pfizer, hedge FDA outcome.",
      equityLeg: {
        label: "PFE · MRK",
        symbols: ["PFE", "MRK"],
        size: 5000,
        approach: "Modeled −25% on rejection, +12% on approval (template prior).",
      },
      hedgeLeg: {
        label: "NO — Pfizer GLP-1 FDA approval",
        side: "NO",
        marketPrice: 0.61,
        size: 0,
        approach: "",
      },
      defaultHedgeRatio: 0.3,
      equityNoun: "pharma names",
      hedgeAgainst: "the GLP-1 approval",
      calibration: {
        moveAdverse: -0.25,
        moveFavorable: 0.12,
        yesProbability: 0.39,
        hedgeLeg: "NO",
      },
    },
  ),
  buildSuggestion(
    "shipping-hormuz",
    "Long Shipping",
    ["ZIM"],
    "Strait of Hormuz blockade 2026",
    "YES",
    0.17,
    "Route disruption offset by the hedge payout.",
    "Light",
    {
      thesis: "Long ZIM, hedge Hormuz.",
      equityLeg: {
        label: "ZIM Integrated",
        symbols: ["ZIM"],
        size: 5000,
        approach: "Modeled −15% if blockade, +8% if strait stays open.",
      },
      hedgeLeg: {
        label: "YES — Strait of Hormuz blockade",
        side: "YES",
        marketPrice: 0.17,
        size: 0,
        approach: "",
      },
      defaultHedgeRatio: 0.3,
      equityNoun: "ZIM shipping",
      hedgeAgainst: "a Hormuz blockade",
      calibration: {
        moveAdverse: -0.15,
        moveFavorable: 0.08,
        yesProbability: 0.17,
        hedgeLeg: "YES",
      },
    },
  ),
];

// Back-fill hedge leg sizes and approach notes.
for (const s of hedgeSuggestions) {
  const full = sizeTwoState(s.position.equityLeg.size, s.position.calibration);
  s.position.hedgeLeg.approach = full.approachNote;
  s.position.hedgeLeg.size = Math.round(
    scaleSizing(s.position.equityLeg.size, full, s.position.defaultHedgeRatio).premiumUsd,
  );
}

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

/** One venue's quote inside a cross-venue cluster (Kalshi / Polymarket). */
export interface VenueQuote {
  venue: string; // "kalshi" | "polymarket"
  yes: number; // 0–1 implied YES
  no: number; // 0–1 implied NO
  volume: number; // USD
  link?: string; // deep link to the market on that venue
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
  // cross-venue detail (live aggregator only; absent on mock fallback)
  noProbability?: number; // best NO price across venues
  venues?: string[]; // venues this market clusters across
  bestYesVenue?: string; // venue offering the best YES
  bestNoVenue?: string; // venue offering the best NO
  members?: VenueQuote[]; // per-venue breakdown (Kalshi vs Polymarket)
}

export const marketEvents: MarketEvent[] = [
  {
    id: "republicans-2026",
    title: "Republicans win 2026 midterms?",
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
    id: "midterms-house-2026",
    title: "2026 midterms: who controls the House?",
    category: "Politics",
    icon: "🗳️",
    kind: "multi",
    volume: 64_000_000,
    changePts: 2,
    direction: "up",
    cadence: "Live",
    outcomes: [
      { label: "Republicans", yes: 0.43 },
      { label: "Democrats", yes: 0.31 },
      { label: "Split", yes: 0.18 },
      { label: "Other", yes: 0.08 },
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
    id: "pfizer-glp1",
    title: "Pfizer GLP-1 drug FDA approval 2026?",
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
  marketId?: string; // unified market id, when this outcome is tradeable
  side?: "YES" | "NO";
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
  id: "midterms-house-2026",
  title: "Who controls the House after 2026 midterms?",
  category: "Politics",
  icon: "🗳️",
  volume: 64_000_000,
  live: true,
  outcomes: [
    { label: "Republicans", pct: 43, color: "#0a0a0a" },
    { label: "Democrats", pct: 38, color: "#737373" },
    { label: "Split", pct: 19, color: "#a3a3a3" },
  ],
  series: FEATURED_SERIES.map(([rep, dem, split], i) => ({
    t: `D${i + 1}`,
    Republicans: rep,
    Democrats: dem,
    Split: split,
  })),
};

/* ====================================================================
   PORTFOLIO POSITIONS  (/dashboard)
   ==================================================================== */

export interface PositionLeg {
  label: string;
  value: number;
  approach?: string;
}

export interface Position {
  id: string;
  title: string;
  type: "Combined" | "Equity" | "Prediction";
  detail: string;
  value: number; // current market value
  cost: number; // cost basis
  pnl: number; // value − cost
  pnlPct: number;
  /** Small gray methodology / disclosure line. */
  approach?: string;
  // Combined positions expose their two legs so the hedge structure is visible.
  equityLeg?: PositionLeg;
  hedgeLeg?: PositionLeg;
}

export const positions: Position[] = [
  {
    id: "p-defense",
    title: "Long Lockheed Martin, hedge midterms",
    type: "Combined",
    detail: "LMT · RTX · NOC + NO Republicans win House",
    value: 10_840,
    cost: 10_000,
    pnl: 840,
    pnlPct: 8.4,
    equityLeg: {
      label: "LMT · RTX · NOC",
      value: 8_300,
      approach: combinedPosition.equityLeg.approach,
    },
    hedgeLeg: {
      label: "NO — Republicans win House @57%",
      value: 2_540,
      approach: combinedPosition.hedgeLeg.approach,
    },
  },
  {
    id: "p-lmt",
    title: "Lockheed Martin",
    type: "Equity",
    detail: "12 shares @ $452.10 avg",
    approach: "Spot equity leg; no paired event hedge on this line.",
    value: 5_667.6,
    cost: 5_425.2,
    pnl: 242.4,
    pnlPct: 4.5,
  },
  {
    id: "p-pharma",
    title: "Long Pfizer, hedge FDA outcome",
    type: "Combined",
    detail: "PFE · MRK + NO Pfizer GLP-1 FDA approval",
    value: 6_320,
    cost: 6_500,
    pnl: -180,
    pnlPct: -2.8,
    equityLeg: {
      label: "PFE · MRK",
      value: 4_900,
      approach: hedgeSuggestions[1]!.position.equityLeg.approach,
    },
    hedgeLeg: {
      label: "NO — Pfizer GLP-1 FDA approval @61%",
      value: 1_420,
      approach: hedgeSuggestions[1]!.position.hedgeLeg.approach,
    },
  },
  {
    id: "p-fed",
    title: "Fed cuts rates in July 2026",
    type: "Prediction",
    detail: "YES · 38¢ · 200 contracts",
    approach: "Binary contract; pays $1 per YES share if the event resolves YES.",
    value: 84,
    cost: 76,
    pnl: 8,
    pnlPct: 10.5,
  },
  {
    id: "p-zim",
    title: "ZIM Integrated",
    type: "Equity",
    detail: "240 shares @ $20.90 avg",
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
  {
    id: "p-rtx",
    title: "RTX Corp",
    type: "Equity",
    detail: "60 shares @ $112.80 avg",
    value: 7_104,
    cost: 6_768,
    pnl: 336,
    pnlPct: 4.96,
  },
  {
    id: "p-noc",
    title: "Northrop Grumman",
    type: "Equity",
    detail: "8 shares @ $498.40 avg",
    value: 4_089.6,
    cost: 3_987.2,
    pnl: 102.4,
    pnlPct: 2.57,
  },
  {
    id: "p-shipping",
    title: "Long ZIM, hedge Hormuz",
    type: "Combined",
    detail: "ZIM Integrated + YES Hormuz blockade",
    value: 5_180,
    cost: 5_000,
    pnl: 180,
    pnlPct: 3.6,
    equityLeg: {
      label: "ZIM Integrated",
      value: 3_980,
      approach: hedgeSuggestions[2]!.position.equityLeg.approach,
    },
    hedgeLeg: {
      label: "YES — Strait of Hormuz blockade @17%",
      value: 1_200,
      approach: hedgeSuggestions[2]!.position.hedgeLeg.approach,
    },
  },
  {
    id: "p-btc",
    title: "Bitcoin above $100k in 2026",
    type: "Prediction",
    detail: "YES · 54¢ · 400 contracts",
    value: 232,
    cost: 216,
    pnl: 16,
    pnlPct: 7.41,
  },
  {
    id: "p-mrk",
    title: "Merck & Co",
    type: "Equity",
    detail: "30 shares @ $101.20 avg",
    value: 3_126,
    cost: 3_036,
    pnl: 90,
    pnlPct: 2.96,
  },
  {
    id: "p-hormuz",
    title: "Strait of Hormuz blockade 2026",
    type: "Prediction",
    detail: "YES · 17¢ · 500 contracts",
    value: 85,
    cost: 90,
    pnl: -5,
    pnlPct: -5.56,
  },
  {
    id: "p-nvda",
    title: "Nvidia hits $4T market cap",
    type: "Prediction",
    detail: "YES · 49¢ · 300 contracts",
    value: 147,
    cost: 132,
    pnl: 15,
    pnlPct: 11.36,
  },
  {
    id: "p-gd",
    title: "General Dynamics",
    type: "Equity",
    detail: "10 shares @ $290.50 avg",
    value: 2_981,
    cost: 2_905,
    pnl: 76,
    pnlPct: 2.62,
  },
];

/* ---------- Recent activity ---------- */

export interface Activity {
  id: string;
  kind: "Bought" | "Sold" | "Hedged" | "Deposit" | "Settled";
  title: string;
  detail: string;
  amount: number; // signed cash flow
  time: string; // relative label
}

export const activity: Activity[] = [
  { id: "a1", kind: "Hedged", title: "Long Lockheed Martin, hedge midterms", detail: "Added NO Republicans win House · 57%", amount: -1500, time: "12m ago" },
  { id: "a2", kind: "Bought", title: "Lockheed Martin", detail: "4 shares @ $471.20", amount: -1884.8, time: "1h ago" },
  { id: "a3", kind: "Sold", title: "Fed cuts rates in July 2026", detail: "YES · 80 contracts @ 38¢", amount: 304, time: "3h ago" },
  { id: "a4", kind: "Bought", title: "Nvidia hits $4T market cap", detail: "YES · 300 contracts @ 44¢", amount: -1320, time: "5h ago" },
  { id: "a5", kind: "Settled", title: "Q1 2026 jobs report beats expectations", detail: "YES resolved · 200 contracts", amount: 412, time: "Yesterday" },
  { id: "a6", kind: "Bought", title: "ZIM Integrated", detail: "240 shares @ $20.90 avg", amount: -5016, time: "Yesterday" },
  { id: "a7", kind: "Deposit", title: "Deposit", detail: "ACH transfer", amount: 10000, time: "2d ago" },
  { id: "a8", kind: "Settled", title: "US government shutdown by March 2026", detail: "NO resolved · 150 contracts", amount: -90, time: "3d ago" },
];

/* ---------- Watchlist ---------- */

export interface WatchItem {
  id: string;
  label: string;
  sub: string;
  kind: "Stock" | "Market";
  valueLabel: string; // price or implied %
  change: number; // % for stocks, pts for markets
  direction: Direction;
}

export const watchlist: WatchItem[] = [
  { id: "w1", label: "NOC", sub: "Northrop Grumman", kind: "Stock", valueLabel: "$511.20", change: 1.5, direction: "up" },
  { id: "w2", label: "OpenAI GPT-6", sub: "Tech · Prediction", kind: "Market", valueLabel: "47%", change: 6, direction: "up" },
  { id: "w3", label: "PFE", sub: "Pfizer", kind: "Stock", valueLabel: "$28.60", change: -0.6, direction: "down" },
  { id: "w4", label: "Brent above $100", sub: "Energy · Prediction", kind: "Market", valueLabel: "34%", change: 2, direction: "up" },
  { id: "w5", label: "RTX", sub: "RTX Corp", kind: "Stock", valueLabel: "$118.40", change: 0.8, direction: "up" },
  { id: "w6", label: "Fed decision (next)", sub: "Macro · Prediction", kind: "Market", valueLabel: "62%", change: 3, direction: "up" },
  { id: "w7", label: "Defense budget > $900B", sub: "Politics · Prediction", kind: "Market", valueLabel: "55%", change: 1, direction: "up" },
];

/* ---------- Open (resting) orders ---------- */

export interface OpenOrder {
  id: string;
  market: string;
  side: "Buy" | "Sell";
  outcome: string;
  price: string;
  qty: number;
  filledPct: number;
}

export const openOrders: OpenOrder[] = [
  { id: "o1", market: "Republicans win 2026 midterms", side: "Buy", outcome: "NO", price: "55¢", qty: 300, filledPct: 40 },
  { id: "o2", market: "Lockheed Martin", side: "Buy", outcome: "LMT", price: "$465.00", qty: 10, filledPct: 0 },
  { id: "o3", market: "Bitcoin above $100k 2026", side: "Sell", outcome: "YES", price: "58¢", qty: 200, filledPct: 65 },
  { id: "o4", market: "US recession 2026", side: "Buy", outcome: "NO", price: "70¢", qty: 150, filledPct: 0 },
  { id: "o5", market: "ZIM Integrated", side: "Sell", outcome: "ZIM", price: "$24.00", qty: 120, filledPct: 0 },
];

/* ---------- Platform breakdown ---------- */

export interface PlatformBreakdown {
  platform: string;
  kind: string;
  value: number;
  pnl: number;
  pnlPct: number;
  color: string;
  /** number of underlying positions in this group (cash omits) */
  count?: number;
  /** position-type filter key this group maps to ("Cash" is not filterable) */
  key?: "Combined" | "Equity" | "Prediction" | "Cash";
}

export const platformBreakdown: PlatformBreakdown[] = [
  { platform: "Alpaca", kind: "Stocks & Options", value: 85_310, pnl: 1_050.2, pnlPct: 1.25, color: "#0a0a0a" },
  { platform: "Polymarket", kind: "Prediction Markets", value: 1_230, pnl: 234, pnlPct: 23.5, color: "#555555" },
  { platform: "Cash", kind: "Available Balance", value: 42_000.32, pnl: 0, pnlPct: 0, color: "#a3a3a3" },
];

/** Cents helpers for the prediction-market pricing convention. */
export function yesCents(prob: number): number {
  return Math.round(prob * 100);
}
export function noCents(prob: number): number {
  return 100 - Math.round(prob * 100);
}

/* ---------- P&L by timeframe (account header chart) ---------- */

export interface TimeframePnl {
  change: number;
  pct: number;
  series: PortfolioPoint[];
}

const toPts = (arr: number[]): PortfolioPoint[] =>
  arr.map((value, i) => ({ t: `P${i + 1}`, value }));

export const timeframeOrder = ["1D", "1W", "1M", "YTD", "ALL"] as const;

export const pnlTimeframes: Record<string, TimeframePnl> = {
  "1D": {
    change: 1284.2,
    pct: 1.01,
    series: toPts([
      127256, 127400, 127320, 127600, 127540, 127880, 127760, 128100, 128020,
      128340, 128460, 128540,
    ]),
  },
  "1W": {
    change: 3400,
    pct: 2.72,
    series: toPts([125140, 125600, 124980, 126200, 126800, 127400, 128540]),
  },
  "1M": {
    change: 10120,
    pct: 8.54,
    series: portfolioSeries,
  },
  YTD: {
    change: 22540,
    pct: 21.3,
    series: toPts([
      106000, 108500, 107200, 111000, 113500, 116000, 119500, 121000, 124000,
      125500, 127000, 128540,
    ]),
  },
  ALL: {
    change: 48540,
    pct: 60.7,
    series: toPts([
      80000, 84000, 82000, 90000, 95000, 101000, 107000, 112000, 118000,
      123000, 126000, 128540,
    ]),
  },
};
