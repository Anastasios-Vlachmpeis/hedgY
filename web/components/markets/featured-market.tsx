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
import { OrderTicket, type OrderTicketData } from "@/components/trade/order-ticket";

/**
 * Hero market card. Left column is a live leaderboard of outcomes ranked by
 * implied probability; the right column plots one probability line per outcome.
 * Clicking an outcome opens the trade modal (buys its side at live odds).
 */
function FeaturedMarketCard({ market }: { market: FeaturedMarket }) {
  const [trade, setTrade] = React.useState<OrderTicketData | null>(null);
  return (
    <section className="glass overflow-hidden rounded-[18px]">
      <div className="flex flex-col gap-5 p-5 lg:flex-row">
        {/* Left — leaderboard (~44%) */}
        <div className="flex flex-col lg:w-[44%]">
          <div className="flex items-center gap-2">
            <span className="text-[16px] leading-none">{market.icon}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9580ff]">
              Featured · {market.category}
            </span>
            {market.live && (
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[#dc2626]">
                <span className="live-dot size-1.5 rounded-full bg-[#dc2626]" />
                Live
              </span>
            )}
          </div>

          <h2 className="mt-2.5 text-[21px] font-semibold leading-tight tracking-[-0.02em] text-[#181925]">
            {market.title}
          </h2>

          <div className="mt-4 flex flex-col gap-1.5">
            {market.outcomes.map((outcome, i) => (
              <button
                key={outcome.label}
                type="button"
                disabled={!outcome.marketId}
                onClick={() =>
                  outcome.marketId &&
                  setTrade({
                    kind: "prediction",
                    marketId: outcome.marketId,
                    question: outcome.label,
                    yes: outcome.pct / 100,
                    defaultSide: outcome.side ?? "YES",
                  })
                }
                className="group flex w-full items-center gap-2.5 rounded-[10px] border border-[#f0f0f0] px-3 py-2.5 text-[14px] transition-all hover:border-[#9580ff] hover:bg-[#f7f5ff] disabled:cursor-default disabled:hover:border-[#f0f0f0] disabled:hover:bg-transparent"
              >
                <span className="font-num w-4 shrink-0 text-[11px] tabular-nums text-[#c4c4cc]">
                  {i + 1}
                </span>
                <span className="size-2 shrink-0 rounded-full" style={{ background: outcome.color }} />
                <span className="min-w-0 flex-1 truncate text-left text-[#181925]">{outcome.label}</span>
                {outcome.marketId && (
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9580ff] opacity-0 transition-opacity group-hover:opacity-100">
                    Buy {outcome.side ?? "YES"}
                  </span>
                )}
                <span className="font-num shrink-0 text-[15px] font-semibold tabular-nums text-[#181925]">
                  {outcome.pct}%
                </span>
              </button>
            ))}
          </div>

          <p className="mt-4 text-[12px] text-[#a3a3a3]">
            Total volume <span className="font-num text-[#737373]">{usdCompact(market.volume)}</span>
          </p>
        </div>

        {/* Right — chart (~56%) */}
        <div className="flex flex-col rounded-[14px] bg-[#fbfbfd] p-3 lg:w-[56%]">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={market.series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#eeeef1" />
                <XAxis dataKey="t" hide />
                <YAxis domain={["dataMin - 3", "dataMax + 5"]} hide />
                <Tooltip
                  contentStyle={{
                    background: "#181925",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  }}
                  labelStyle={{ color: "#a3a3a3" }}
                  itemStyle={{ color: "#ffffff", fontFamily: "var(--font-num)" }}
                />
                {market.outcomes.map((outcome) => (
                  <Line
                    key={outcome.label}
                    type="monotone"
                    dataKey={outcome.label}
                    stroke={outcome.color}
                    strokeWidth={2.25}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1">
            {market.outcomes.map((outcome) => (
              <li key={outcome.label} className="flex items-center gap-1.5 text-[11px]">
                <span className="size-2 rounded-full" style={{ background: outcome.color }} />
                <span className="text-[#666666]">{outcome.label}</span>
                <span className="font-num font-medium tabular-nums text-[#181925]">{outcome.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <OrderTicket ticket={trade} onClose={() => setTrade(null)} />
    </section>
  );
}

export { FeaturedMarketCard };
