import * as React from "react";

import { cn } from "@/lib/utils";
import { points, usdCompact } from "@/lib/format";
import { ActionButton } from "@/components/ui/action-button";
import type { PredictionMarket } from "@/lib/mockData";

function TrendingMarkets({ markets }: { markets: PredictionMarket[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        Trending Predictions
      </h2>
      <ul className="divide-y divide-[#f0f0f0]">
        {markets.map((m) => {
          const up = m.direction !== "down";
          const yes = Math.round(m.yesProbability * 100);
          const no = 100 - yes;
          return (
            <li key={m.id} className="py-2.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-medium leading-snug text-[#181925]">
                  {m.question}
                </p>
                <span className="shrink-0 text-[17px] font-semibold leading-none tabular-nums text-[#181925]">
                  {yes}%
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <ActionButton tone="yes" className="w-full">
                  Yes <span className="tabular-nums opacity-80">{yes}%</span>
                </ActionButton>
                <ActionButton tone="no" className="w-full">
                  No <span className="tabular-nums opacity-80">{no}%</span>
                </ActionButton>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-[#a3a3a3]">
                  {m.category} · Vol {usdCompact(m.volume)}
                </span>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    up ? "text-[#16a34a]" : "text-[#dc2626]",
                  )}
                >
                  {points(m.changePts)} 24h
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { TrendingMarkets };
