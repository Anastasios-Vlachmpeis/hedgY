"use client";

import * as React from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

const SERIES = [
  { t: "May 28", v: 453.2 }, { t: "May 29", v: 455.6 },
  { t: "May 30", v: 454.1 }, { t: "Jun 2",  v: 458.3 },
  { t: "Jun 3",  v: 460.2 }, { t: "Jun 4",  v: 458.8 },
  { t: "Jun 5",  v: 462.4 }, { t: "Jun 6",  v: 461.7 },
  { t: "Jun 9",  v: 464.5 }, { t: "Jun 10", v: 463.2 },
  { t: "Jun 11", v: 466.8 }, { t: "Jun 12", v: 465.4 },
  { t: "Jun 13", v: 468.1 }, { t: "Jun 16", v: 467.3 },
  { t: "Jun 17", v: 469.5 }, { t: "Jun 18", v: 468.9 },
  { t: "Jun 19", v: 471.2 }, { t: "Jun 20", v: 470.4 },
  { t: "Jun 23", v: 472.8 }, { t: "Jun 24", v: 471.6 },
  { t: "Jun 25", v: 473.4 }, { t: "Jun 26", v: 472.1 },
  { t: "Jun 27", v: 472.3 },
];

const TFS = ["1H", "1D", "1W", "1M", "3M", "1Y"] as const;

export function StockChart() {
  const [tf, setTf] = React.useState<"1H" | "1D" | "1W" | "1M" | "3M" | "1Y">("1M");
  const [side, setSide] = React.useState<"buy" | "sell">("buy");

  const current = SERIES[SERIES.length - 1].v;
  const first = SERIES[0].v;
  const diff = current - first;
  const diffPct = (diff / first) * 100;

  return (
    <div className="flex h-full flex-col rounded-[14px] border border-[#181925] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#181925]">LMT</span>
            <span className="text-[11px] text-[#a3a3a3]">Lockheed Martin · NYSE</span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-[26px] font-semibold tabular-nums tracking-[-0.02em] text-[#181925]">
              ${current.toFixed(2)}
            </span>
            <span className="text-[13px] font-medium tabular-nums text-[#16a34a]">
              +{diff.toFixed(2)} (+{diffPct.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex overflow-hidden rounded-[10px] border border-[#e8e8e8]">
          <button
            type="button"
            onClick={() => setSide("buy")}
            className={cn(
              "px-5 py-2 text-[13px] font-semibold transition-colors",
              side === "buy" ? "bg-[#16a34a] text-white" : "bg-white text-[#737373] hover:bg-[#f5f5f5]",
            )}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide("sell")}
            className={cn(
              "px-5 py-2 text-[13px] font-semibold transition-colors",
              side === "sell" ? "bg-[#dc2626] text-white" : "bg-white text-[#737373] hover:bg-[#f5f5f5]",
            )}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Timeframes */}
      <div className="mb-3 flex items-center gap-0.5">
        {TFS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTf(t)}
            className={cn(
              "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
              t === tf
                ? "bg-[#C5D3E6] text-[#181925]"
                : "text-[#666666] hover:bg-[#C5D3E6]/50 hover:text-[#181925]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SERIES} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="lmtGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f5f5f5" />
            <XAxis
              dataKey="t"
              tick={{ fontSize: 10, fill: "#a3a3a3" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              domain={["dataMin - 4", "dataMax + 4"]}
              tick={{ fontSize: 10, fill: "#a3a3a3" }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #ececec",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, "LMT"]}
              labelStyle={{ color: "#a3a3a3" }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#16a34a"
              strokeWidth={2}
              fill="url(#lmtGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
