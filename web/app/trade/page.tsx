"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, Zap, ArrowRight, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StockChart } from "@/components/trade/stock-chart";

/* ── helpers ── */
function fmtVol(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/* ── data ── */
const LMT_RISKS = [
  {
    id: "midterms",
    icon: "🏛️",
    event: "Republicans win 2026 midterms",
    probability: 0.43,
    impact: "bearish" as const,
    volume: 12_400_000,
    hedgeFrom: "defense-election",
    recommended: true,
  },
  {
    id: "defense-budget",
    icon: "🛡️",
    event: "US defense budget exceeds $900B",
    probability: 0.55,
    impact: "bullish" as const,
    volume: 1_100_000,
    hedgeFrom: "defense-election",
    recommended: false,
  },
  {
    id: "hormuz",
    icon: "⚓",
    event: "Strait of Hormuz blockade 2026",
    probability: 0.17,
    impact: "bearish" as const,
    volume: 900_000,
    hedgeFrom: "shipping-hormuz",
    recommended: false,
  },
];

/* ── Semicircle gauge ── */
function Gauge({ pct, bearish }: { pct: number; bearish: boolean }) {
  const r = 18, cx = 22, cy = 22;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <svg viewBox="0 0 44 26" className="w-[44px]">
      <path d={arc} fill="none" stroke="#f0f0f0" strokeWidth="3.5" strokeLinecap="round" pathLength={100} />
      <path
        d={arc} fill="none"
        stroke={bearish ? "#ef4444" : "#22c55e"}
        strokeWidth="3.5" strokeLinecap="round"
        pathLength={100} strokeDasharray={`${pct} 100`}
      />
    </svg>
  );
}

/* ── Polymarket-style risk card ── */
function RiskCard({ r }: { r: (typeof LMT_RISKS)[0] }) {
  const pct = Math.round(r.probability * 100);
  const bearish = r.impact === "bearish";
  return (
    <div
      className={cn(
        "rounded-[14px] border bg-white p-4",
        r.recommended ? "border-[#171B3B]" : "border-[#ececec]",
      )}
    >
      {r.recommended && (
        <div className="mb-2 flex items-center gap-1">
          <Zap className="size-2.5 text-[#f59e0b]" strokeWidth={2.5} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#f59e0b]">
            Recommended hedge
          </span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-[#f5f5f5] text-[17px] leading-none">
          {r.icon}
        </div>
        <p className="flex-1 text-[12.5px] font-semibold leading-snug text-[#0a0a0a]">
          {r.event}
        </p>
        <div className="flex shrink-0 flex-col items-center gap-[1px]">
          <Gauge pct={pct} bearish={bearish} />
          <span className="text-[11px] font-bold tabular-nums text-[#0a0a0a]">{pct}%</span>
          <span className="text-[9px] text-[#a3a3a3]">chance</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-[9px] bg-[#dcfce7] py-2 text-[12px] font-semibold text-[#16a34a] transition-colors hover:bg-[#bbf7d0]"
        >
          Yes {pct}¢
        </button>
        <button
          type="button"
          className="flex-1 rounded-[9px] bg-[#fee2e2] py-2 text-[12px] font-semibold text-[#dc2626] transition-colors hover:bg-[#fecaca]"
        >
          No {100 - pct}¢
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[10px] text-[#a3a3a3]">{fmtVol(r.volume)} vol</span>
        <Link
          href="/dashboard/hedge"
          className={cn(
            "rounded-[8px] px-3 py-1 text-[11px] font-semibold transition-colors",
            r.recommended
              ? "bg-[#171B3B] text-white hover:opacity-90"
              : "bg-[#f0f0f0] text-[#0a0a0a] hover:bg-[#e5e5e5]",
          )}
        >
          Hedge →
        </Link>
      </div>
    </div>
  );
}

/* ── Sparkline ── */
function Spark({ up }: { up: boolean }) {
  const pts = up
    ? "2,22 10,18 18,20 26,14 34,16 42,10 50,12 58,6 66,8 72,2"
    : "2,4 10,6 18,4 26,10 34,8 42,14 50,12 58,18 66,16 72,24";
  return (
    <svg width={72} height={26} viewBox="0 0 72 26" className="shrink-0">
      <polyline
        points={pts} fill="none"
        stroke={up ? "#16a34a" : "#ef4444"}
        strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Page ── */
export default function TradePage() {
  return (
    <div className="flex min-h-screen flex-col">

      {/* ── Top nav ── */}
      <header className="sticky top-0 z-10 border-b border-[#ececec] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-8">
          {/* Logo */}
          <Link href="/trade" className="flex items-center gap-1.5 shrink-0">
            <span className="text-[14px] font-bold tracking-[-0.02em] text-[#0a0a0a]">
              hedgY
            </span>
          </Link>

          {/* Stock chip */}
          <div className="flex items-center gap-2.5 rounded-[10px] border border-[#ececec] bg-[#fafafa] px-4 py-2">
            <span className="text-[16px] leading-none">🛡️</span>
            <div>
              <span className="text-[13px] font-semibold text-[#0a0a0a]">Lockheed Martin</span>
              <span className="ml-2 text-[11px] text-[#a3a3a3]">LMT · NYSE</span>
            </div>
            <div className="ml-4 flex items-baseline gap-1.5">
              <span className="text-[15px] font-bold tabular-nums text-[#0a0a0a]">$507.40</span>
              <span className="text-[12px] font-medium text-[#16a34a]">+0.47%</span>
            </div>
          </div>

          {/* Risk badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-[#fff7ed] px-3 py-1">
            <ShieldAlert className="size-3 text-[#ea580c]" strokeWidth={2.5} />
            <span className="text-[11px] font-semibold text-[#ea580c]">
              3 macro risks detected
            </span>
          </div>

          {/* Right */}
          <div className="ml-auto flex items-center gap-4">
            <Link href="/dashboard" className="text-[12px] font-medium text-[#737373] hover:text-[#0a0a0a]">
              Portfolio
            </Link>
            <div
              className="size-8 rounded-full"
              style={{ background: "radial-gradient(circle at 30% 25%, #9580ff, transparent 72%), linear-gradient(140deg, #9580ff, #4F8DFF)" }}
            />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="mx-auto w-full max-w-[1400px] flex-1 p-6">

        {/* Section label */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#0a0a0a]">
              Hedge your position
            </h1>
            <p className="mt-0.5 text-[12px] text-[#a3a3a3]">
              LMT · 100 shares long · Avg. $507.40 · Portfolio weight 10%
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-[10px] bg-[#f0fdf4] px-4 py-2">
            <span className="text-[11px] font-medium text-[#15803d]">Unrealized P&L</span>
            <span className="text-[14px] font-bold text-[#15803d]">+$238.00 (+0.47%)</span>
          </div>
        </div>

        {/* Chart + Risk panel */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">

          {/* Chart */}
          <StockChart className="border border-[#ececec] shadow-[0_1px_3px_rgba(0,0,0,0.04)]" />

          {/* Risk cards */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">
              Correlated prediction markets
            </p>
            {LMT_RISKS.map((r) => (
              <RiskCard key={r.id} r={r} />
            ))}
          </div>
        </div>

        {/* Hedge + Outcomes */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Recommended hedge */}
          <div className="rounded-[16px] border border-[#171B3B] bg-white p-6">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-[#f59e0b]" strokeWidth={2.5} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">
                Recommended hedge
              </p>
            </div>

            <div className="mt-4 flex items-center gap-6">
              <div>
                <p className="text-[52px] font-black leading-none tabular-nums tracking-tighter text-[#0a0a0a]">
                  0.58
                </p>
                <p className="mt-1 text-[11px] text-[#a3a3a3]">Hedge ratio</p>
              </div>
              <div className="flex-1 border-l border-[#f0f0f0] pl-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#a3a3a3]">
                  You&apos;re protected if
                </p>
                <p className="mt-1.5 text-[15px] font-bold leading-snug text-[#0a0a0a]">
                  Republicans win midterms
                </p>
                <p className="mt-1 text-[12px] text-[#737373]">
                  Buy NO at 57¢ per share
                </p>
                <span className="mt-2 inline-block rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[11px] font-semibold text-[#d97706]">
                  43% probability
                </span>
              </div>
            </div>

            <p className="mt-4 text-[12px] leading-relaxed text-[#737373]">
              Based on historical correlation, this hedge reduces your downside by{" "}
              <strong className="text-[#0a0a0a]">~62%</strong> while keeping full upside if LMT continues to rise.
            </p>

            <Link
              href="/dashboard/hedge"
              className="mt-5 flex items-center justify-center gap-2 rounded-[12px] bg-[#171B3B] py-3.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
            >
              <Zap className="size-4" strokeWidth={2.5} />
              Apply hedge — 1 click
            </Link>
          </div>

          {/* Projected outcomes */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">
              Projected outcomes
            </p>

            {/* Good scenario */}
            <div className="flex-1 rounded-[16px] border border-[#bbf7d0] bg-[#f0fdf4] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#15803d]">
                    Republicans win · hedge pays out
                  </p>
                  <p className="mt-2 text-[36px] font-black leading-none tabular-nums tracking-tighter text-[#15803d]">
                    +$4,320
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-[#16a34a]">+8.5%</p>
                </div>
                <Spark up={true} />
              </div>
              <p className="mt-3 text-[11px] text-[#15803d]">
                Stock drops, but prediction market payout covers the loss and then some.
              </p>
            </div>

            {/* Bad scenario */}
            <div className="flex-1 rounded-[16px] border border-[#fecaca] bg-[#fff1f2] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#b91c1c]">
                    Republicans lose · hedge expires worthless
                  </p>
                  <p className="mt-2 text-[36px] font-black leading-none tabular-nums tracking-tighter text-[#dc2626]">
                    -$1,230
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-[#ef4444]">-2.4%</p>
                </div>
                <Spark up={false} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <TrendingDown className="size-3 text-[#b91c1c]" strokeWidth={2.5} />
                <p className="text-[11px] text-[#b91c1c]">
                  vs <strong>-$8,700 (-17.1%)</strong> unhedged
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary strip */}
        <div className="mt-5 flex items-center justify-between rounded-[14px] border border-[#ececec] bg-white px-6 py-4">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#a3a3a3]">Net hedge cost</p>
              <p className="mt-0.5 text-[16px] font-bold tabular-nums text-[#0a0a0a]">$29,380</p>
            </div>
            <div className="h-8 w-px bg-[#f0f0f0]" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#a3a3a3]">Potential return</p>
              <p className="mt-0.5 text-[16px] font-bold text-[#16a34a]">+14.2%</p>
            </div>
            <div className="h-8 w-px bg-[#f0f0f0]" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#a3a3a3]">Max downside (hedged)</p>
              <p className="mt-0.5 text-[16px] font-bold text-[#dc2626]">-2.4%</p>
            </div>
            <div className="h-8 w-px bg-[#f0f0f0]" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#a3a3a3]">Max downside (unhedged)</p>
              <p className="mt-0.5 text-[16px] font-bold text-[#737373] line-through">-17.1%</p>
            </div>
          </div>
          <Link
            href="/dashboard/hedge"
            className="flex items-center gap-2 rounded-[10px] bg-[#171B3B] px-6 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Apply hedge
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
