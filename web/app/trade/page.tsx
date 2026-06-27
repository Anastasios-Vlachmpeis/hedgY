"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

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

/* ── Polymarket-style semicircle gauge ── */
function GaugeArc({ pct, bearish }: { pct: number; bearish: boolean }) {
  const r = 17, cx = 21, cy = 21;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const color = bearish ? "#ef4444" : "#22c55e";
  return (
    <svg viewBox="0 0 42 25" className="w-[42px]">
      <path
        d={arc} fill="none" stroke="#f0f0f0"
        strokeWidth="3.5" strokeLinecap="round" pathLength={100}
      />
      <path
        d={arc} fill="none" stroke={color}
        strokeWidth="3.5" strokeLinecap="round"
        pathLength={100} strokeDasharray={`${pct} 100`}
      />
    </svg>
  );
}

/* ── Polymarket-style risk card ── */
function RiskCard({ r }: { r: (typeof LMT_RISKS)[0] }) {
  const pct     = Math.round(r.probability * 100);
  const bearish = r.impact === "bearish";

  return (
    <div className="rounded-[16px] border border-[#ececec] bg-white p-4">
      {/* Row 1: icon + title + gauge */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#f5f5f5] text-[20px] leading-none">
          {r.icon}
        </div>
        <p className="flex-1 text-[13px] font-semibold leading-snug text-[#0a0a0a]">
          {r.event}
        </p>
        {/* Gauge */}
        <div className="flex shrink-0 flex-col items-center gap-0.5">
          <GaugeArc pct={pct} bearish={bearish} />
          <span className="text-[11px] font-bold tabular-nums leading-none text-[#0a0a0a]">
            {pct}%
          </span>
          <span className="text-[9px] text-[#a3a3a3]">chance</span>
        </div>
      </div>

      {/* Row 2: YES / NO buttons */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-[10px] bg-[#dcfce7] py-[9px] text-[13px] font-semibold text-[#16a34a] transition-colors hover:bg-[#bbf7d0]"
        >
          Yes
        </button>
        <button
          type="button"
          className="flex-1 rounded-[10px] bg-[#fee2e2] py-[9px] text-[13px] font-semibold text-[#dc2626] transition-colors hover:bg-[#fecaca]"
        >
          No
        </button>
      </div>

      {/* Row 3: volume + hedge */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#a3a3a3]">
          {fmtVol(r.volume)} Vol.
        </span>
        <Link
          href={`/structure?from=${r.hedgeFrom}`}
          className="rounded-[10px] bg-[#f0f0f0] px-3 py-[3px] text-[11px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#e5e5e5]"
        >
          Hedge →
        </Link>
      </div>
    </div>
  );
}

/* ── Risk panel ── */
function RiskPanel() {
  return (
    <div className="flex flex-col gap-3">
      {/* Panel header */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h3 className="text-[13px] font-semibold text-[#0a0a0a]">Risk Markets</h3>
          <p className="text-[11px] text-[#a3a3a3]">Correlated with LMT</p>
        </div>
        <span className={cn(
          "flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5",
          "text-[10px] font-semibold text-[#d97706]",
        )}>
          <ShieldAlert className="size-2.5" /> 3
        </span>
      </div>

      {/* Cards */}
      {LMT_RISKS.map((r) => (
        <RiskCard key={r.id} r={r} />
      ))}
    </div>
  );
}

/* ── Stock context bar ── */
function StockBar() {
  return (
    <div className="flex items-center gap-4 rounded-[14px] bg-white px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f5f7fa] text-[16px]">
        🛡️
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[#0a0a0a]">Lockheed Martin</span>
          <span className="rounded-full bg-[#f5f5f5] px-2 py-[2px] text-[11px] font-medium text-[#737373]">
            LMT · NYSE
          </span>
        </div>
        <span className="text-[11px] text-[#a3a3a3]">Defense &amp; Aerospace</span>
      </div>
      <div className="ml-auto text-right">
        <p className="text-[18px] font-semibold tabular-nums leading-tight text-[#0a0a0a]">$507.40</p>
        <p className="text-[12px] font-medium text-[#16a34a]">+$2.38 (+0.47%) today</p>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function TradePage() {
  return (
    <div className="flex flex-col gap-5">
      <StockBar />
      {/* Chart gets 70%, risk panel gets 30% */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[70fr_30fr]">
        <StockChart />
        <RiskPanel />
      </div>
    </div>
  );
}
