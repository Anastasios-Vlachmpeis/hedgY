"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtUSD(n: number) {
  return `$${fmt(Math.abs(n))}`;
}

/* ── Portfolio data ─────────────────────────────────────────────────────── */
const POSITIONS = [
  {
    symbol: "LMT",
    name: "Lockheed Martin",
    shares: 100,
    avgPrice: 477.30,
    currentPrice: 507.10,
    sector: "Defense",
    hedgedBy: "Republicans win 2026 midterms",
    hedgeSide: "NO" as const,
    hedgeRatio: 0.58,
    hedgeCost: 1230,
    protectionPct: 62,
    hedgeProbability: 43,
  },
  {
    symbol: "NVDA",
    name: "Nvidia",
    shares: 50,
    avgPrice: 880.00,
    currentPrice: 131.40,
    sector: "Technology",
    hedgedBy: null,
    hedgeSide: null,
    hedgeRatio: null,
    hedgeCost: null,
    protectionPct: null,
    hedgeProbability: null,
  },
  {
    symbol: "AAPL",
    name: "Apple",
    shares: 200,
    avgPrice: 178.50,
    currentPrice: 201.20,
    sector: "Technology",
    hedgedBy: "US recession in 2026",
    hedgeSide: "NO" as const,
    hedgeRatio: 0.35,
    hedgeCost: 890,
    protectionPct: 41,
    hedgeProbability: 31,
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    shares: 75,
    avgPrice: 395.00,
    currentPrice: 452.60,
    sector: "Technology",
    hedgedBy: null,
    hedgeSide: null,
    hedgeRatio: null,
    hedgeCost: null,
    protectionPct: null,
    hedgeProbability: null,
  },
  {
    symbol: "AMD",
    name: "AMD",
    shares: 150,
    avgPrice: 158.00,
    currentPrice: 171.30,
    sector: "Semiconductors",
    hedgedBy: "More tech layoffs in 2026 than 2025",
    hedgeSide: "YES" as const,
    hedgeRatio: 0.40,
    hedgeCost: 640,
    protectionPct: 38,
    hedgeProbability: 66,
  },
];

function SymbolBadge({ symbol }: { symbol: string }) {
  const COLORS: Record<string, string> = {
    LMT: "#1B3A6B", NVDA: "#76B900", AAPL: "#555", MSFT: "#00A4EF", AMD: "#ED1C24",
  };
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tracking-tight text-white"
      style={{ background: COLORS[symbol] ?? "#0a0a0a" }}
    >
      {symbol.slice(0, 2)}
    </span>
  );
}

function PnlBadge({ value, pct }: { value: number; pct: number }) {
  const up = value >= 0;
  return (
    <span className={cn("text-right text-[13px] font-semibold", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
      {up ? "+" : "−"}{fmtUSD(Math.abs(value))}
      <span className="ml-1.5 text-[11px] opacity-75">
        ({up ? "+" : "−"}{Math.abs(pct).toFixed(1)}%)
      </span>
    </span>
  );
}

export default function PortfolioPage() {
  const [applied, setApplied] = React.useState<Record<string, boolean>>({});

  const positions = POSITIONS.map((p) => {
    const marketValue = p.shares * p.currentPrice;
    const pnl = (p.currentPrice - p.avgPrice) * p.shares;
    const pnlPct = ((p.currentPrice - p.avgPrice) / p.avgPrice) * 100;
    return { ...p, marketValue, pnl, pnlPct };
  });

  const totalValue = positions.reduce((s, p) => s + p.marketValue, 0);
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const totalPnlPct = (totalPnl / (totalValue - totalPnl)) * 100;
  const hedgedCount = positions.filter((p) => p.hedgedBy).length;
  const totalHedgeCost = positions.reduce((s, p) => s + (p.hedgeCost ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1200px] px-8 py-8">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#0a0a0a]">Portfolio</h1>
        <p className="mt-1 text-[13px] text-[#a3a3a3]">Your positions and active prediction market hedges.</p>
      </div>

      {/* ── Stats strip ────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          {
            label: "Total value",
            value: `$${fmt(totalValue)}`,
            sub: null,
            color: null,
          },
          {
            label: "Unrealized P&L",
            value: `${totalPnl >= 0 ? "+" : "−"}$${fmt(Math.abs(totalPnl))}`,
            sub: `${totalPnl >= 0 ? "+" : ""}${totalPnlPct.toFixed(1)}% all time`,
            color: totalPnl >= 0 ? "#16a34a" : "#dc2626",
          },
          {
            label: "Positions hedged",
            value: `${hedgedCount} / ${positions.length}`,
            sub: "via prediction markets",
            color: null,
          },
          {
            label: "Total hedge cost",
            value: `$${fmt(totalHedgeCost)}`,
            sub: `${((totalHedgeCost / totalValue) * 100).toFixed(2)}% of portfolio`,
            color: null,
          },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-[16px] border border-[#ececec] bg-white p-5">
            <div className="text-[11px] font-medium uppercase tracking-[0.07em] text-[#a3a3a3]">{label}</div>
            <div
              className="mt-2 text-[24px] font-bold tracking-[-0.02em]"
              style={{ color: color ?? "#0a0a0a" }}
            >
              {value}
            </div>
            {sub && <div className="mt-0.5 text-[11px] text-[#a3a3a3]">{sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Positions ──────────────────────────────────────────────── */}
      <div className="mb-6 rounded-[18px] border border-[#ececec] bg-white">
        <div className="border-b border-[#f0f0f0] px-6 py-4">
          <h2 className="text-[13px] font-semibold text-[#0a0a0a]">Open positions</h2>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 border-b border-[#f8f8f8] px-6 py-2.5">
          {["Asset", "Shares", "Avg price", "Current", "P&L", "Hedge"].map((h) => (
            <div key={h} className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">{h}</div>
          ))}
        </div>

        {positions.map((pos, i) => (
          <div
            key={pos.symbol}
            className={cn(
              "grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] items-center gap-4 px-6 py-4",
              i < positions.length - 1 && "border-b border-[#f8f8f8]",
            )}
          >
            {/* Asset */}
            <div className="flex items-center gap-3">
              <SymbolBadge symbol={pos.symbol} />
              <div>
                <div className="text-[13px] font-semibold text-[#0a0a0a]">{pos.symbol}</div>
                <div className="text-[11px] text-[#a3a3a3]">{pos.name}</div>
              </div>
            </div>

            {/* Shares */}
            <div className="text-[13px] text-[#0a0a0a]">{pos.shares}</div>

            {/* Avg price */}
            <div className="text-[13px] text-[#0a0a0a]">${fmt(pos.avgPrice)}</div>

            {/* Current */}
            <div className="text-[13px] font-semibold text-[#0a0a0a]">${fmt(pos.currentPrice)}</div>

            {/* P&L */}
            <PnlBadge value={pos.pnl} pct={pos.pnlPct} />

            {/* Hedge status */}
            {pos.hedgedBy ? (
              <span className="flex items-center gap-1.5 rounded-full bg-[#f0fdf4] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                <ShieldCheck className="size-3" />
                Hedged
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[11px] font-semibold text-[#a3a3a3]">
                <AlertTriangle className="size-3" />
                Unhedged
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Active hedges ──────────────────────────────────────────── */}
      <div className="rounded-[18px] border border-[#ececec] bg-white">
        <div className="border-b border-[#f0f0f0] px-6 py-4">
          <h2 className="text-[13px] font-semibold text-[#0a0a0a]">Active hedges</h2>
          <p className="mt-0.5 text-[11px] text-[#a3a3a3]">Prediction market positions protecting your equity holdings.</p>
        </div>

        {positions.filter((p) => p.hedgedBy).map((pos, i, arr) => (
          <div
            key={pos.symbol}
            className={cn(
              "grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-5",
              i < arr.length - 1 && "border-b border-[#f8f8f8]",
            )}
          >
            {/* Protecting */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Protecting</div>
              <div className="mt-1 flex items-center gap-2">
                <SymbolBadge symbol={pos.symbol} />
                <div>
                  <div className="text-[13px] font-semibold text-[#0a0a0a]">{pos.symbol}</div>
                  <div className="text-[11px] text-[#a3a3a3]">{fmtUSD(pos.marketValue)} position</div>
                </div>
              </div>
            </div>

            {/* Market */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Market</div>
              <div className="mt-1 text-[12px] font-medium leading-snug text-[#0a0a0a]">{pos.hedgedBy}</div>
            </div>

            {/* Side */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Side</div>
              <div className={cn("mt-1 text-[13px] font-bold", pos.hedgeSide === "YES" ? "text-[#16a34a]" : "text-[#dc2626]")}>
                {pos.hedgeSide}
              </div>
            </div>

            {/* Probability */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Probability</div>
              <div className="mt-1 text-[13px] font-semibold text-[#0a0a0a]">{pos.hedgeProbability}%</div>
            </div>

            {/* Protection */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Protection</div>
              <div className="mt-1 text-[13px] font-semibold text-[#16a34a]">~{pos.protectionPct}%</div>
            </div>

            {/* Cost */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Cost</div>
              <div className="mt-1 text-[13px] font-semibold text-[#0a0a0a]">{fmtUSD(pos.hedgeCost!)}</div>
            </div>
          </div>
        ))}

        {/* Unhedged positions nudge */}
        {positions.filter((p) => !p.hedgedBy).length > 0 && (
          <div className="border-t border-[#f8f8f8] px-6 py-4">
            <div className="flex items-center justify-between rounded-[12px] bg-[#fafafa] px-4 py-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-4 text-[#a3a3a3]" />
                <span className="text-[12px] text-[#737373]">
                  {positions.filter((p) => !p.hedgedBy).map((p) => p.symbol).join(", ")} are unhedged — consider adding a prediction market hedge.
                </span>
              </div>
              <a
                href="/dashboard"
                className="flex items-center gap-1 text-[12px] font-semibold text-[#0a0a0a] hover:underline"
              >
                Go to dashboard <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
