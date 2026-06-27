/**
 * Mock fixtures for the markets "trading terminal" surface — the order book and
 * the company-financials mini charts. These are illustrative only (no backend);
 * the chart candles and prediction-market trading are wired to real data/flows.
 */

/* ---------- Order book (depth ladder) ---------- */

export interface BookLevel {
  price: number;
  amount: number; // size at this level
  total: number; // cumulative size (drives the depth bar width)
}

export interface OrderBook {
  asks: BookLevel[]; // ascending price (rendered top→down, reversed)
  bids: BookLevel[]; // descending price
  spread: number;
  spreadPct: number;
}

// Deterministic ladder around a reference price (no Math.random → stable SSR).
function buildSide(
  ref: number,
  step: number,
  dir: 1 | -1,
  rows: number,
): BookLevel[] {
  let total = 0;
  return Array.from({ length: rows }, (_, i) => {
    const price = +(ref + dir * step * (i + 1)).toFixed(3);
    const amount = +(280 - i * 18 + ((i * 37) % 60)).toFixed(2);
    total = +(total + amount).toFixed(2);
    return { price, amount, total };
  });
}

const REF = 73.642;
export const orderBook: OrderBook = {
  asks: buildSide(REF, 0.003, 1, 10),
  bids: buildSide(REF, 0.003, -1, 10),
  spread: 0.001,
  spreadPct: 0.001,
};

/* ---------- Company financials (mini charts) ---------- */

export interface BarPoint {
  label: string;
  [series: string]: number | string;
}

export interface FinancialsBlock {
  revenue: BarPoint[];
  debt: BarPoint[];
  performance: BarPoint[];
}

// Two cadences so the Annual / Quarterly toggle has something to switch to.
export const financials: Record<"Annual" | "Quarterly", FinancialsBlock> = {
  Annual: {
    revenue: [
      { label: "Revenue", value: 134 },
      { label: "COGS", value: -52 },
      { label: "Gross", value: 82 },
      { label: "OpEx", value: -34 },
      { label: "Op income", value: 48 },
      { label: "Tax & other", value: -11 },
      { label: "Net income", value: 37 },
    ],
    debt: [
      { label: "2021", debt: 18, cash: 22, equiv: 9 },
      { label: "2022", debt: 24, cash: 19, equiv: 12 },
      { label: "2023", debt: 31, cash: 27, equiv: 14 },
      { label: "2024", debt: 44, cash: 33, equiv: 21 },
      { label: "2025", debt: 39, cash: 41, equiv: 26 },
    ],
    performance: [
      { label: "2021", revenue: 92, net: 18, margin: 12 },
      { label: "2022", revenue: 104, net: 22, margin: 21 },
      { label: "2023", revenue: 118, net: 27, margin: 24 },
      { label: "2024", revenue: 126, net: 31, margin: 38 },
      { label: "2025", revenue: 134, net: 37, margin: 44 },
    ],
  },
  Quarterly: {
    revenue: [
      { label: "Revenue", value: 36 },
      { label: "COGS", value: -14 },
      { label: "Gross", value: 22 },
      { label: "OpEx", value: -9 },
      { label: "Op income", value: 13 },
      { label: "Tax & other", value: -3 },
      { label: "Net income", value: 10 },
    ],
    debt: [
      { label: "Q1", debt: 40, cash: 35, equiv: 22 },
      { label: "Q2", debt: 42, cash: 37, equiv: 24 },
      { label: "Q3", debt: 41, cash: 39, equiv: 25 },
      { label: "Q4", debt: 39, cash: 41, equiv: 26 },
    ],
    performance: [
      { label: "Q1", revenue: 31, net: 8, margin: 26 },
      { label: "Q2", revenue: 33, net: 9, margin: 30 },
      { label: "Q3", revenue: 34, net: 9, margin: 27 },
      { label: "Q4", revenue: 36, net: 10, margin: 44 },
    ],
  },
};
