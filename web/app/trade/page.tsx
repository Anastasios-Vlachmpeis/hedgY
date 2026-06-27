"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowRight, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { trendingStocks, hedgeSuggestions, marketEvents } from "@/lib/mockData";
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
          <h3 className="text-[15px] font-semibold leading-tight text-[#111111]">Risk Factors</h3>
          <p className="mt-0.5 text-[12px] text-[#9ca3af]">Macro markets correlated with LMT</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#d97706]">
          <ShieldAlert className="size-2.5" /> 3
        </span>
      </div>

      {/* Risk rows — Polymarket list style */}
      <div className="mt-3 flex flex-col divide-y divide-[#f5f5f5]">
        {LMT_RISKS.map((r) => {
          const pct     = Math.round(r.probability * 100);
          const bearish = r.impact === "bearish";
          return (
            <div key={r.id} className="flex flex-col gap-2 py-3.5">
              {/* Title + % */}
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-[15px] leading-none">{r.icon}</span>
                <p className="flex-1 text-[12px] font-semibold leading-snug text-[#111111]">{r.event}</p>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-[15px] font-bold tabular-nums text-[#111111]">{pct}%</span>
                  <span className={cn("text-[9px] font-semibold uppercase tracking-wide", bearish ? "text-[#dc2626]" : "text-[#16a34a]")}>
                    {bearish ? "↓ Bear" : "↑ Bull"}
                  </span>
                </div>
              </div>
              {/* Bar + volume */}
              <div className="ml-[26px] flex flex-col gap-1">
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: bearish ? "#fca5a5" : "#86efac" }}
                  />
                </div>
                <p className="text-[10px] text-[#9ca3af]">{fmtVol(r.volume)} vol</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
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

/* ── Hedge idea list row — Polymarket-style ── */
const HEDGE_ICONS: Record<string, string> = {
  "defense-election": "🏛️",
  "pharma-fda":       "💊",
  "shipping-hormuz":  "⚓",
};

const STRENGTH_STYLES: Record<string, { pill: string; bar: string }> = {
  Strong:   { pill: "bg-[#dcfce7] text-[#15803d]", bar: "#16a34a" },
  Moderate: { pill: "bg-[#fef9c3] text-[#a16207]", bar: "#eab308" },
  Light:    { pill: "bg-[#f3f4f6] text-[#6B7280]",  bar: "#9ca3af" },
};

function HedgeRow({ s }: { s: (typeof hedgeSuggestions)[0] }) {
  const icon = HEDGE_ICONS[s.id] ?? "📊";
  const c    = STRENGTH_STYLES[s.strength];

  /* YES probability is always 1 − NO price */
  const yesPrice = s.hedgeSide === "YES" ? s.hedgePrice : 1 - s.hedgePrice;
  const yesCents = Math.round(yesPrice * 100);
  const noCents  = 100 - yesCents;

  return (
    <Link
      href={`/structure?from=${s.id}`}
      className="flex flex-col gap-3 px-5 py-4 transition-colors duration-[180ms] hover:bg-[#fafafa]"
    >
      {/* Row 1: icon + market title + strength badge */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-[18px] leading-none">{icon}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-[13px] font-semibold leading-snug text-[#111111]">
            {s.hedgeMarket}
          </p>
          <p className="text-[11px] text-[#9ca3af]">
            {s.equityLabel} · {s.equitySymbols.join(" · ")}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", c.pill)}>
          {s.strength}
        </span>
      </div>

      {/* Row 2: probability bar + YES / NO buttons */}
      <div className="ml-7 flex flex-col gap-2">
        {/* Bar — shows YES probability */}
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#f0f0f0]">
          <div
            className="h-full rounded-full"
            style={{ width: `${yesCents}%`, backgroundColor: c.bar }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-[8px] py-1.5 text-[12px] font-semibold transition-colors",
              s.hedgeSide === "YES"
                ? "bg-[#111111] text-white"
                : "bg-[#f0fdf4] text-[#15803d] hover:bg-[#dcfce7]",
            )}
          >
            Yes <span className="font-normal opacity-60">{yesCents}¢</span>
          </button>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-[8px] py-1.5 text-[12px] font-semibold transition-colors",
              s.hedgeSide === "NO"
                ? "bg-[#111111] text-white"
                : "bg-[#fef2f2] text-[#b91c1c] hover:bg-[#fee2e2]",
            )}
          >
            No <span className="font-normal opacity-60">{noCents}¢</span>
          </button>
        </div>
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

/* ── Polymarket-style donut ring ── */
function DonutRing({ pct, color = "#f0b429" }: { pct: number; color?: string }) {
  const r = 26;
  const C = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 60 60" className="size-[60px] -rotate-90">
      <circle cx="30" cy="30" r={r} fill="none" stroke="#f0f0f0" strokeWidth="5" />
      <circle
        cx="30" cy="30" r={r}
        fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - pct / 100)}
      />
    </svg>
  );
}

/* ── Polymarket card ── */
function PolyCard({ m }: { m: (typeof marketEvents)[0] }) {
  const isBinary = m.yesProbability != null;
  const yPct = isBinary ? Math.round((m.yesProbability ?? 0) * 100) : null;

  return (
    <div className="flex flex-col rounded-[16px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-[200ms] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-3 p-4">
        {/* Header: icon + title + ring */}
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 shrink-0 text-[20px] leading-none">{m.icon}</span>
          <p className="flex-1 text-[13px] font-semibold leading-snug text-[#111111]">{m.title}</p>

          {/* Binary: donut ring with % */}
          {isBinary && yPct != null && (
            <div className="flex shrink-0 flex-col items-center">
              <div className="relative">
                <DonutRing pct={yPct} />
                {/* percentage + chance inside positioning trick */}
              </div>
              <span className="mt-0.5 text-[13px] font-bold tabular-nums text-[#111111]">{yPct}%</span>
              <span className="text-[10px] text-[#9ca3af]">chance</span>
            </div>
          )}
        </div>

        {/* Multi-outcome rows */}
        {!isBinary && m.outcomes && (
          <div className="flex flex-col gap-1.5">
            {m.outcomes.slice(0, 3).map((o) => {
              const pct = Math.round(o.yes * 100);
              return (
                <div key={o.label} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-[12px] text-[#374151]">{o.label}</span>
                  <span className="w-9 text-right text-[12px] font-semibold tabular-nums text-[#111111]">{pct}%</span>
                  <button type="button" className="rounded-[6px] bg-[#f0fdf4] px-2.5 py-0.5 text-[11px] font-semibold text-[#15803d] hover:bg-[#dcfce7]">Yes</button>
                  <button type="button" className="rounded-[6px] bg-[#fef2f2] px-2.5 py-0.5 text-[11px] font-semibold text-[#b91c1c] hover:bg-[#fee2e2]">No</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Binary YES / NO buttons */}
      {isBinary && (
        <div className="flex gap-2 px-4 pb-3">
          <button type="button" className="flex-1 rounded-[10px] bg-[#f0fdf4] py-2 text-[13px] font-semibold text-[#15803d] transition-colors hover:bg-[#dcfce7]">
            Yes
          </button>
          <button type="button" className="flex-1 rounded-[10px] bg-[#fef2f2] py-2 text-[13px] font-semibold text-[#b91c1c] transition-colors hover:bg-[#fee2e2]">
            No
          </button>
        </div>
      )}

      {/* Footer: volume + live badge */}
      <div className="flex items-center justify-between border-t border-[#f5f5f5] px-4 py-2.5">
        <span className="text-[11px] text-[#9ca3af]">{fmtVol(m.volume)} Vol.</span>
        <div className="flex items-center gap-2">
          {m.live && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#dc2626]">
              <span className="size-1.5 rounded-full bg-[#dc2626]" />LIVE
            </span>
          )}
        </div>
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
        <div className="flex flex-col divide-y divide-[#f5f5f5] rounded-[16px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          {hedgeSuggestions.map((s) => (
            <HedgeRow key={s.id} s={s} />
          ))}
        </div>
      </Section>

      {/* Prediction markets */}
      <Section
        title="Prediction Markets"
        sub="Live markets. Trade the outcome directly or use as a hedge."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {marketEvents.map((m) => (
            <PolyCard key={m.id} m={m} />
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
