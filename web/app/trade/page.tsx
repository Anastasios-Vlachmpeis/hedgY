"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { trendingStocks, trendingMarkets } from "@/lib/mockData";
import { StockChart } from "@/components/trade/stock-chart";
import { OrderBook } from "@/components/trade/order-book";
import { FinancialPanel } from "@/components/trade/financials";

/* ── Search bar ── */
function TradeSearch() {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#a3a3a3]" />
      <input
        type="text"
        placeholder="Search and discover — stocks, options, prediction markets…"
        className="h-11 w-full rounded-2xl border border-[#e8e8e8] bg-white/80 pl-11 pr-4 text-[14px] text-[#181925] placeholder:text-[#a3a3a3] shadow-[0_1px_4px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all focus:border-[#C5D3E6] focus:outline-none focus:ring-2 focus:ring-[#C5D3E6]/40"
      />
    </div>
  );
}

/* ── Stock cards — top-right 2×2 grid ── */
function StockCardsGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {trendingStocks.slice(0, 4).map((s) => {
        const down = s.direction === "down";
        return (
          <div
            key={s.symbol}
            className="cursor-pointer rounded-[12px] border border-[#181925] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.14)]"
          >
            <p className="text-[13px] font-semibold text-[#181925]">{s.symbol}</p>
            <p className="mt-0.5 truncate text-[11px] text-[#a3a3a3]">{s.name}</p>
            <p className="mt-2 text-[14px] font-semibold tabular-nums text-[#181925]">
              ${s.price.toFixed(2)}
            </p>
            <p className={cn("mt-0.5 text-[11px] tabular-nums font-medium", down ? "text-[#dc2626]" : "text-[#16a34a]")}>
              {down ? "" : "+"}{s.changePct.toFixed(1)}%
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Combine a product CTA ── */
function CombineCTA() {
  return (
    <Link
      href="/structure"
      className="group flex flex-col rounded-[12px] bg-[#181925] p-4 transition-opacity hover:opacity-90"
    >
      <span className="text-[22px]">🧩</span>
      <p className="mt-2 text-[15px] font-semibold text-white">Combine a product</p>
      <p className="mt-1 text-[12px] leading-relaxed text-white/60">
        Pair an equity with a prediction-market hedge in one position.
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#C5D3E6]">
        Build one <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}

/* ── Trending prediction markets panel ── */
function PredictionPanel() {
  return (
    <div className="flex flex-col gap-2 rounded-[14px] border border-[#181925] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        Trending markets
      </p>
      {trendingMarkets.map((m) => {
        const up = m.direction === "up";
        const yPct = Math.round(m.yesProbability * 100);
        const C = 2 * Math.PI * 14;
        return (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-[10px] border border-[#f0f0f0] p-2.5 transition-colors hover:bg-[#fafafa] cursor-pointer"
          >
            {/* Probability ring */}
            <div className="relative size-9 shrink-0">
              <svg viewBox="0 0 36 36" className="-rotate-90 h-full w-full">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f0f0f0" strokeWidth="3.5" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke={up ? "#16a34a" : "#dc2626"}
                  strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - yPct / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-bold tabular-nums text-[#181925]">{yPct}%</span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold leading-tight text-[#181925]">
                {m.question}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[#a3a3a3]">
                <span>{m.category}</span>
                <span className={cn("font-medium flex items-center gap-0.5", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
                  {up ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />}
                  {Math.abs(m.changePts)}pt 24h
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" className="rounded-[5px] bg-[#f0fdf4] px-2.5 py-0.5 text-[10px] font-semibold text-[#16a34a] hover:bg-[#dcfce7]">
                Yes
              </button>
              <button type="button" className="rounded-[5px] bg-[#fef2f2] px-2.5 py-0.5 text-[10px] font-semibold text-[#dc2626] hover:bg-[#fee2e2]">
                No
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Page ── */
export default function TradePage() {
  return (
    <div className="flex flex-col gap-4">
      <TradeSearch />

      {/* Row 1: chart (left 60%) + stock cards + combine CTA (right 40%) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_272px]">
        <div className="h-[340px]">
          <StockChart />
        </div>
        <div className="flex flex-col gap-3">
          <StockCardsGrid />
          <CombineCTA />
        </div>
      </div>

      {/* Row 2: order book | financials | prediction markets */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr_1fr]">
        <OrderBook />
        <FinancialPanel />
        <PredictionPanel />
      </div>
    </div>
  );
}
