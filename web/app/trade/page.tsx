"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { StockChart } from "@/components/trade/stock-chart";

/* ── helpers ── */
function fmtVol(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/* ── Risk data ── */
const LMT_RISKS = [
  {
    id:          "midterms",
    icon:        "🏛️",
    event:       "Republicans win 2026 midterms",
    probability: 0.43,
    impact:      "bearish" as const,
    volume:      12_400_000,
    hedgeFrom:   "defense-election",
  },
  {
    id:          "defense-budget",
    icon:        "🛡️",
    event:       "US defense budget exceeds $900B",
    probability: 0.55,
    impact:      "bullish" as const,
    volume:      1_100_000,
    hedgeFrom:   "defense-election",
  },
  {
    id:          "hormuz",
    icon:        "⚓",
    event:       "Strait of Hormuz blockade 2026",
    probability: 0.17,
    impact:      "bearish" as const,
    volume:      900_000,
    hedgeFrom:   "shipping-hormuz",
  },
];

/* ── Single risk market row ── */
function RiskRow({ r }: { r: (typeof LMT_RISKS)[0] }) {
  const pct     = Math.round(r.probability * 100);
  const bearish = r.impact === "bearish";
  const yesCents = pct;
  const noCents  = 100 - pct;

  return (
    <div className="flex flex-col gap-2.5 py-4">
      {/* Line 1: icon + title + % + Hedge CTA */}
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0 text-[16px] leading-none">{r.icon}</span>
        <p className="flex-1 text-[13px] font-semibold leading-snug text-[#111111]">
          {r.event}
        </p>
        <span className={cn(
          "shrink-0 text-[15px] font-bold tabular-nums leading-none",
          bearish ? "text-[#dc2626]" : "text-[#16a34a]",
        )}>
          {pct}%
        </span>
        <Link
          href={`/structure?from=${r.hedgeFrom}`}
          className="shrink-0 text-[12px] font-semibold text-[#6B7280] transition-colors duration-[150ms] hover:text-[#111111]"
        >
          Hedge →
        </Link>
      </div>

      {/* Line 2: probability bar */}
      <div className="ml-[26px] h-[3px] w-full overflow-hidden rounded-full bg-[#f0f0f0]">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: bearish ? "#fca5a5" : "#86efac" }}
        />
      </div>

      {/* Line 3: prices + impact + volume */}
      <div className="ml-[26px] flex items-center gap-2 text-[11px]">
        <span className="font-semibold text-[#15803d]">Yes {yesCents}¢</span>
        <span className="text-[#d1d5db]">·</span>
        <span className="font-semibold text-[#b91c1c]">No {noCents}¢</span>
        <span className="text-[#d1d5db]">·</span>
        <span className={cn("font-medium", bearish ? "text-[#dc2626]" : "text-[#16a34a]")}>
          {bearish ? "↓ bearish" : "↑ bullish"}
        </span>
        <span className="ml-auto text-[#9ca3af]">{fmtVol(r.volume)}</span>
      </div>
    </div>
  );
}

/* ── Right panel: risk markets for LMT ── */
function RiskPanel() {
  return (
    <div className="flex h-full flex-col rounded-[18px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111111]">Markets affecting LMT</h3>
          <p className="mt-0.5 text-[12px] text-[#9ca3af]">Prediction markets correlated with your position</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#d97706]">
          <ShieldAlert className="size-2.5" /> 3
        </span>
      </div>

      {/* Market rows */}
      <div className="mt-2 flex flex-col divide-y divide-[#f5f5f5]">
        {LMT_RISKS.map((r) => (
          <RiskRow key={r.id} r={r} />
        ))}
      </div>

      {/* Panel CTA */}
      <Link
        href="/structure"
        className="mt-auto flex h-10 w-full shrink-0 items-center justify-between rounded-[10px] bg-[#171B3B] px-4 text-[13px] font-semibold text-white transition-opacity duration-[180ms] hover:opacity-90"
      >
        Hedge all 3 risks
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

/* ── Page ── */
export default function TradePage() {
  return (
    <div className="flex flex-col gap-6">
      {/* The whole product: stock + its risk markets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[58fr_42fr] lg:[&>*]:h-full">
        <StockChart />
        <RiskPanel />
      </div>
    </div>
  );
}
