import Link from "next/link";

import { getPriceBars } from "@/lib/server/marketData";
import { ChartCard } from "@/components/charts/chart-card";
import { TIMEFRAMES, isTimeframe } from "@/lib/timeframes";

// Standalone demo (intentionally separate from the dashboard): real Alpaca bars
// rendered with TradingView's Lightweight Charts, plus a live trade stream.
// force-dynamic = fresh each load.
export const dynamic = "force-dynamic";

const SYMBOLS = [
  { symbol: "LMT", label: "Lockheed (LMT)" },
  { symbol: "RTX", label: "RTX" },
  { symbol: "NVDA", label: "Nvidia" },
  { symbol: "AAPL", label: "Apple" },
  { symbol: "BTC/USD", label: "Bitcoin" },
  { symbol: "ETH/USD", label: "Ethereum" },
];

export default async function ChartDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; tf?: string }>;
}) {
  const { symbol, tf } = await searchParams;
  const active = symbol ?? SYMBOLS[0].symbol;
  const timeframe = isTimeframe(tf) ? tf : "1Day";
  const bars = await getPriceBars(active, timeframe);

  const href = (s: string, t: string) =>
    `/chart-demo?symbol=${encodeURIComponent(s)}&tf=${t}`;

  return (
    <div className="mx-auto max-w-[920px] px-5 py-8">
      <div className="mb-1 flex items-center gap-3">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#181925]">
          Price chart demo
        </h1>
        <span
          className={
            "rounded-full px-2 py-0.5 text-[11px] font-medium " +
            (bars.live
              ? "bg-[#dcfce7] text-[#166534]"
              : "bg-[#f5f5f5] text-[#a3a3a3]")
          }
        >
          {bars.live ? "History · Alpaca" : "Synthetic fallback"}
        </span>
      </div>
      <p className="mb-5 text-[13px] text-[#666666]">
        Alpaca bars rendered with TradingView Lightweight Charts, with a live
        trade stream (crypto 24/7; equities during market hours).
        {!bars.live &&
          " (No Alpaca history — showing a synthesized series so the demo still renders.)"}
      </p>

      {/* Symbol picker */}
      <div className="mb-3 flex flex-wrap gap-2">
        {SYMBOLS.map((s) => {
          const isActive = s.symbol === active;
          return (
            <Link
              key={s.symbol}
              href={href(s.symbol, timeframe)}
              className={
                "rounded-full px-3.5 py-1.5 text-[13px] transition-colors " +
                (isActive
                  ? "bg-[#181925] font-medium text-white"
                  : "bg-[#f5f5f5] text-[#666666] hover:bg-[#ebebeb] hover:text-[#181925]")
              }
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {/* Timeframe toggle */}
      <div className="mb-5 inline-flex gap-1 rounded-full bg-[#f5f5f5] p-1">
        {TIMEFRAMES.map((t) => {
          const isActive = t.id === timeframe;
          return (
            <Link
              key={t.id}
              href={href(active, t.id)}
              className={
                "rounded-full px-3 py-1 text-[13px] tabular-nums transition-colors " +
                (isActive
                  ? "bg-white font-medium text-[#181925] shadow-sm"
                  : "text-[#666666] hover:text-[#181925]")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <ChartCard
        candles={bars.candles}
        symbol={active}
        timeframe={timeframe}
        streamable={bars.live}
      />
    </div>
  );
}
