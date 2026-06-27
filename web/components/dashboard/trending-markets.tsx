import * as React from "react";

import { cn } from "@/lib/utils";
import { points, usdCompact } from "@/lib/format";
import { ActionButton } from "@/components/ui/action-button";
import type { PredictionMarket } from "@/lib/mockData";

function TrendingMarkets({ markets }: { markets: PredictionMarket[] }) {
  return (
    <section className="flex h-full flex-col rounded-[12px] bg-[#f5f5f5] p-4">
      <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
        Trending Predictions
      </h2>
      <ul className="flex flex-col gap-1.5">
        {markets.map((m) => {
          const up = m.direction !== "down";
          const yes = Math.round(m.yesProbability * 100);
          const no = 100 - yes;
          return (
            <li key={m.id} className="rounded-[8px] bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-medium leading-snug text-[#181925]">
                  {m.question}
                </p>
                <span className="shrink-0 font-mono text-[17px] font-semibold leading-none text-[#181925]">
                  {yes}%
                </span>
              </div>

              {/* thin probability bar */}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#ececec]">
                <div
                  className="h-full rounded-full bg-[#9580ff]"
                  style={{ width: `${yes}%` }}
                />
              </div>

              {/* Yes / No buy buttons */}
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <ActionButton tone="yes" className="w-full">
                  Yes <span className="font-mono opacity-80">{yes}%</span>
                </ActionButton>
                <ActionButton tone="no" className="w-full">
                  No <span className="font-mono opacity-80">{no}%</span>
                </ActionButton>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-[#a3a3a3]">
                  {m.category} · Vol {usdCompact(m.volume)}
                </span>
                <span
                  className={cn(
                    "font-mono font-medium",
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
