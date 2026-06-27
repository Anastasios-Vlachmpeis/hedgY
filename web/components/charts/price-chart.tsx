"use client";

import * as React from "react";
import {
  createChart,
  CandlestickSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

import {
  type Candle,
  type Timeframe,
  TIMEFRAME_SECONDS,
} from "@/lib/timeframes";

type Live = "off" | "connecting" | "live";

/**
 * TradingView Lightweight Charts candlestick, fed by our own Alpaca data.
 * Renders the historical `candles`, then (when `streamable`) opens an SSE
 * connection to /api/stream and updates the forming candle in real time.
 */
function PriceChart({
  candles,
  symbol,
  timeframe,
  streamable,
  onLiveChange,
}: {
  candles: Candle[];
  symbol: string;
  timeframe: Timeframe;
  streamable: boolean;
  onLiveChange?: (state: Live, lastPrice?: number) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart: IChartApi = createChart(el, {
      width: el.clientWidth,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#666666",
        fontFamily: "inherit",
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      rightPriceScale: { borderColor: "#e5e5e5" },
      timeScale: {
        borderColor: "#e5e5e5",
        // Intraday timeframes benefit from showing the time, not just the date.
        timeVisible: timeframe !== "1Day",
        secondsVisible: false,
      },
      crosshair: { mode: 0 },
    });

    const series: ISeriesApi<"Candlestick"> = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
      borderVisible: false,
    });

    series.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
    chart.timeScale().fitContent();

    const onResize = () => chart.applyOptions({ width: el.clientWidth });
    window.addEventListener("resize", onResize);

    // ── Live streaming: bucket incoming trades onto the same timeframe grid ──
    const tfSec = TIMEFRAME_SECONDS[timeframe];
    const last = candles[candles.length - 1];
    let curTime = last ? last.time : 0;
    let cur = last
      ? { open: last.open, high: last.high, low: last.low, close: last.close }
      : { open: 0, high: 0, low: 0, close: 0 };

    let es: EventSource | null = null;
    if (streamable) {
      onLiveChange?.("connecting");
      es = new EventSource(`/api/stream?symbol=${encodeURIComponent(symbol)}`);

      es.onmessage = (ev) => {
        let msg: { type: string; price?: number; t?: number; message?: string };
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }

        if (msg.type === "status" && msg.message === "live") {
          onLiveChange?.("live");
          return;
        }
        if (msg.type === "error") {
          onLiveChange?.("off");
          es?.close();
          return;
        }
        if (msg.type !== "trade" || msg.price == null || msg.t == null) return;

        const price = msg.price;
        const bucket = Math.floor(msg.t / tfSec) * tfSec;
        if (bucket < curTime) return; // stale tick

        if (bucket === curTime) {
          cur = {
            open: cur.open,
            high: Math.max(cur.high, price),
            low: Math.min(cur.low, price),
            close: price,
          };
        } else {
          cur = { open: price, high: price, low: price, close: price };
          curTime = bucket;
        }
        series.update({ time: curTime as UTCTimestamp, ...cur });
        onLiveChange?.("live", price);
      };

      es.onerror = () => onLiveChange?.("connecting");
    } else {
      onLiveChange?.("off");
    }

    return () => {
      window.removeEventListener("resize", onResize);
      es?.close();
      chart.remove();
    };
  }, [candles, symbol, timeframe, streamable, onLiveChange]);

  return <div ref={containerRef} className="w-full" />;
}

export { PriceChart };
export type { Live };
