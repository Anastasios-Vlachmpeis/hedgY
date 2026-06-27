// Client-safe chart timeframe contract. Lives apart from lib/server/marketData
// (which holds the Alpaca secret) so client components can import these runtime
// values without bundling any server-only code.

export type Timeframe = "5Min" | "30Min" | "1Hour" | "1Day";

export interface Candle {
  time: number; // UTC epoch seconds, floored to the timeframe boundary
  open: number;
  high: number;
  low: number;
  close: number;
}

export const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: "5Min", label: "5m" },
  { id: "30Min", label: "30m" },
  { id: "1Hour", label: "1h" },
  { id: "1Day", label: "1d" },
];

export const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  "5Min": 300,
  "30Min": 1_800,
  "1Hour": 3_600,
  "1Day": 86_400,
};

/** How far back to request history per timeframe (enough bars to look full). */
export const TIMEFRAME_LOOKBACK_DAYS: Record<Timeframe, number> = {
  "5Min": 4,
  "30Min": 10,
  "1Hour": 21,
  "1Day": 200,
};

export function isTimeframe(v: string | undefined): v is Timeframe {
  return v === "5Min" || v === "30Min" || v === "1Hour" || v === "1Day";
}
