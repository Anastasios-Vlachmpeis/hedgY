import * as React from "react";

import { cn } from "@/lib/utils";
import { usd, signedUsd, pct } from "@/lib/format";
import type { Position } from "@/lib/mockData";

const TYPE_CHIP: Record<Position["type"], string> = {
  Combined: "bg-[#f3f1ff] text-[#9580ff]",
  Equity: "bg-[#f5f5f5] text-[#666666]",
  Prediction: "bg-[#f5f5f5] text-[#666666]",
};

/** Bare list (column header + rows) — used inside the tabbed account table. */
function PositionsRows({ positions }: { positions: Position[] }) {
  return (
    <>
      <div className="hidden items-center gap-3 pb-1 text-[10px] uppercase tracking-wide text-[#a3a3a3] sm:flex">
        <span className="min-w-0 flex-1">Position</span>
        <span className="w-24 shrink-0 text-right">Value</span>
        <span className="w-28 shrink-0 text-right">P&amp;L</span>
      </div>
      <ul className="divide-y divide-[#f0f0f0]">
        {positions.map((p) => {
          const up = p.pnl >= 0;
          const pnlColor = up ? "text-[#16a34a]" : "text-[#dc2626]";
          return (
            <li key={p.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "shrink-0 rounded-[5px] px-1.5 py-0.5 text-[10px] font-medium",
                      TYPE_CHIP[p.type],
                    )}
                  >
                    {p.type}
                  </span>
                  <span className="truncate text-[13px] font-semibold text-[#181925]">
                    {p.title}
                  </span>
                </div>
                <p className="truncate text-[11px] text-[#a3a3a3]">{p.detail}</p>
              </div>

              <span className="hidden w-24 shrink-0 text-right text-[13px] font-semibold tabular-nums text-[#181925] sm:block">
                {usd(p.value, 0)}
              </span>

              <div className="w-28 shrink-0 text-right">
                <p className={cn("text-[13px] font-semibold tabular-nums", pnlColor)}>
                  {signedUsd(p.pnl, 0)}
                </p>
                <p className={cn("text-[11px] tabular-nums", pnlColor)}>
                  ({pct(p.pnlPct)})
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** Standalone card (kept for reuse). */
function PositionsTable({ positions }: { positions: Position[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          Positions
        </h2>
        <span className="text-[11px] tabular-nums text-[#a3a3a3]">
          {positions.length} open
        </span>
      </div>
      <PositionsRows positions={positions} />
    </section>
  );
}

export { PositionsTable, PositionsRows };
