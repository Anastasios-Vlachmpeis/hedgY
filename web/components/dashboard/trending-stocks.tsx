"use client";

import * as React from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";
import { pct } from "@/lib/format";
import type { Stock } from "@/lib/mockData";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-7 w-16">
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
    <section className="flex flex-col rounded-[12px] bg-[#f5f5f5] p-4">
      <h2 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
        Trending Stocks
      </h2>
      <ul className="divide-y divide-[#ececec]">
        {stocks.map((s) => {
          const up = s.direction !== "down";
          const color = up ? "#16a34a" : "#dc2626";
          return (
            <li key={s.symbol} className="flex items-center gap-3 py-2">
              <div className="w-24 shrink-0">
                <p className="text-[13px] font-semibold text-[#181925]">{s.symbol}</p>
                <p className="truncate text-[11px] text-[#a3a3a3]">{s.name}</p>
              </div>
              <Sparkline data={s.spark} color={color} />
              <div className="ml-auto text-right">
                <p className="font-mono text-[13px] font-semibold text-[#181925]">
                  {s.price.toFixed(2)}
                </p>
                <p
                  className={cn(
                    "font-mono text-[12px] font-medium",
                    up ? "text-[#16a34a]" : "text-[#dc2626]",
                  )}
                >
                  {pct(s.changePct)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { TrendingStocks };
