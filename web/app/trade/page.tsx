"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowRight, ArrowUp, ArrowDown, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { trendingStocks, marketEvents, hedgeSuggestions } from "@/lib/mockData";
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
        placeholder="Search stocks, options, prediction markets…"
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
  const W = 72, H = 24;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={up ? "#16a34a" : "#dc2626"} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ── Featured prediction market ── */
const HERO_MARKET = marketEvents.find((m) => m.id === "defense-budget")!;

function FeaturedMarket() {
  const yPct = Math.round((HERO_MARKET.yesProbability ?? 0) * 100);
  const up = HERO_MARKET.direction === "up";

  return (
    <div className="flex h-full flex-col rounded-[20px] bg-white p-6 shadow-[0_1px_6px_rgba(0,0,0,0.07)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f4ff] px-3 py-1 text-[11px] font-semibold text-[#4f5fe8]">
          {HERO_MARKET.icon} {HERO_MARKET.category}
        </span>
        <span className={cn("flex items-center gap-0.5 text-[11px] font-medium", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
          {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
          {Math.abs(HERO_MARKET.changePts)}pt 24h
        </span>
      </div>

      {/* Question */}
      <h2 className="mt-4 text-[18px] font-bold leading-snug text-[#181925]">
        {HERO_MARKET.title}
      </h2>

      {/* Single big probability — Polymarket style */}
      <div className="my-5 flex flex-col items-start gap-1">
        <span className="text-[56px] font-black leading-none tabular-nums text-[#16a34a]">{yPct}%</span>
        <span className="text-[13px] font-medium text-[#a3a3a3]">chance of YES</span>
      </div>

      {/* Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
        <div className="h-full rounded-full bg-[#16a34a]" style={{ width: `${yPct}%` }} />
      </div>

      {/* Volume */}
      <p className="mt-2 text-[11px] text-[#c0c0c0]">{fmtVol(HERO_MARKET.volume)} vol</p>

      {/* Buttons */}
      <div className="mt-auto flex gap-3 pt-5">
        <button type="button" className="flex-1 rounded-[12px] bg-[#16a34a] py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#15803d]">
          Yes · {yPct}¢
        </button>
        <button type="button" className="flex-1 rounded-[12px] bg-[#dc2626] py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#b91c1c]">
          No · {100 - yPct}¢
        </button>
      </div>
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
          <p className="text-[16px] font-bold text-white">Combine LMT + this market into one position</p>
          <p className="mt-0.5 text-[12px] text-white/50">Hedge your equity with a prediction market — auto-sized, one click.</p>
        </div>
      </div>
      <span className="ml-6 flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-5 py-2.5 text-[13px] font-semibold text-[#C5D3E6] transition-colors group-hover:bg-white/20">
        Build it <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}

/* ── Hedge idea card ── */
function HedgeCard({ s }: { s: (typeof hedgeSuggestions)[0] }) {
  const hedgePct = Math.round(s.hedgePrice * 100);
  const strengthColor: Record<string, string> = {
    Strong: "bg-[#f0fdf4] text-[#16a34a]",
    Moderate: "bg-[#fff7ed] text-[#ea580c]",
    Light: "bg-[#f5f5f5] text-[#737373]",
  };
  return (
    <Link
      href="/structure"
      className="flex flex-col rounded-[18px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]"
    >
      {/* Strength badge */}
      <span className={cn("self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", strengthColor[s.strength])}>
        {s.strength} hedge
      </span>

      {/* Equity leg */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[22px]">📈</span>
        <div>
          <p className="text-[13px] font-bold text-[#181925]">{s.equityLabel}</p>
          <p className="text-[11px] text-[#a3a3a3]">{s.equitySymbols.join(" · ")}</p>
        </div>
      </div>

      {/* Connector */}
      <div className="my-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-[#ececec]" />
        <span className="rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-semibold text-[#888]">hedged with</span>
        <div className="h-px flex-1 bg-[#ececec]" />
      </div>

      {/* Hedge leg */}
      <div className="flex items-center gap-2">
        <span className="text-[22px]">🎯</span>
        <div>
          <p className="text-[13px] font-bold text-[#181925]">
            {s.hedgeSide} — {s.hedgeMarket}
          </p>
          <p className="text-[11px] text-[#a3a3a3]">@ {hedgePct}¢</p>
        </div>
      </div>

      {/* Rationale */}
      <p className="mt-3 text-[12px] leading-relaxed text-[#737373]">{s.rationale}</p>

      {/* CTA */}
      <div className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold text-[#181925]">
        <Zap className="size-3.5" /> Build this combo
      </div>
    </Link>
  );
}

/* ── Market card (Polymarket-style) ── */
function MarketCard({ m }: { m: (typeof marketEvents)[0] }) {
  const yPct = m.yesProbability != null ? Math.round(m.yesProbability * 100) : null;
  const up = m.direction !== "down";
  return (
    <div className="flex flex-col rounded-[16px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] cursor-pointer transition-shadow hover:shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-[10px] font-medium text-[#555]">
          {m.icon} {m.category}
        </span>
        <div className="flex items-center gap-2">
          {m.live && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#dc2626]">
              <span className="size-1.5 rounded-full bg-[#dc2626]" /> LIVE
            </span>
          )}
          <span className={cn("flex items-center gap-0.5 text-[10px] font-medium", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
            {up ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />}
            {Math.abs(m.changePts)}pt
          </span>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[14px] font-semibold leading-snug text-[#181925]">{m.title}</p>

      {yPct != null && (
        <>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-[28px] font-black tabular-nums leading-none text-[#16a34a]">{yPct}%</span>
            <span className="mb-0.5 text-[11px] text-[#a3a3a3]">chance YES</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
            <div className="h-full rounded-full bg-[#16a34a]" style={{ width: `${yPct}%` }} />
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" className="flex-1 rounded-[8px] bg-[#f0fdf4] py-2 text-[12px] font-bold text-[#16a34a] hover:bg-[#dcfce7] transition-colors">
              Yes {yPct}¢
            </button>
            <button type="button" className="flex-1 rounded-[8px] bg-[#fef2f2] py-2 text-[12px] font-bold text-[#dc2626] hover:bg-[#fee2e2] transition-colors">
              No {100 - yPct}¢
            </button>
          </div>
        </>
      )}

      {yPct == null && m.outcomes && (
        <div className="mt-3 flex flex-col gap-1.5">
          {m.outcomes.slice(0, 3).map((o) => {
            const pct = Math.round(o.yes * 100);
            return (
              <div key={o.label} className="flex items-center gap-2">
                <span className="w-[80px] shrink-0 truncate text-[11px] text-[#555]">{o.label}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-[#f0f0f0] h-1.5">
                  <div className="h-full rounded-full bg-[#9580ff]" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-7 shrink-0 text-right text-[11px] font-semibold tabular-nums text-[#181925]">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-[10px] text-[#c0c0c0]">{fmtVol(m.volume)} vol</p>
    </div>
  );
}

/* ── Trending stock pill ── */
function StockPill({ s }: { s: (typeof trendingStocks)[0] }) {
  const up = s.direction !== "down";
  return (
    <div className="flex min-w-[148px] cursor-pointer flex-col rounded-[14px] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
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
    </div>
  );
}

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[15px] font-bold text-[#181925]">{children}</h2>
  );
}

/* ── Page ── */
export default function TradePage() {
  const browseMarkets = marketEvents.filter((m) => m.id !== "defense-budget");

  return (
    <div className="flex flex-col gap-7">
      <TradeSearch />

      {/* Hero: stock chart + featured market */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] lg:items-stretch">
        <div className="min-h-[360px]">
          <StockChart />
        </div>
        <FeaturedMarket />
      </div>

      {/* Core value prop CTA */}
      <CombineCTA />

      {/* Hedge ideas — the real differentiator */}
      <section>
        <SectionLabel>Hedge Ideas</SectionLabel>
        <p className="mb-4 -mt-1 text-[13px] text-[#a3a3a3]">Pre-built equity + prediction market combos. One click to structure.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hedgeSuggestions.map((s) => (
            <HedgeCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      {/* Trending stocks — quick browse */}
      <section>
        <SectionLabel>Trending Stocks</SectionLabel>
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trendingStocks.map((s) => (
            <StockPill key={s.symbol} s={s} />
          ))}
        </div>
      </section>

      {/* All markets */}
      <section className="pb-6">
        <SectionLabel>All Markets</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {browseMarkets.map((m) => (
            <MarketCard key={m.id} m={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
