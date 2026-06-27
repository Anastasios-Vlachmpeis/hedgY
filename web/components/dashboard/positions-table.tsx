import * as React from "react";

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

/** Combined position — flex-col card so leg rows share the same column grid as the title row. */
function CombinedRow({ p }: { p: Position }) {
  const ratio =
    p.equityLeg && p.hedgeLeg
      ? Math.round((p.hedgeLeg.value / p.equityLeg.value) * 100)
      : 0;
  const pnlColor = p.pnl >= 0 ? "text-[#16a34a]" : "text-[#dc2626]";

  return (
    <li className="flex flex-col rounded-[10px] border border-[#ececec] bg-white px-3 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Title + total value / P&L */}
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#181925]">
          {p.title}
        </p>
        <div className="flex shrink-0 gap-3">
          <span className="hidden w-24 shrink-0 text-right text-[13px] font-semibold tabular-nums text-[#181925] sm:block">
            {usd(p.value, 0)}
          </span>
          <div className="w-24 shrink-0 text-right">
            <p className={cn("text-[13px] font-semibold tabular-nums", pnlColor)}>
              {signedUsd(p.pnl, 0)}
            </p>
            <p className={cn("text-[11px] tabular-nums", pnlColor)}>({pct(p.pnlPct)})</p>
          </div>
        </div>
      </div>

      <HedgeBar ratio={ratio} />

      {/* Equity leg — same gap-3 + w-24 columns, value lands under VALUE total */}
      {p.equityLeg && (
        <div className="mt-1.5 flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-[11px]">
            <span className="w-10 shrink-0 font-semibold text-[#181925]">Equity</span>
            <span className="truncate text-[#a3a3a3]">{p.equityLeg.label}</span>
          </div>
          <div className="flex shrink-0 gap-3">
            <span className="hidden w-24 shrink-0 text-right text-[11px] tabular-nums text-[#a3a3a3] sm:block">
              {usd(p.equityLeg.value, 0)}
            </span>
            <span className="w-24 shrink-0" />
          </div>
        </div>
      )}

      {/* Hedge leg */}
      {p.hedgeLeg && (
        <div className="mt-0.5 flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-[11px]">
            <span className="w-10 shrink-0 font-semibold text-[#181925]">Hedge</span>
            <span className="truncate text-[#a3a3a3]">{p.hedgeLeg.label}</span>
          </div>
          <div className="flex shrink-0 gap-3">
            <span className="hidden w-24 shrink-0 text-right text-[11px] tabular-nums text-[#a3a3a3] sm:block">
              {usd(p.hedgeLeg.value, 0)}
            </span>
            <span className="w-24 shrink-0" />
          </div>
        </div>
      )}
    </li>
  );
}

function SimpleRow({ p }: { p: Position }) {
  return (
    <li className="flex items-center gap-3 rounded-[10px] border border-[#ececec] bg-white px-3 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
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
function PositionsRows({
  positions,
  hideGroupHeaders = false,
}: {
  positions: Position[];
  hideGroupHeaders?: boolean;
}) {
  if (hideGroupHeaders) {
    return (
      <ul className="flex flex-col gap-2">
        {positions.map((p) =>
          p.type === "Combined" ? (
            <CombinedRow key={p.id} p={p} />
          ) : (
            <SimpleRow key={p.id} p={p} />
          ),
        )}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {GROUPS.map(({ type, label }) => {
        const items = positions.filter((p) => p.type === type);
        if (items.length === 0) return null;
        return (
          <div key={type}>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
              {label}
            </p>
            <ul className="flex flex-col gap-2">
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
