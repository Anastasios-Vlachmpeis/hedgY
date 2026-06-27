import * as React from "react";
import { Shield, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { usd, signedUsd, pct } from "@/lib/format";
import type { Position } from "@/lib/mockData";

function ValuePnl({ p }: { p: Position }) {
  const up = p.pnl >= 0;
  const pnlColor = up ? "text-[#16a34a]" : "text-[#dc2626]";
  return (
    <>
      <span className="hidden w-24 shrink-0 text-right text-[13px] font-semibold tabular-nums text-[#181925] sm:block">
        {usd(p.value, 0)}
      </span>
      <div className="w-24 shrink-0 text-right">
        <p className={cn("text-[13px] font-semibold tabular-nums", pnlColor)}>
          {signedUsd(p.pnl, 0)}
        </p>
        <p className={cn("text-[11px] tabular-nums", pnlColor)}>({pct(p.pnlPct)})</p>
      </div>
    </>
  );
}

/** Two-segment bar: grey equity portion + violet hedge portion. */
function HedgeBar({ ratio }: { ratio: number }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      <span className="flex h-1.5 w-20 shrink-0 overflow-hidden rounded-full">
        <span className="h-full bg-[#d4d4d4]" style={{ width: `${100 - ratio}%` }} />
        <span className="h-full bg-[#9580ff]" style={{ width: `${ratio}%` }} />
      </span>
      <span className="text-[11px] tabular-nums text-[#a3a3a3]">
        {ratio}% hedged
      </span>
    </div>
  );
}

/** Combined position. Headline = total + P&L; legs are a quiet sub-detail. */
function CombinedRow({ p }: { p: Position }) {
  // hedge proportion derived from the leg amounts (hedge relative to equity).
  const ratio =
    p.equityLeg && p.hedgeLeg
      ? Math.round((p.hedgeLeg.value / p.equityLeg.value) * 100)
      : 0;
  return (
    <li className="flex items-start gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[#181925]">
          {p.title}
        </p>

        <HedgeBar ratio={ratio} />

        {/* quiet leg breakdown — supporting evidence, not headlines */}
        <div className="mt-1.5 flex flex-col gap-0.5 rounded-[6px] bg-[#fafafa] px-2 py-1">
          {p.equityLeg && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <TrendingUp className="size-3 shrink-0 text-[#16a34a]" />
              <span className="w-10 shrink-0 text-[#666666]">Equity</span>
              <span className="truncate text-[#666666]">{p.equityLeg.label}</span>
              <span className="ml-auto shrink-0 tabular-nums text-[#a3a3a3]">
                {usd(p.equityLeg.value, 0)}
              </span>
            </div>
          )}
          {p.hedgeLeg && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <Shield className="size-3 shrink-0 text-[#9580ff]" />
              <span className="w-10 shrink-0 text-[#666666]">Hedge</span>
              <span className="truncate text-[#666666]">{p.hedgeLeg.label}</span>
              <span className="ml-auto shrink-0 tabular-nums text-[#a3a3a3]">
                {usd(p.hedgeLeg.value, 0)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-0.5 flex shrink-0 items-start gap-3">
        <ValuePnl p={p} />
      </div>
    </li>
  );
}

function SimpleRow({ p }: { p: Position }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[#181925]">{p.title}</p>
        <p className="truncate text-[11px] text-[#a3a3a3]">{p.detail}</p>
      </div>
      <ValuePnl p={p} />
    </li>
  );
}

const GROUPS: Array<{ type: Position["type"]; label: string }> = [
  { type: "Combined", label: "Combined positions" },
  { type: "Equity", label: "Equities" },
  { type: "Prediction", label: "Predictions" },
];

/** Grouped list (Combined / Equities / Predictions). */
function PositionsRows({ positions }: { positions: Position[] }) {
  return (
    <div className="flex flex-col">
      {GROUPS.map(({ type, label }) => {
        const items = positions.filter((p) => p.type === type);
        if (items.length === 0) return null;
        return (
          <div key={type} className="mt-3 first:mt-1">
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
              {label}
            </p>
            <ul className="divide-y divide-[#f0f0f0]">
              {items.map((p) =>
                type === "Combined" ? (
                  <CombinedRow key={p.id} p={p} />
                ) : (
                  <SimpleRow key={p.id} p={p} />
                ),
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** Standalone card (kept for reuse). */
function PositionsTable({ positions }: { positions: Position[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          Positions
        </h2>
        <span className="text-[11px] tabular-nums text-[#a3a3a3]">
          {positions.length} open
        </span>
      </div>
      <PositionsRows positions={positions} />
    </section>
  );
}

export { PositionsTable, PositionsRows };
