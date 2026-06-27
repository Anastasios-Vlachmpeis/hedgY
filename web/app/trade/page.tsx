"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowRight, ShieldAlert, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { trendingStocks, hedgeSuggestions } from "@/lib/mockData";
import { StockChart } from "@/components/trade/stock-chart";

/* ── helpers ── */
function fmtVol(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/* ── Search ── */
function TradeSearch() {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#a3a3a3]" />
      <input
        type="text"
        placeholder="Search a stock to see its risk exposure…"
        className="h-12 w-full rounded-2xl border border-white/60 bg-white/70 pl-11 pr-4 text-[14px] text-[#181925] placeholder:text-[#a3a3a3] shadow-[0_1px_4px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all focus:border-[#C5D3E6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5D3E6]/40"
      />
    </div>
  );
}

/* ── Sparkline ── */
function Spark({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 64, H = 22;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={up ? "#16a34a" : "#dc2626"} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ── Risk factors panel ── */
const LMT_RISKS = [
  {
    id: "midterms",
    icon: "🏛️",
    event: "Republicans win 2026 midterms",
    probability: 0.43,
    impact: "bearish" as const,
    reason: "Defense budgets shrink under Republican cost-cutting mandates.",
    hedgeAction: "Buy NO · 57¢",
    volume: 12_400_000,
  },
  {
    id: "defense-budget",
    icon: "🛡️",
    event: "US defense budget exceeds $900B",
    probability: 0.55,
    impact: "bullish" as const,
    reason: "Direct revenue tailwind — LMT earns 70%+ from US government contracts.",
    hedgeAction: "Buy YES · 55¢",
    volume: 1_100_000,
  },
  {
    id: "hormuz",
    icon: "⚓",
    event: "Strait of Hormuz blockade 2026",
    probability: 0.17,
    impact: "bearish" as const,
    reason: "Supply chain disruption hits production timelines.",
    hedgeAction: "Buy YES · 17¢",
    volume: 900_000,
  },
];

function RiskPanel() {
  return (
    <div className="flex h-full flex-col rounded-[20px] bg-white p-6 shadow-[0_1px_6px_rgba(0,0,0,0.07)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-[#f59e0b]" />
          <span className="text-[14px] font-bold text-[#181925]">Risk factors for LMT</span>
        </div>
        <span className="rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[11px] font-bold text-[#d97706]">
          {LMT_RISKS.length} events
        </span>
      </div>
      <p className="mt-1 text-[12px] text-[#a3a3a3]">
        Prediction markets correlated with your position
      </p>

      {/* Risk rows */}
      <div className="mt-4 flex flex-col divide-y divide-[#f5f5f5]">
        {LMT_RISKS.map((r) => {
          const pct = Math.round(r.probability * 100);
          const bearish = r.impact === "bearish";
          return (
            <div key={r.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-[18px] leading-none">{r.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-snug text-[#181925]">{r.event}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#a3a3a3]">{r.reason}</p>
                  </div>
                </div>
                <span className={cn(
                  "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  bearish ? "bg-[#fef2f2] text-[#dc2626]" : "bg-[#f0fdf4] text-[#16a34a]",
                )}>
                  {bearish ? "↓ Bearish" : "↑ Bullish"}
                </span>
              </div>

              {/* Probability bar */}
              <div className="mt-2.5 flex items-center gap-2.5">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                  <div
                    className={cn("h-full rounded-full", bearish ? "bg-[#fca5a5]" : "bg-[#86efac]")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums text-[#181925]">{pct}%</span>
                <span className="text-[10px] text-[#c0c0c0]">{fmtVol(r.volume)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Link
        href="/structure"
        className="mt-auto flex items-center justify-center gap-2 rounded-[12px] bg-[#181925] py-3.5 pt-3.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
      >
        Hedge LMT against these <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

/* ── Combine CTA ── */
function CombineCTA() {
  return (
    <Link
      href="/structure"
      className="group flex items-center justify-between rounded-[20px] bg-[#181925] px-8 py-5 transition-opacity hover:opacity-90"
    >
      <div className="flex items-center gap-4">
        <span className="text-[28px]">🧩</span>
        <div>
          <p className="text-[16px] font-bold text-white">Build a hedged position on LMT</p>
          <p className="mt-0.5 text-[12px] text-white/50">
            Pair your equity with prediction-market coverage — auto-sized hedge ratio, one click.
          </p>
        </div>
      </div>
      <span className="ml-6 flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-5 py-2.5 text-[13px] font-semibold text-[#C5D3E6] transition-colors group-hover:bg-white/20">
        Structure it <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}

/* ── Hedge idea card ── */
const STRENGTH_STYLE: Record<string, string> = {
  Strong: "bg-[#f0fdf4] text-[#16a34a]",
  Moderate: "bg-[#fff7ed] text-[#ea580c]",
  Light: "bg-[#f5f5f5] text-[#737373]",
};

function HedgeCard({ s }: { s: (typeof hedgeSuggestions)[0] }) {
  const hedgePct = Math.round(s.hedgePrice * 100);
  return (
    <Link
      href="/structure"
      className="group flex flex-col rounded-[18px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]"
    >
      <span className={cn("self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", STRENGTH_STYLE[s.strength])}>
        {s.strength} hedge
      </span>

      {/* Equity */}
      <div className="mt-3 flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f0f4ff] text-[16px]">📈</span>
        <div>
          <p className="text-[13px] font-bold text-[#181925]">{s.equityLabel}</p>
          <p className="text-[11px] text-[#a3a3a3]">{s.equitySymbols.join(" · ")}</p>
        </div>
      </div>

      {/* Connector */}
      <div className="my-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-[#ececec]" />
        <span className="rounded-full border border-[#ececec] px-2 py-0.5 text-[10px] font-medium text-[#aaa]">hedged with</span>
        <div className="h-px flex-1 bg-[#ececec]" />
      </div>

      {/* Hedge leg */}
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fef3c7] text-[16px]">🎯</span>
        <div>
          <p className="text-[13px] font-bold text-[#181925]">{s.hedgeSide} — {s.hedgeMarket}</p>
          <p className="text-[11px] text-[#a3a3a3]">@ {hedgePct}¢ implied</p>
        </div>
      </div>

      {/* Rationale */}
      <p className="mt-3 text-[12px] leading-relaxed text-[#737373]">{s.rationale}</p>

      {/* Footer CTA */}
      <div className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-[#181925] transition-opacity group-hover:opacity-70">
        <Zap className="size-3.5 fill-current" /> Build this combo →
      </div>
    </Link>
  );
}

/* ── Stock pill (quick discovery) ── */
const STOCK_RISK_COUNT: Record<string, number> = {
  LMT: 3, RTX: 2, NOC: 2, GD: 1, PFE: 2, MRK: 1, ZIM: 2,
};

function StockPill({ s }: { s: (typeof trendingStocks)[0] }) {
  const up = s.direction !== "down";
  const risks = STOCK_RISK_COUNT[s.symbol] ?? 0;
  return (
    <div className="flex min-w-[152px] cursor-pointer flex-col rounded-[14px] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#181925]">{s.symbol}</span>
        <span className={cn("text-[11px] font-semibold", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
          {up ? "+" : ""}{s.changePct.toFixed(1)}%
        </span>
      </div>
      <p className="mt-0.5 truncate text-[10px] text-[#a3a3a3]">{s.name}</p>
      <p className="mt-2.5 text-[17px] font-bold tabular-nums text-[#181925]">${s.price.toFixed(2)}</p>
      <div className="mt-2">
        <Spark data={s.spark} up={up} />
      </div>
      {risks > 0 && (
        <div className="mt-2.5 flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5 self-start">
          <ShieldAlert className="size-2.5 text-[#d97706]" />
          <span className="text-[9px] font-bold text-[#d97706]">{risks} risk event{risks > 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );
}

/* ── Page ── */
export default function TradePage() {
  return (
    <div className="flex flex-col gap-7">
      <TradeSearch />

      {/* Hero: stock chart + risk factors */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] lg:items-stretch">
        <div className="min-h-[360px]">
          <StockChart />
        </div>
        <RiskPanel />
      </div>

      {/* Hedge CTA */}
      <CombineCTA />

      {/* Pre-built hedge ideas */}
      <section>
        <h2 className="mb-1 text-[15px] font-bold text-[#181925]">Hedge Ideas</h2>
        <p className="mb-4 text-[13px] text-[#a3a3a3]">
          Pre-built equity + prediction market pairs. Pick one, we handle the sizing.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hedgeSuggestions.map((s) => (
            <HedgeCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      {/* Stocks — with risk event badges */}
      <section className="pb-6">
        <h2 className="mb-1 text-[15px] font-bold text-[#181925]">Explore Stocks</h2>
        <p className="mb-4 text-[13px] text-[#a3a3a3]">Select any stock to see its correlated risk events.</p>
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trendingStocks.map((s) => (
            <StockPill key={s.symbol} s={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
