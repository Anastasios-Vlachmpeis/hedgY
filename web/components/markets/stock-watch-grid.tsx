"use client";

import Link from "next/link";
import { Combine } from "lucide-react";

import { cn } from "@/lib/utils";
import { pct } from "@/lib/format";
import { useStructureOverlay } from "@/components/structure/structure-overlay";
import type { Stock } from "@/lib/mockData";

/** Tiny inline sparkline (no deps) drawn from a price series. */
function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  if (data.length < 2) data = [...data, ...data];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const w = 100;
  const h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = up ? "#9bb37e" : "#cf8a6e";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden
    >
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function StockTile({ stock, active }: { stock: Stock; active?: boolean }) {
  const down = stock.direction === "down";
  return (
    <Link
      href={`/markets?symbol=${encodeURIComponent(stock.symbol)}`}
      className={cn(
        "group flex flex-col gap-2 rounded-[14px] border bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]",
        active ? "border-[#c9aa6c]/40 ring-1 ring-[#c9aa6c]/30" : "border-white/10",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold leading-none text-[#f3ecdd]">
            {stock.symbol}
          </p>
          <p className="mt-1 truncate text-[11px] text-[#6b624f]">{stock.name}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
            down ? "bg-[#cf8a6e]/15 text-[#cf8a6e]" : "bg-[#9bb37e]/15 text-[#9bb37e]",
          )}
        >
          {pct(stock.changePct)}
        </span>
      </div>

      <Sparkline data={stock.spark} up={!down} />

      <p className="text-[15px] font-semibold tabular-nums text-[#f3ecdd]">
        ${stock.price.toFixed(2)}
      </p>
    </Link>
  );
}

/**
 * Right-rail watch grid for the terminal: a 2×2 of stock tiles (clicking one
 * loads it into the main chart) plus the "Combine a product" structuring entry.
 */
function StockWatchGrid({
  stocks,
  activeSymbol,
}: {
  stocks: Stock[];
  activeSymbol?: string;
}) {
  const { open } = useStructureOverlay();

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {stocks.slice(0, 4).map((s) => (
          <StockTile
            key={s.symbol}
            stock={s}
            active={s.symbol === activeSymbol}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => open()}
        className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#c9aa6c]/25 bg-[#c9aa6c]/[0.04] py-6 text-center transition-colors hover:bg-[#c9aa6c]/[0.08]"
      >
        <span className="text-[15px] font-semibold text-[#f3ecdd]">
          Combine a product
        </span>
        <Combine className="size-7 text-[#c9aa6c]" strokeWidth={1.8} />
      </button>
    </div>
  );
}

export { StockWatchGrid };
