import * as React from "react";

import { cn } from "@/lib/utils";
import type { OpenOrder } from "@/lib/mockData";

function OpenOrders({ orders }: { orders: OpenOrder[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          Open Orders
        </h2>
        <span className="text-[11px] tabular-nums text-[#a3a3a3]">
          {orders.length} resting
        </span>
      </div>
      <ul className="divide-y divide-[#f0f0f0]">
        {orders.map((o) => {
          const buy = o.side === "Buy";
          return (
            <li key={o.id} className="flex items-center gap-3 py-2.5">
              <span
                className={cn(
                  "shrink-0 rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold",
                  buy ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]",
                )}
              >
                {o.side}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#181925]">
                  {o.market}
                </p>
                <p className="truncate text-[11px] text-[#a3a3a3]">
                  {o.outcome} ·{" "}
                  {o.filledPct > 0 ? `${o.filledPct}% filled` : "Unfilled"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[13px] font-semibold tabular-nums text-[#181925]">
                  {o.price}
                </p>
                <p className="text-[11px] tabular-nums text-[#a3a3a3]">
                  {o.qty} qty
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium text-[#666666] transition-colors hover:bg-[#f5f5f5] hover:text-[#dc2626]"
              >
                Cancel
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { OpenOrders };
