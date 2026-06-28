import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { pct } from "@/lib/format";
import { TradeButton } from "@/components/trade/trade-modal";
import type { Stock } from "@/lib/mockData";

/**
 * Right-hand rail for the markets terminal: the equities world (graphite) — a
 * compact live trending-stocks list with real Buy actions — stacked under a
 * violet nudge into the structuring flow.
 */
function PromoRail({ stocks }: { stocks: Stock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Trending stocks — equities identity */}
      <div className="glass rounded-[16px] p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#181925]">
            <span className="size-1.5 rounded-full bg-[#181925]" />
            Trending stocks
          </p>
          <span className="text-[10px] font-medium uppercase tracking-wide text-[#a3a3a3]">Equities</span>
        </div>

        <ul className="mt-3 flex flex-col">
          {stocks.slice(0, 5).map((stock) => {
            const down = stock.direction === "down";
            return (
              <li
                key={stock.symbol}
                className="group flex items-center justify-between gap-3 border-t border-[#f4f4f5] py-2.5 first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#181925]">{stock.symbol}</p>
                  <p className="truncate text-[11px] text-[#a3a3a3]">{stock.name}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <p className="font-num text-[13px] font-semibold tabular-nums text-[#181925]">
                      ${stock.price.toFixed(2)}
                    </p>
                    <p
                      className={cn(
                        "font-num flex items-center justify-end gap-0.5 text-[11px] tabular-nums",
                        down ? "text-[#dc2626]" : "text-[#16a34a]",
                      )}
                    >
                      {down ? (
                        <ArrowDownRight className="size-3" />
                      ) : (
                        <ArrowUpRight className="size-3" />
                      )}
                      {pct(stock.changePct)}
                    </p>
                  </div>
                  <TradeButton
                    kind="stock"
                    tone="buy"
                    label={stock.name}
                    symbol={stock.symbol}
                    price={stock.price}
                  >
                    Buy
                  </TradeButton>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Structuring nudge — the "one position" payoff */}
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#9580ff] to-[#7c3aed] p-5 text-white">
        <div
          className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-white/15 blur-2xl"
          aria-hidden
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Structuring</p>
        <h3 className="mt-1.5 text-[19px] font-semibold leading-tight tracking-[-0.01em]">
          Pair a stock with a hedge
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/80">
          Express an equity view and offset it with a prediction-market hedge — in one position.
        </p>
        <Link
          href="/structure"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#181925] transition-transform hover:-translate-y-0.5"
        >
          Build a position
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

export { PromoRail };
