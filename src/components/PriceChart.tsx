import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import {
  type Candle,
  type Timeframe,
  TIMEFRAME_SECONDS,
} from "../lib/timeframes";

export type Live = "off" | "connecting" | "live";

export function PriceChart({
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart: IChartApi = createChart(el, {
      width: el.clientWidth,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255,255,255,0.55)",
        fontFamily: "inherit",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
      timeScale: {
        borderColor: "rgba(255,255,255,0.1)",
        timeVisible: timeframe !== "1Day",
        secondsVisible: false,
      },
      crosshair: { mode: 0 },
    });

    const series: ISeriesApi<"Candlestick"> = chart.addSeries(CandlestickSeries, {
      upColor: "#2bd96b",
      downColor: "#f87171",
      wickUpColor: "#2bd96b",
      wickDownColor: "#f87171",
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
        if (bucket < curTime) return;

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
