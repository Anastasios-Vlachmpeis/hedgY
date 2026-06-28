export type Timeframe = "5Min" | "30Min" | "1Hour" | "1Day";

export interface Candle {
  time: number;
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

export const TIMEFRAME_LOOKBACK_DAYS: Record<Timeframe, number> = {
  "5Min": 4,
  "30Min": 10,
  "1Hour": 21,
  "1Day": 200,
};

export function isTimeframe(v: string | undefined): v is Timeframe {
  return v === "5Min" || v === "30Min" || v === "1Hour" || v === "1Day";
}
