"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ArrowRight, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { usd, signedUsd, pct } from "@/lib/format";
import type { Portfolio, PlatformBreakdown } from "@/lib/mockData";

type FilterKey = "Combined" | "Equity" | "Prediction";

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red";
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 first:pl-0">
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#94A3B8]">{label}</span>
      <span
        className={cn(
          "text-[18px] font-bold tabular-nums tracking-[-0.01em]",
          tone === "green" ? "text-[#16A34A]" : tone === "red" ? "text-[#EF4444]" : "text-[#0F172A]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function CategoryCard({
  row,
  totalValue,
  onSelect,
}: {
  row: PlatformBreakdown;
  totalValue: number;
  onSelect?: (key: FilterKey) => void;
}) {
  const share = totalValue > 0 ? (row.value / totalValue) * 100 : 0;
  const up = row.pnl >= 0;
  const clickable = !!onSelect && row.key != null && row.key !== "Cash";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="mt-0.5 size-3 shrink-0 rounded-[4px]" style={{ background: row.color }} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-[#0F172A]">{row.platform}</p>
            <p className="truncate text-[11px] font-medium text-[#94A3B8]">{row.kind}</p>
          </div>
        </div>
        {row.count != null && (
          <span className="shrink-0 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#64748B]">
            {row.count} {row.count === 1 ? "pos" : "pos"}
          </span>
        )}
      </div>

      <p className="mt-3 text-[24px] font-bold leading-none tracking-[-0.02em] tabular-nums text-[#0F172A]">
        {usd(row.value, 0)}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEF1F6]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${share.toFixed(1)}%`, background: row.color }}
          />
        </div>
        <span className="w-11 shrink-0 text-right text-[12px] font-semibold tabular-nums text-[#64748B]">
          {share.toFixed(1)}%
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#EEF1F6] pt-2.5">
        <span className="text-[11px] font-medium text-[#94A3B8]">Unrealized P&amp;L</span>
        {row.pnl !== 0 ? (
          <span className={cn("text-[13px] font-bold tabular-nums", up ? "text-[#16A34A]" : "text-[#EF4444]")}>
            {signedUsd(row.pnl, 0)} <span className="font-semibold">({pct(row.pnlPct)})</span>
          </span>
        ) : (
          <span className="text-[13px] font-semibold tabular-nums text-[#94A3B8]">—</span>
        )}
      </div>

      {clickable && (
        <span className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#4F8DFF] opacity-0 transition-opacity group-hover:opacity-100">
          View positions <ArrowRight className="size-3.5" />
        </span>
      )}
    </>
  );

  const cardClass =
    "flex flex-col rounded-[16px] border bg-white p-4 text-left transition-all duration-150";

  if (clickable) {
    return (
      <button
        type="button"
        onClick={() => onSelect!(row.key as FilterKey)}
        className={cn(cardClass, "group border-[#E7EAF0] hover:-translate-y-0.5 hover:border-[#C7D2E5] hover:shadow-[0_10px_28px_-14px_rgba(15,23,42,0.25)]")}
      >
        {inner}
      </button>
    );
  }
  return <div className={cn(cardClass, "border-[#E7EAF0]")}>{inner}</div>;
}

export function BreakdownModal({
  open,
  onClose,
  portfolio,
  breakdown,
  onSelectType,
}: {
  open: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  breakdown: PlatformBreakdown[];
  onSelectType?: (key: FilterKey) => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const total = portfolio.totalValue;
  const slices = breakdown.filter((b) => b.value > 0);
  const totalPnl = breakdown.reduce((s, b) => s + b.pnl, 0);

  const pick = (key: FilterKey) => {
    onSelectType?.(key);
    onClose();
  };

  return (
    <div
      className="scrim-in fixed inset-0 z-[100] flex items-end justify-center bg-[#0F172A]/35 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-in flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[22px] border border-[#E7EAF0] bg-white shadow-[0_30px_90px_-30px_rgba(15,23,42,0.45)] sm:rounded-[22px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF1F6] px-6 py-5">
          <div>
            <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#0F172A]">Portfolio breakdown</h2>
            <p className="mt-0.5 text-[12.5px] font-medium text-[#94A3B8]">
              Allocation and unrealized P&amp;L by position type
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] transition-colors hover:bg-[#E2E8F0] hover:text-[#0F172A]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* summary strip */}
        <div className="flex flex-wrap items-stretch divide-x divide-[#EEF1F6] border-b border-[#EEF1F6] px-6 py-1">
          <Stat label="Total value" value={usd(total, 0)} />
          <Stat
            label="Unrealized P&L"
            value={signedUsd(totalPnl, 0)}
            tone={totalPnl > 0 ? "green" : totalPnl < 0 ? "red" : "neutral"}
          />
          <Stat label="Cash" value={usd(portfolio.cash, 0)} />
          <Stat label="Positions" value={String(portfolio.positionsCount)} />
        </div>

        {/* body */}
        <div className="grid grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[300px_1fr]">
          {/* donut */}
          <div className="flex flex-col items-center">
            <div className="relative h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="platform"
                    innerRadius={72}
                    outerRadius={104}
                    paddingAngle={slices.length > 1 ? 2 : 0}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {slices.map((s) => (
                      <Cell key={s.platform} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Total</span>
                <span className="text-[22px] font-bold tabular-nums tracking-[-0.02em] text-[#0F172A]">
                  {usd(total, 0)}
                </span>
              </div>
            </div>
            <ul className="mt-3 flex w-full flex-col gap-1.5">
              {breakdown.map((b) => {
                const share = total > 0 ? (b.value / total) * 100 : 0;
                return (
                  <li key={b.platform} className="flex items-center gap-2 text-[12px]">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: b.color }} />
                    <span className="min-w-0 flex-1 truncate font-medium text-[#475569]">{b.platform}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-[#0F172A]">{share.toFixed(1)}%</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* category cards */}
          {breakdown.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {breakdown.map((row) => (
                <CategoryCard key={row.platform} row={row} totalValue={total} onSelect={onSelectType ? pick : undefined} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#E7EAF0] text-center">
              <p className="text-[14px] font-semibold text-[#0F172A]">No positions or cash yet</p>
              <p className="mt-1 text-[12px] text-[#94A3B8]">Deposit and trade to build your allocation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
