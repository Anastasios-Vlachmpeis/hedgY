"use client";

import * as React from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";
import { pct } from "@/lib/format";
import { ActionButton } from "@/components/ui/action-button";
import type { Stock } from "@/lib/mockData";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-6 w-12 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendingStocks({ stocks }: { stocks: Stock[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        Trending Stocks
      </h2>
      <ul className="divide-y divide-[#f0f0f0]">
        {stocks.map((s) => {
          const up = s.direction !== "down";
          const color = up ? "#16a34a" : "#dc2626";
          return (
            <li key={s.symbol} className="flex items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-tight text-[#181925]">
                  {s.symbol}
                </p>
                <p className="truncate text-[11px] leading-tight text-[#a3a3a3]">
                  {s.name}
                </p>
              </div>
              <Sparkline data={s.spark} color={color} />
              <div className="shrink-0 text-right">
                <p className="text-[13px] font-semibold leading-tight tabular-nums text-[#181925]">
                  {s.price.toFixed(2)}
                </p>
                <p
                  className={cn(
                    "text-[11px] font-medium leading-tight tabular-nums",
                    up ? "text-[#16a34a]" : "text-[#dc2626]",
                  )}
                >
                  {pct(s.changePct)}
                </p>
              </div>
              <ActionButton tone="buy" className="shrink-0 px-2.5">
                Buy
              </ActionButton>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { TrendingStocks };
