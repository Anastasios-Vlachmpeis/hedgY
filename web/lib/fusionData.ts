/**
 * Extra fixtures for the FUSION surfaces — energy/commodity futures, the
 * synthetic "Fusion Index", and risk telemetry. Purely illustrative demo data.
 */

export interface EnergyInstrument {
  symbol: string;
  name: string;
  price: number;
  unit: string;
  changePct: number;
  spark: number[];
  tag: "Power" | "Fossil" | "Renewable" | "Carbon" | "Nuclear";
}

export const energyFutures: EnergyInstrument[] = [
  { symbol: "BRENT", name: "Brent Crude", price: 82.4, unit: "/bbl", changePct: 0.9, tag: "Fossil", spark: [80.1, 80.6, 80.2, 81.4, 81.0, 81.9, 82.0, 82.4] },
  { symbol: "WTI", name: "WTI Crude", price: 78.11, unit: "/bbl", changePct: 1.2, tag: "Fossil", spark: [76.4, 76.9, 76.5, 77.4, 77.1, 77.8, 78.0, 78.11] },
  { symbol: "NG", name: "Natural Gas", price: 2.84, unit: "/MMBtu", changePct: -2.1, tag: "Fossil", spark: [2.98, 2.95, 2.99, 2.9, 2.92, 2.86, 2.85, 2.84] },
  { symbol: "U3O8", name: "Uranium", price: 91.2, unit: "/lb", changePct: 3.4, tag: "Nuclear", spark: [86.0, 87.1, 86.5, 88.4, 88.0, 89.8, 90.4, 91.2] },
  { symbol: "EUA", name: "EU Carbon", price: 68.3, unit: "/t CO₂", changePct: -0.6, tag: "Carbon", spark: [69.2, 69.0, 69.3, 68.8, 68.9, 68.5, 68.4, 68.3] },
  { symbol: "PWR-DE", name: "German Power", price: 94.5, unit: "/MWh", changePct: 1.8, tag: "Power", spark: [90.1, 91.0, 90.4, 92.2, 91.9, 93.4, 94.0, 94.5] },
  { symbol: "SOLAR", name: "Solar Basket", price: 142.7, unit: "idx", changePct: 2.6, tag: "Renewable", spark: [136, 137.5, 136.8, 139, 138.4, 140.6, 141.8, 142.7] },
  { symbol: "LI", name: "Lithium", price: 14.2, unit: "k/t", changePct: -1.4, tag: "Renewable", spark: [14.7, 14.6, 14.65, 14.4, 14.45, 14.3, 14.25, 14.2] },
];

/** Synthetic flagship "Fusion Index" intraday series. */
export const fusionIndex = {
  value: 1284.6,
  changePct: 1.62,
  series: [
    1248, 1252, 1249, 1256, 1261, 1258, 1264, 1269, 1266, 1272, 1270, 1277,
    1281, 1278, 1283, 1280, 1285, 1289, 1286, 1284.6,
  ],
};

export interface RiskMetric {
  label: string;
  value: string;
  pct: number;
  tone: "good" | "warn" | "bad";
  hint: string;
}

export const riskMetrics: RiskMetric[] = [
  { label: "Hedge coverage", value: "73%", pct: 73, tone: "good", hint: "Share of equity exposure offset by prediction hedges" },
  { label: "Net beta", value: "0.62", pct: 62, tone: "good", hint: "Sensitivity to broad market vs fully unhedged" },
  { label: "Event risk (VaR 95%)", value: "$4.2k", pct: 34, tone: "warn", hint: "1-day value-at-risk across all venues" },
  { label: "Energy exposure", value: "21%", pct: 21, tone: "good", hint: "Portfolio weight in energy & commodities" },
  { label: "Liquidity score", value: "A−", pct: 88, tone: "good", hint: "Weighted venue depth of open positions" },
];

export interface MacroSignal {
  label: string;
  prob: number;
  delta: number;
  impact: "High" | "Med" | "Low";
}

export const macroSignals: MacroSignal[] = [
  { label: "Fed cuts in July", prob: 0.38, delta: 4, impact: "High" },
  { label: "US recession 2026", prob: 0.29, delta: 3, impact: "High" },
  { label: "Brent > $100 in 2026", prob: 0.34, delta: 2, impact: "Med" },
  { label: "Hormuz blockade", prob: 0.17, delta: 2, impact: "High" },
  { label: "OpenAI ships GPT-6", prob: 0.47, delta: 6, impact: "Med" },
];
