import * as React from "react";

import { cn } from "@/lib/utils";
import { pct, points } from "@/lib/format";
import type { WatchItem } from "@/lib/mockData";

function Watchlist({ items }: { items: WatchItem[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        Watchlist
      </h2>
      <ul className="divide-y divide-[#f0f0f0]">
        {items.map((w) => {
          const up = w.direction !== "down";
          return (
            <li key={w.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#181925]">
                  {w.label}
                </p>
                <p className="truncate text-[11px] text-[#a3a3a3]">{w.sub}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[13px] font-semibold tabular-nums text-[#181925]">
                  {w.valueLabel}
                </p>
                <p
                  className={cn(
                    "text-[11px] tabular-nums",
                    up ? "text-[#16a34a]" : "text-[#dc2626]",
                  )}
                >
                  {w.kind === "Stock" ? pct(w.change) : points(w.change)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { Watchlist };
