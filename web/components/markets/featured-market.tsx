"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { usdCompact } from "@/lib/format";
import type { FeaturedMarket } from "@/lib/mockData";
import { TradeModal, type TradeParams } from "@/components/trade/trade-modal";

/**
 * Hero market card for the markets page. Left column carries the framing
 * (icon, category, title, outcome odds), the right column plots one probability
 * line per outcome. Clicking an outcome opens the trade modal (buys its YES).
 */
function FeaturedMarketCard({ market }: { market: FeaturedMarket }) {
  const [trade, setTrade] = React.useState<TradeParams | null>(null);
  return (
    <section className="rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left — info (~42%) */}
        <div className="flex flex-col lg:w-[42%]">
          <div className="flex items-center gap-2">
            <span className="text-[16px] leading-none">{market.icon}</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
              {market.category}
            </span>
            {market.live && (
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[#dc2626]">
                <span className="size-1.5 rounded-full bg-[#dc2626]" />
                Live
              </span>
            )}
          </div>

          <h2 className="mt-2 text-[20px] font-semibold leading-tight tracking-[-0.01em] text-[#181925]">
            {market.title}
          </h2>

          <div className="mt-3 flex flex-col gap-2">
            {market.outcomes.map((outcome) => (
              <button
                key={outcome.label}
                type="button"
                disabled={!outcome.marketId}
                onClick={() =>
                  outcome.marketId &&
                  setTrade({
                    kind: "prediction",
                    label: outcome.label,
                    price: outcome.pct / 100,
                    marketId: outcome.marketId,
                    side: outcome.side ?? "YES",
                  })
                }
                className="group flex w-full items-center gap-2 rounded-[8px] border border-[#ececec] px-3 py-2.5 text-[14px] transition-colors hover:border-[#9580ff] hover:bg-[#f5f5f5] disabled:cursor-default disabled:hover:border-[#ececec] disabled:hover:bg-transparent"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: outcome.color }}
                />
                <span className="text-[#181925]">{outcome.label}</span>
                {outcome.marketId && (
                  <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-[#9580ff] opacity-0 transition-opacity group-hover:opacity-100">
                    Buy {outcome.side ?? "YES"}
                  </span>
                )}
                <span className="font-semibold tabular-nums text-[#181925]">
                  {outcome.pct}%
                </span>
              </button>
            ))}
          </div>

          <p className="mt-3 text-[12px] text-[#a3a3a3]">
            Vol {usdCompact(market.volume)}
          </p>
        </div>

        {/* Right — chart (~58%) */}
        <div className="flex flex-col lg:w-[58%]">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={market.series}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="t" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #ececec",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                  labelStyle={{ color: "#a3a3a3" }}
                  itemStyle={{ color: "#181925" }}
                />
                {market.outcomes.map((outcome) => (
                  <Line
                    key={outcome.label}
                    type="monotone"
                    dataKey={outcome.label}
                    stroke={outcome.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {market.outcomes.map((outcome) => (
              <li
                key={outcome.label}
                className="flex items-center gap-1.5 text-[11px]"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: outcome.color }}
                />
                <span className="text-[#666666]">{outcome.label}</span>
                <span className="font-medium tabular-nums text-[#181925]">
                  {outcome.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <TradeModal params={trade} onClose={() => setTrade(null)} />
    </section>
  );
}

export { FeaturedMarketCard };
