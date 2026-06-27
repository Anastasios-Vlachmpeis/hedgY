import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { pct } from "@/lib/format";
import type { Stock } from "@/lib/mockData";

/**
 * Right-hand rail for the markets page: a violet promo nudging users into the
 * structuring flow, stacked over a compact trending-stocks list. Read-only.
 */
function PromoRail({ stocks }: { stocks: Stock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Promo */}
      <div className="rounded-[14px] bg-gradient-to-br from-[#9580ff] to-[#7c3aed] p-5 text-white">
        <p className="text-[11px] font-medium uppercase tracking-wide text-white/70">
          Structuring
        </p>
        <h3 className="mt-1 text-[19px] font-semibold">
          Build a combined position
        </h3>
        <p className="mt-1 text-[13px] text-white/80">
          Pair an equity view with a prediction-market hedge — in one position.
        </p>
        <Link
          href="/structure"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-[#181925] hover:bg-white/90"
        >
          Build a position
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Trending stocks */}
      <div className="rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          Trending Stocks
        </p>
        <ul className="mt-2 divide-y divide-[#f0f0f0]">
          {stocks.slice(0, 4).map((stock) => {
            const down = stock.direction === "down";
            return (
              <li
                key={stock.symbol}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#181925]">
                    {stock.symbol}
                  </p>
                  <p className="truncate text-[11px] text-[#a3a3a3]">
                    {stock.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold tabular-nums text-[#181925]">
                    ${stock.price.toFixed(2)}
                  </p>
                  <p
                    className={`text-[11px] tabular-nums ${
                      down ? "text-[#dc2626]" : "text-[#16a34a]"
                    }`}
                  >
                    {pct(stock.changePct)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <Link
          href="/markets"
          className="mt-3 inline-flex items-center justify-center rounded-full bg-[#f5f5f5] px-4 py-2 text-[13px] font-medium text-[#181925] hover:bg-[#ececec]"
        >
          View all stocks
        </Link>
      </div>
    </div>
  );
}

export { PromoRail };
