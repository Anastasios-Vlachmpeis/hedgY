"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowRight, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { trendingStocks, hedgeSuggestions } from "@/lib/mockData";
import { StockChart } from "@/components/trade/stock-chart";

/* ── helpers ── */
function fmtVol(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/* ── Search — macOS Spotlight feel ── */
function TradeSearch() {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" strokeWidth={1.75} />
      <input
        type="text"
        placeholder="Search a stock to see its risk exposure…"
        className="h-14 w-full rounded-[14px] border border-[#ececec] bg-white pl-12 pr-24 text-[15px] text-[#111111] placeholder:text-[#9ca3af] outline-none transition-colors duration-[180ms] focus:border-[#d1d5db]"
      />
      <kbd className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 rounded-[6px] border border-[#ececec] bg-[#f5f5f5] px-2 py-0.5 text-[11px] text-[#9ca3af]">
        ⌘ K
      </kbd>
    </div>
  );
}

/* ── Sparkline ── */
function Spark({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const W = 80, H = 28;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={up ? "#16a34a" : "#ef4444"} strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ── Risk analysis panel (right hero card) ── */
const LMT_RISKS = [
  {
    id:          "midterms",
    icon:        "🏛️",
    event:       "Republicans win 2026 midterms",
    probability: 0.43,
    impact:      "bearish" as const,
    reason:      "Defense budgets shrink under Republican cost-cutting mandates.",
    volume:      12_400_000,
  },
  {
    id:          "defense-budget",
    icon:        "🛡️",
    event:       "US defense budget exceeds $900B",
    probability: 0.55,
    impact:      "bullish" as const,
    reason:      "Direct revenue tailwind — LMT earns 70%+ from US government contracts.",
    volume:      1_100_000,
  },
  {
    id:          "hormuz",
    icon:        "⚓",
    event:       "Strait of Hormuz blockade 2026",
    probability: 0.17,
    impact:      "bearish" as const,
    reason:      "Supply chain disruption risks production timelines and deliveries.",
    volume:      900_000,
  },
];

function RiskPanel() {
  return (
    <div className="flex h-full flex-col rounded-[18px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold leading-tight text-[#111111]">LMT Risk Analysis</h3>
          <p className="mt-0.5 text-[12px] text-[#6B7280]">3 macro events correlated with your position</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#d97706]">
          <ShieldAlert className="size-2.5" /> 3
        </span>
      </div>

      {/* Risk cards */}
      <div className="mt-4 flex flex-col gap-2.5">
        {LMT_RISKS.map((r) => {
          const pct     = Math.round(r.probability * 100);
          const bearish = r.impact === "bearish";
          return (
            <div key={r.id} className="rounded-[12px] border border-[#ececec] p-4">
              {/* Top row: icon + title + badge */}
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[14px] leading-none">{r.icon}</span>
                <p className="flex-1 text-[12px] font-semibold leading-snug text-[#111111]">{r.event}</p>
                <span className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  bearish ? "bg-[#fef2f2] text-[#dc2626]" : "bg-[#f0fdf4] text-[#16a34a]",
                )}>
                  {bearish ? "↓ Bear" : "↑ Bull"}
                </span>
              </div>

              {/* Probability */}
              <div className="mt-2 flex items-end gap-2">
                <span className="text-[22px] font-semibold leading-none tabular-nums text-[#111111]">{pct}%</span>
                <span className="mb-0.5 text-[11px] text-[#9ca3af]">{fmtVol(r.volume)} vol</span>
              </div>

              {/* Bar */}
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                <div
                  className={cn("h-full rounded-full", bearish ? "bg-[#fca5a5]" : "bg-[#86efac]")}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Reason */}
              <p className="mt-2 text-[11px] leading-relaxed text-[#6B7280]">{r.reason}</p>
            </div>
          );
        })}
      </div>

      {/* Full-width outline CTA */}
      <Link
        href="/structure"
        className="mt-auto flex h-10 w-full shrink-0 items-center justify-between rounded-[10px] border border-[#111111] px-4 text-[13px] font-medium text-[#111111] transition-all duration-[200ms] ease-out hover:bg-[#111111] hover:text-white"
      >
        Hedge LMT against these
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

/* ── Primary CTA ── */
function CombineCTA() {
  return (
    <Link
      href="/structure"
      className="group flex h-[72px] items-center justify-between rounded-[16px] bg-[#171B3B] px-6 transition-opacity duration-[200ms] hover:opacity-95"
    >
      <div className="flex items-center gap-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-white/10">
          <span className="text-[15px]">🧩</span>
        </div>
        <div>
          <p className="text-[15px] font-semibold leading-tight text-white">
            Build a hedged position on LMT
          </p>
          <p className="mt-0.5 text-[12px] text-white/60">
            Pair equity with prediction-market coverage — auto-sized, one click.
          </p>
        </div>
      </div>
      <button
        type="button"
        className="ml-6 flex shrink-0 items-center gap-1.5 rounded-[10px] bg-white px-4 py-2 text-[13px] font-semibold text-[#171B3B] transition-transform duration-[200ms] ease-out group-hover:-translate-y-px"
      >
        Structure it <ArrowRight className="size-3.5" />
      </button>
    </Link>
  );
}

/* ── Hedge idea card ── */
const STRENGTH_COLORS: Record<string, { dot: string; text: string }> = {
  Strong:   { dot: "bg-[#16a34a]",  text: "text-[#16a34a]"  },
  Moderate: { dot: "bg-[#f59e0b]",  text: "text-[#d97706]"  },
  Light:    { dot: "bg-[#9ca3af]",  text: "text-[#6B7280]"  },
};

const HEDGE_SUBTITLE: Record<string, string> = {
  "defense-election": "Hedging political risk in defense spending",
  "pharma-fda":       "Hedging binary FDA readout risk in pharma",
  "shipping-hormuz":  "Hedging geopolitical disruption in shipping",
};

function HedgeCard({ s }: { s: (typeof hedgeSuggestions)[0] }) {
  const hedgePct = Math.round(s.hedgePrice * 100);
  const c = STRENGTH_COLORS[s.strength];
  return (
    <Link
      href="/structure"
      className="group flex flex-col rounded-[16px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-[200ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)]"
    >
      {/* Strength */}
      <div className="flex items-center gap-1.5">
        <span className={cn("size-1.5 rounded-full", c.dot)} />
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", c.text)}>
          {s.strength} hedge
        </span>
      </div>

      {/* Thesis */}
      <h3 className="mt-2.5 text-[14px] font-semibold text-[#111111]">{s.position.thesis}</h3>
      <p className="mt-0.5 text-[12px] text-[#6B7280]">{HEDGE_SUBTITLE[s.id]}</p>

      {/* Legs */}
      <div className="mt-4 flex flex-col gap-2.5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#9ca3af]">Long exposure</p>
          <p className="mt-1 text-[12px] font-medium text-[#111111]">
            {s.equitySymbols.join(" · ")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-[#f0f0f0]" />
          <span className="text-[9px] font-medium text-[#d1d5db]">hedged with</span>
          <div className="h-px flex-1 bg-[#f0f0f0]" />
        </div>

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#9ca3af]">Hedge exposure</p>
          <p className="mt-1 text-[12px] font-medium text-[#111111]">
            {s.hedgeSide} — {s.hedgeMarket}
          </p>
          <p className="mt-0.5 text-[11px] text-[#9ca3af]">@ {hedgePct}¢ implied</p>
        </div>
      </div>

      {/* Rationale */}
      <p className="mt-3 text-[11px] leading-relaxed text-[#6B7280]">{s.rationale}</p>

      {/* Text CTA */}
      <div className="mt-3 flex items-center gap-1 text-[12px] font-medium text-[#111111] transition-all duration-[200ms] ease-out group-hover:gap-2">
        Build this combo <ArrowRight className="size-3" />
      </div>
    </Link>
  );
}

/* ── Stock pill — Apple Stocks widget feel ── */
const STOCK_RISKS: Record<string, number> = {
  LMT: 3, RTX: 2, NOC: 2, GD: 1, PFE: 2, MRK: 1, ZIM: 2,
};

function StockPill({ s }: { s: (typeof trendingStocks)[0] }) {
  const up    = s.direction !== "down";
  const risks = STOCK_RISKS[s.symbol] ?? 0;
  return (
    <div className="flex w-[160px] shrink-0 cursor-pointer flex-col rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-[200ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
      {/* Ticker + risk badge */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[14px] font-semibold text-[#111111]">{s.symbol}</p>
          <p className="mt-0.5 truncate text-[10px] text-[#9ca3af]">{s.name}</p>
        </div>
        {risks > 0 && (
          <span className="flex items-center gap-0.5 rounded-full bg-[#fef3c7] px-1.5 py-0.5">
            <span className="size-[4px] rounded-full bg-[#f59e0b]" />
            <span className="text-[9px] font-bold text-[#d97706]">{risks}</span>
          </span>
        )}
      </div>

      {/* Sparkline */}
      <div className="mt-3">
        <Spark data={s.spark} up={up} />
      </div>

      {/* Price + change */}
      <div className="mt-2 flex items-end justify-between">
        <p className="text-[14px] font-semibold tabular-nums text-[#111111]">${s.price.toFixed(2)}</p>
        <p className={cn("text-[11px] font-medium tabular-nums", up ? "text-[#16a34a]" : "text-[#ef4444]")}>
          {up ? "+" : ""}{s.changePct.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

/* ── Section header ── */
function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">{title}</h2>
        {sub && <p className="text-[14px] font-medium text-[#111111]">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

/* ── Page ── */
export default function TradePage() {
  return (
    <div className="flex flex-col gap-10">
      <TradeSearch />

      {/* Hero — 62/38 split, equal height columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[62fr_38fr] lg:[&>*]:h-full">
        <StockChart />
        <RiskPanel />
      </div>

      {/* Primary CTA */}
      <CombineCTA />

      {/* Hedge ideas */}
      <Section
        title="Hedge Ideas"
        sub="Pre-built equity + prediction market pairs. Pick one, we handle the sizing."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hedgeSuggestions.map((s) => (
            <HedgeCard key={s.id} s={s} />
          ))}
        </div>
      </Section>

      {/* Explore stocks */}
      <Section
        title="Explore Stocks"
        sub="Select any stock to see its correlated risk events."
      >
        <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trendingStocks.map((s) => (
            <StockPill key={s.symbol} s={s} />
          ))}
        </div>
      </Section>
    </div>
  );
}
