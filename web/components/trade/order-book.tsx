import * as React from "react";
import { cn } from "@/lib/utils";

const ASKS = [
  { price: 472.85, size: 120,  total: "56.7K" },
  { price: 472.80, size: 45,   total: "21.3K" },
  { price: 472.75, size: 200,  total: "94.6K" },
  { price: 472.70, size: 78,   total: "36.9K" },
  { price: 472.65, size: 300,  total: "141.8K" },
  { price: 472.60, size: 55,   total: "26.0K" },
  { price: 472.55, size: 180,  total: "85.1K" },
  { price: 472.50, size: 92,   total: "43.5K" },
  { price: 472.45, size: 240,  total: "113.4K" },
  { price: 472.40, size: 60,   total: "28.3K" },
].reverse();

const BIDS = [
  { price: 472.30, size: 150,  total: "70.8K" },
  { price: 472.25, size: 88,   total: "41.6K" },
  { price: 472.20, size: 320,  total: "151.1K" },
  { price: 472.15, size: 67,   total: "31.6K" },
  { price: 472.10, size: 200,  total: "94.4K" },
  { price: 472.05, size: 110,  total: "51.9K" },
  { price: 472.00, size: 450,  total: "212.4K" },
  { price: 471.95, size: 73,   total: "34.5K" },
  { price: 471.90, size: 280,  total: "132.1K" },
  { price: 471.85, size: 95,   total: "44.8K" },
];

const MAX_SIZE = Math.max(...ASKS.map((a) => a.size), ...BIDS.map((b) => b.size));

function Row({
  price, size, total, side,
}: {
  price: number; size: number; total: string; side: "ask" | "bid";
}) {
  const isAsk = side === "ask";
  const barW = Math.round((size / MAX_SIZE) * 100);
  return (
    <div className="relative flex items-center gap-1 py-[3.5px] text-[11.5px] tabular-nums">
      <div
        className={cn("absolute right-0 top-0 h-full rounded-[2px]", isAsk ? "bg-red-50" : "bg-green-50")}
        style={{ width: `${barW}%` }}
      />
      <span className={cn("relative w-[36%] font-medium", isAsk ? "text-[#dc2626]" : "text-[#16a34a]")}>
        {price.toFixed(2)}
      </span>
      <span className="relative w-[32%] text-center text-[#181925]">{size}</span>
      <span className="relative w-[32%] text-right text-[#a3a3a3]">{total}</span>
    </div>
  );
}

export function OrderBook() {
  return (
    <div className="flex h-full flex-col rounded-[14px] border border-[#181925] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        Order Book · LMT
      </p>

      {/* Column heads */}
      <div className="mb-1 flex text-[10px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        <span className="w-[36%]">Price (USD)</span>
        <span className="w-[32%] text-center">Shares</span>
        <span className="w-[32%] text-right">Total</span>
      </div>

      {/* Asks */}
      <div className="flex flex-col">
        {ASKS.map((a) => <Row key={a.price} {...a} side="ask" />)}
      </div>

      {/* Spread / current price */}
      <div className="my-2 flex items-center justify-between rounded-[6px] bg-[#f0fdf4] px-2.5 py-1.5">
        <span className="text-[14px] font-bold tabular-nums text-[#16a34a]">$472.30 ↑</span>
        <span className="text-[11px] font-medium text-[#16a34a]">+1.20%</span>
      </div>

      {/* Bids */}
      <div className="flex flex-col">
        {BIDS.map((b) => <Row key={b.price} {...b} side="bid" />)}
      </div>

      {/* B/S bar */}
      <div className="mt-3 flex items-center gap-2 border-t border-[#f0f0f0] pt-2.5">
        <span className="text-[11px] font-semibold text-[#16a34a]">B 62.6%</span>
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-[#fee2e2]">
          <div className="h-full rounded-full bg-[#16a34a]" style={{ width: "62.6%" }} />
        </div>
        <span className="text-[11px] font-semibold text-[#dc2626]">37.4% S</span>
      </div>
    </div>
  );
}
