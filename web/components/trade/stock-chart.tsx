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

const STATS = [
  { label: "Open",    value: "$453.20" },
  { label: "High",    value: "$474.80" },
  { label: "Low",     value: "$451.40" },
  { label: "Volume",  value: "1.24M"   },
  { label: "Mkt Cap", value: "$62.1B"  },
];

export function StockChart() {
  const [tf, setTf] = React.useState<typeof TFS[number]>("1M");
  const [side, setSide] = React.useState<"buy" | "sell">("buy");

  const current = SERIES[SERIES.length - 1].v;
  const first   = SERIES[0].v;
  const diff    = current - first;
  const diffPct = (diff / first) * 100;

  return (
    <div className="flex h-full min-h-[540px] flex-col rounded-[18px] bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

      {/* ── Company header + Buy/Sell ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Logo placeholder */}
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-[#f5f7fa] text-[22px]">
            🛡️
          </div>
          <div>
            <h2 className="text-[24px] font-semibold leading-tight text-[#111111]">Lockheed Martin</h2>
            <p className="mt-[4px] text-[15px] text-[#6B7280]">LMT · NYSE</p>
          </div>
        </div>

        {/* Buy / Sell */}
        <div className="flex items-center overflow-hidden rounded-[10px] border border-[#ececec]">
          <button
            type="button"
            onClick={() => setSide("buy")}
            className={cn(
              "px-5 py-2 text-[13px] font-medium transition-all duration-[200ms] ease-out",
              side === "buy"
                ? "bg-[#f0fdf4] text-[#16a34a]"
                : "bg-white text-[#9ca3af] hover:text-[#6B7280]",
            )}
          >
            Buy
          </button>
          <div className="w-px self-stretch bg-[#ececec]" />
          <button
            type="button"
            onClick={() => setSide("sell")}
            className={cn(
              "px-5 py-2 text-[13px] font-medium transition-all duration-[200ms] ease-out",
              side === "sell"
                ? "bg-[#fef2f2] text-[#ef4444]"
                : "bg-white text-[#9ca3af] hover:text-[#6B7280]",
            )}
          >
            Sell
          </button>
        </div>
      </div>

      {/* ── Price ── */}
      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-[46px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-[#111111]">
          ${current.toFixed(2)}
        </span>
        <span className="text-[14px] font-medium tabular-nums text-[#16a34a]">
          +{diff.toFixed(2)} (+{diffPct.toFixed(2)}%)
        </span>
      </div>

      {/* ── Segmented time selector ── */}
      <div className="mt-5">
        <div className="inline-flex items-center rounded-[10px] border border-[#ececec] bg-[#f5f5f5] p-[3px]">
          {TFS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTf(t)}
              className={cn(
                "h-[28px] min-w-[36px] rounded-[7px] px-3 text-[12px] font-medium transition-all duration-[200ms] ease-out",
                t === tf
                  ? "bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "text-[#6B7280] hover:text-[#111111]",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="mt-5 min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SERIES} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="lmtGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#16a34a" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f0f0f0" strokeOpacity={0.7} />
            <XAxis
              dataKey="t"
              tick={{ fontSize: 10, fill: "#d1d5db" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              domain={["dataMin - 4", "dataMax + 4"]}
              tick={{ fontSize: 10, fill: "#d1d5db" }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #ececec",
                borderRadius: 8,
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, "LMT"]}
              labelStyle={{ color: "#9ca3af", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#16a34a"
              strokeWidth={1.5}
              fill="url(#lmtGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bottom statistics ── */}
      <div className="mt-5 grid grid-cols-5 border-t border-[#f5f5f5] pt-5">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#9ca3af]">
              {s.label}
            </span>
            <span className="text-[17px] font-semibold tabular-nums text-[#111111]">
              {s.value}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
