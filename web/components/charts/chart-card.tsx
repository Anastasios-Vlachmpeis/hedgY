"use client";

import * as React from "react";

import { PriceChart, type Live } from "@/components/charts/price-chart";
import type { Candle, Timeframe } from "@/lib/timeframes";

/**
 * Client wrapper around PriceChart: owns the live-stream status and the ticking
 * last price / change so the header updates in real time as trades arrive.
 */
function ChartCard({
  candles,
  symbol,
  timeframe,
  streamable,
}: {
  candles: Candle[];
  symbol: string;
  timeframe: Timeframe;
  streamable: boolean;
}) {
  const first = candles[0];
  const lastClose = candles[candles.length - 1]?.close ?? 0;

  const [live, setLive] = React.useState<Live>("off");
  const [price, setPrice] = React.useState(lastClose);

  const handleLiveChange = React.useCallback(
    (state: Live, lastPrice?: number) => {
      setLive(state);
      if (lastPrice != null) setPrice(lastPrice);
    },
    [],
  );

  const changePct = first ? ((price - first.open) / first.open) * 100 : 0;
  const up = changePct >= 0;

  return (
    <div className="rounded-2xl border border-[#ececec] bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-center gap-2 text-[18px] font-semibold tabular-nums text-[#181925]">
          {symbol}
          <span className="text-[#a3a3a3]">
            $
            {price.toLocaleString(undefined, {
              maximumFractionDigits: price < 10 ? 4 : 2,
            })}
          </span>
          <LiveDot state={live} />
        </div>
        <div
          className={
            "text-[14px] font-medium tabular-nums " +
            (up ? "text-[#16a34a]" : "text-[#dc2626]")
          }
        >
          {up ? "+" : ""}
          {changePct.toFixed(2)}%{" "}
          <span className="text-[#a3a3a3]">· {candles.length} bars</span>
        </div>
      </div>

      <PriceChart
        candles={candles}
        symbol={symbol}
        timeframe={timeframe}
        streamable={streamable}
        onLiveChange={handleLiveChange}
      />
    </div>
  );
}

function LiveDot({ state }: { state: Live }) {
  if (state === "off") return null;
  const isLive = state === "live";
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium">
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16a34a] opacity-60" />
        )}
        <span
          className={
            "relative inline-flex h-2 w-2 rounded-full " +
            (isLive ? "bg-[#16a34a]" : "bg-[#f59e0b]")
          }
        />
      </span>
      <span className={isLive ? "text-[#16a34a]" : "text-[#a3a3a3]"}>
        {isLive ? "LIVE" : "connecting…"}
      </span>
    </span>
  );
}

export { ChartCard };
