"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { BookLevel, OrderBook as Book } from "@/lib/terminalMock";

/** A single depth row with a proportional background bar. */
function Row({
  level,
  side,
  max,
}: {
  level: BookLevel;
  side: "ask" | "bid";
  max: number;
}) {
  const w = Math.min(100, (level.total / max) * 100);
  const isAsk = side === "ask";
  return (
    <div className="relative grid grid-cols-3 px-3 py-[3px] text-[11px] tabular-nums">
      <span
        className={cn(
          "absolute inset-y-0 right-0",
          isAsk ? "bg-[#cf8a6e]/12" : "bg-[#9bb37e]/12",
        )}
        style={{ width: `${w}%` }}
        aria-hidden
      />
      <span className={cn("relative z-10", isAsk ? "text-[#cf8a6e]" : "text-[#9bb37e]")}>
        {level.price.toFixed(3)}
      </span>
      <span className="relative z-10 text-right text-[#cfc6b5]">
        {level.amount.toFixed(2)}
      </span>
      <span className="relative z-10 text-right text-[#a99e85]">
        {level.total.toFixed(2)}
      </span>
    </div>
  );
}

/**
 * Mock order book (depth ladder) styled like a pro terminal: red asks on top,
 * the spread in the middle, green bids below. The Buy/Sell tabs are presentational
 * (no order is placed here — equity trading lives in the trade modal elsewhere).
 */
function OrderBook({ book }: { book: Book }) {
  const [side, setSide] = React.useState<"buy" | "sell">("buy");
  const max = Math.max(
    book.asks[book.asks.length - 1]?.total ?? 1,
    book.bids[book.bids.length - 1]?.total ?? 1,
  );
  const mid =
    ((book.asks[0]?.price ?? 0) + (book.bids[0]?.price ?? 0)) / 2;

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-white/10 bg-white/[0.02] p-3">
      {/* Buy / Sell */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={cn(
            "rounded-[10px] py-2.5 text-[14px] font-semibold transition-colors",
            side === "buy"
              ? "bg-[#9bb37e] text-[#0c0a07]"
              : "bg-[#9bb37e]/10 text-[#9bb37e] hover:bg-[#9bb37e]/20",
          )}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={cn(
            "rounded-[10px] py-2.5 text-[14px] font-semibold transition-colors",
            side === "sell"
              ? "bg-[#cf8a6e] text-[#0c0a07]"
              : "bg-[#cf8a6e]/10 text-[#cf8a6e] hover:bg-[#cf8a6e]/20",
          )}
        >
          Sell
        </button>
      </div>

      {/* Ladder */}
      <div className="overflow-hidden rounded-[12px] border border-white/[0.06] bg-black/40">
        <div className="eyebrow grid grid-cols-3 px-3 py-2 text-[9px] text-[#6b624f]">
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Total</span>
        </div>

        <div>
          {[...book.asks].reverse().map((l) => (
            <Row key={`a-${l.price}`} level={l} side="ask" max={max} />
          ))}
        </div>

        <div className="flex items-center justify-between bg-white/[0.04] px-3 py-1.5 text-[11px] tabular-nums">
          <span className="font-semibold text-white">{mid.toFixed(3)}</span>
          <span className="text-[#6b624f]">
            Spread {book.spread.toFixed(3)} · {book.spreadPct.toFixed(3)}%
          </span>
        </div>

        <div>
          {book.bids.map((l) => (
            <Row key={`b-${l.price}`} level={l} side="bid" max={max} />
          ))}
        </div>
      </div>
    </div>
  );
}

export { OrderBook };
