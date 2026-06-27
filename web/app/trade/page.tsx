"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowRight, Zap, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StockChart } from "@/components/trade/stock-chart";

/* ── helpers ── */
function fmtVol(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/* ── Stock tabs data ── */
const STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.",        emoji: "🍎" },
  { symbol: "NVDA", name: "NVIDIA Corp.",       emoji: "💚" },
  { symbol: "LMT",  name: "Lockheed Martin",   emoji: "🛡️" },
  { symbol: "MSFT", name: "Microsoft Corp.",    emoji: "🪟" },
  { symbol: "AMD",  name: "AMD Inc.",           emoji: "🔴" },
];

/* ── LMT risk markets ── */
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

const LMT_STATS = [
  { label: "Market cap",       value: "$118.4B" },
  { label: "P/E ratio",        value: "17.6x"   },
  { label: "52W range",        value: "418 – 619"},
  { label: "Dividend yield",   value: "2.54%"   },
  { label: "Beta (1Y)",        value: "0.78"     },
];

/* ── Compact risk row (Polymarket / Verso list style) ── */
function RiskRow({ r }: { r: (typeof LMT_RISKS)[0] }) {
  const pct     = Math.round(r.probability * 100);
  const bearish = r.impact === "bearish";
  return (
    <div className="border-b border-[#f5f5f5] py-3.5 last:border-0">
      <div className="flex items-start gap-2.5">
        <span className="mt-[1px] shrink-0 text-[15px]">{r.icon}</span>
        <p className="flex-1 text-[12px] font-semibold leading-snug text-[#0a0a0a]">
          {r.event}
        </p>
        <span
          className={cn(
            "shrink-0 text-[13px] font-bold tabular-nums",
            bearish ? "text-[#dc2626]" : "text-[#16a34a]",
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="mt-1.5 ml-[26px] flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#16a34a]">Yes {pct}¢</span>
        <span className="text-[11px] font-semibold text-[#dc2626]">No {100 - pct}¢</span>
        <span className="text-[10px] text-[#a3a3a3]">{fmtVol(r.volume)} vol</span>
        <Link
          href={`/structure?from=${r.hedgeFrom}`}
          className="ml-auto text-[11px] font-semibold text-[#0a0a0a] underline-offset-2 hover:underline"
        >
          Hedge →
        </Link>
      </div>
    </div>
  );
}

/* ── Mini sparkline SVG ── */
function Spark({ up }: { up: boolean }) {
  const W = 72, H = 28;
  const pts = up
    ? [4, 16, 10, 20, 8, 14, 18, 22, 14, 12, 24, 20, 22, 10, 32, 16, 28, 8, 38, 12, 36, 4, 46, 10, 42, 2, 52, 6, 48, 0, 58, 4, 56, 0, 68, 2]
    : [4, 4,  10, 0,  8, 8,  18, 4,  14, 12, 24, 8,  22, 16, 32, 12, 28, 20, 38, 16, 36, 22, 46, 18, 42, 24, 52, 20, 48, 26, 58, 22, 56, 27, 68, 26];
  const polyline = pts.reduce((acc, v, i) => acc + (i % 2 === 0 ? (i > 0 ? " " : "") + v : "," + v), "");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
      <polyline
        points={polyline}
        fill="none"
        stroke={up ? "#16a34a" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Bottom cards ── */
function PositionCard() {
  return (
    <div className="rounded-[14px] border border-[#ececec] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">
        Your position
      </p>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[18px] font-bold text-[#0a0a0a]">LMT</p>
          <p className="text-[11px] text-[#a3a3a3]">100 shares · Long</p>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-bold tabular-nums text-[#0a0a0a]">$50,740</p>
          <p className="text-[11px] text-[#a3a3a3]">≈ 10% of portfolio</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#f5f5f5] pt-4">
        <div>
          <p className="text-[10px] font-medium text-[#a3a3a3]">Avg. price</p>
          <p className="mt-0.5 text-[13px] font-semibold text-[#0a0a0a]">$507.40</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#a3a3a3]">Unrealized P&L</p>
          <p className="mt-0.5 text-[13px] font-semibold text-[#16a34a]">+$238 (+0.47%)</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#a3a3a3]">Volatility (1Y)</p>
          <p className="mt-0.5 text-[13px] font-semibold text-[#0a0a0a]">23.8%</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[#a3a3a3]">Sector weight</p>
          <p className="mt-0.5 text-[13px] font-semibold text-[#0a0a0a]">Defense</p>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-[9px] border border-[#e5e5e5] py-2 text-[12px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
      >
        Edit position
      </button>
    </div>
  );
}

function HedgeCard() {
  return (
    <div className="rounded-[14px] border border-[#ececec] bg-white p-5">
      <div className="flex items-center gap-1.5">
        <Zap className="size-3.5 text-[#f59e0b]" strokeWidth={2} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">
          Recommended hedge
        </p>
      </div>

      <div className="mt-3 flex items-start gap-4">
        <div className="flex flex-col items-center">
          <p className="text-[40px] font-bold leading-none tabular-nums tracking-tight text-[#0a0a0a]">
            0.58
          </p>
          <p className="mt-1 text-[10px] font-medium text-[#a3a3a3]">Hedge ratio</p>
        </div>
        <div className="flex-1 border-l border-[#f0f0f0] pl-4">
          <p className="text-[10px] text-[#a3a3a3]">You&apos;re protected if:</p>
          <p className="mt-1 text-[13px] font-semibold leading-snug text-[#0a0a0a]">
            Republicans win midterms (NO)
          </p>
          <span className="mt-1.5 inline-block rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#d97706]">
            43% probability
          </span>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-[1.6] text-[#737373]">
        This hedge reduces downside by ~43% based on historical correlation between LMT and election outcomes.
      </p>

      <Link
        href="/structure?from=defense-election"
        className="mt-3 flex items-center justify-center gap-2 rounded-[10px] bg-[#171B3B] py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Zap className="size-3.5" strokeWidth={2} />
        Apply hedge
      </Link>
    </div>
  );
}

function OutcomesCard() {
  return (
    <div className="rounded-[14px] border border-[#ececec] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">
        Projected outcomes
      </p>

      <div className="mt-3 flex flex-col gap-0">
        {/* Scenario A */}
        <div className="rounded-[10px] bg-[#f0fdf4] px-4 py-3.5">
          <p className="text-[10px] font-medium text-[#15803d]">
            If Republicans win (hedged) ✓
          </p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-[22px] font-bold tabular-nums leading-none text-[#15803d]">
                +$4,320
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#16a34a]">+8.5%</p>
            </div>
            <Spark up={true} />
          </div>
        </div>

        {/* Scenario B */}
        <div className="mt-2 rounded-[10px] bg-[#fff1f2] px-4 py-3.5">
          <p className="text-[10px] font-medium text-[#b91c1c]">
            If event does not happen
          </p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-[22px] font-bold tabular-nums leading-none text-[#dc2626]">
                -$1,230
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#ef4444]">-2.4%</p>
            </div>
            <Spark up={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard() {
  return (
    <div className="rounded-[14px] border border-[#ececec] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">
        Summary
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="text-[10px] font-medium text-[#a3a3a3]">Net cost</p>
          <p className="mt-1 text-[22px] font-bold tabular-nums text-[#0a0a0a]">
            $29,380
          </p>
        </div>
        <div className="border-t border-[#f5f5f5] pt-4">
          <p className="text-[10px] font-medium text-[#a3a3a3]">Potential return</p>
          <p className="mt-1 text-[22px] font-bold text-[#16a34a]">+14.2%</p>
        </div>
        <div className="border-t border-[#f5f5f5] pt-4">
          <p className="text-[10px] font-medium text-[#a3a3a3]">Max downside</p>
          <p className="mt-1 text-[15px] font-bold text-[#dc2626]">-2.4%</p>
          <p className="text-[10px] text-[#a3a3a3]">vs -8.7% unhedged</p>
        </div>
      </div>

      <Link
        href="/structure?from=defense-election"
        className="mt-4 flex items-center justify-between text-[12px] font-semibold text-[#0a0a0a] underline-offset-2 hover:underline"
      >
        View full analysis
        <ArrowRight className="size-3.5 shrink-0" strokeWidth={2} />
      </Link>
    </div>
  );
}

/* ── Page ── */
export default function TradePage() {
  const [active, setActive] = React.useState("LMT");

  return (
    <div className="flex flex-col gap-5 p-6">

      {/* Page title */}
      <div>
        <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#0a0a0a]">
          Build your hedged position
        </h1>
        <p className="mt-0.5 text-[12px] text-[#a3a3a3]">
          Combine stocks with prediction markets to limit your downside in one click.
        </p>
      </div>

      {/* Stock tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        {STOCKS.map((s) => (
          <button
            key={s.symbol}
            type="button"
            onClick={() => setActive(s.symbol)}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-[12px] border px-3.5 py-2.5 text-left transition-all duration-[150ms]",
              active === s.symbol
                ? "border-[#0a0a0a] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "border-[#ececec] bg-white hover:border-[#d4d4d4]",
            )}
          >
            <span className="text-[18px] leading-none">{s.emoji}</span>
            <div>
              <p
                className={cn(
                  "text-[12px] font-bold",
                  active === s.symbol ? "text-[#0a0a0a]" : "text-[#525252]",
                )}
              >
                {s.symbol}
              </p>
              <p className="text-[10px] text-[#a3a3a3]">{s.name}</p>
            </div>
          </button>
        ))}
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-[12px] border border-dashed border-[#d4d4d4] px-3.5 py-2.5 text-[11px] font-medium text-[#a3a3a3] transition-colors hover:border-[#a3a3a3] hover:text-[#737373]"
        >
          <Plus className="size-3" strokeWidth={2} />
          Add asset
        </button>
      </div>

      {/* Chart + Risk panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">

        {/* Left: chart */}
        <div className="flex flex-col gap-3">
          {/* Stock name row */}
          <div className="flex items-center gap-3 rounded-[12px] border border-[#ececec] bg-white px-4 py-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#f5f5f5] text-[16px]">
              🛡️
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#0a0a0a]">Lockheed Martin</p>
              <p className="text-[10px] text-[#a3a3a3]">LMT · NYSE · Defense &amp; Aerospace</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[16px] font-bold tabular-nums text-[#0a0a0a]">$507.40</p>
              <p className="text-[11px] font-medium text-[#16a34a]">+$2.38 (+0.47%)</p>
            </div>
          </div>

          {/* TradingView chart */}
          <StockChart className="border border-[#ececec]" />

          {/* Stats row */}
          <div className="grid grid-cols-5 divide-x divide-[#f0f0f0] overflow-hidden rounded-[12px] border border-[#ececec] bg-white">
            {LMT_STATS.map((s) => (
              <div key={s.label} className="px-4 py-3">
                <p className="text-[9.5px] font-medium uppercase tracking-[0.05em] text-[#a3a3a3]">
                  {s.label}
                </p>
                <p className="mt-0.5 text-[12px] font-semibold text-[#0a0a0a]">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: risk markets (compact rows) */}
        <div className="rounded-[14px] border border-[#ececec] bg-white">
          <div className="flex items-center justify-between border-b border-[#f5f5f5] px-5 py-3.5">
            <div>
              <h3 className="text-[13px] font-semibold text-[#0a0a0a]">Risk markets</h3>
              <p className="text-[10px] text-[#a3a3a3]">
                Prediction markets correlated with LMT
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#d97706]">
              <ShieldAlert className="size-2.5" strokeWidth={2} />
              3 risks
            </span>
          </div>

          <div className="px-5 py-1">
            {LMT_RISKS.map((r) => (
              <RiskRow key={r.id} r={r} />
            ))}
          </div>

          <div className="border-t border-[#f5f5f5] px-5 py-3">
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] font-medium text-[#737373] transition-colors hover:text-[#0a0a0a]"
            >
              Browse all risk markets
              <ArrowRight className="size-3" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 4 cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <PositionCard />
        <HedgeCard />
        <OutcomesCard />
        <SummaryCard />
      </div>
    </div>
  );
}
