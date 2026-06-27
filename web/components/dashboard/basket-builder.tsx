"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { usd } from "@/lib/format";
import type { CombinedPosition } from "@/lib/mockData";

function LegCard({
  badge,
  badgeClass,
  title,
  sub,
  size,
}: {
  badge: string;
  badgeClass: string;
  title: string;
  sub: string;
  size: number;
}) {
  return (
    <div className="rounded-[10px] bg-[#20212e] p-3">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClass}`}
        >
          {badge}
        </span>
        <span className="font-mono text-[14px] font-semibold text-white">
          {usd(size, 0)}
        </span>
      </div>
      <p className="mt-2 text-[14px] font-semibold text-white">{title}</p>
      <p className="text-[12px] text-[#a3a3a3]">{sub}</p>
    </div>
  );
}

function BasketBuilder({
  position,
  hedgeRatio,
  hedgeSize,
  onHedgeRatioChange,
}: {
  position: CombinedPosition;
  hedgeRatio: number; // 0–1
  hedgeSize: number;
  onHedgeRatioChange: (ratio: number) => void;
}) {
  const pctValue = Math.round(hedgeRatio * 100);

  return (
    <div className="flex flex-col gap-3">
      {/* Thesis */}
      <div>
        <label className="text-[11px] font-medium uppercase tracking-wider text-[#a3a3a3]">
          Thesis
        </label>
        <input
          readOnly
          value={position.thesis}
          className="mt-1.5 w-full rounded-[10px] bg-[#20212e] px-3.5 py-2.5 text-[14px] font-medium text-white outline-none ring-1 ring-white/[0.06] focus:ring-[#9580ff]/50"
        />
      </div>

      {/* Legs */}
      <LegCard
        badge="Equity · Long"
        badgeClass="bg-[#3fb950]/15 text-[#3fb950]"
        title={`${position.equityLeg.label} (${position.equityLeg.symbols.join(" · ")})`}
        sub="Aggregated across Alpaca · IBKR"
        size={position.equityLeg.size}
      />
      <LegCard
        badge={`Prediction · Buy ${position.hedgeLeg.side}`}
        badgeClass="bg-[#9580ff]/20 text-[#b3a6ff]"
        title={`${position.hedgeLeg.label} @ ${Math.round(position.hedgeLeg.marketPrice * 100)}%`}
        sub="Hedge leg · Kalshi · Polymarket"
        size={hedgeSize}
      />

      {/* Hedge ratio slider */}
      <div className="mt-1 rounded-[10px] bg-[#20212e] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#a3a3a3]">Hedge ratio</span>
          <span className="font-mono text-[15px] font-semibold text-[#b3a6ff]">
            {pctValue}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={pctValue}
          onChange={(e) => onHedgeRatioChange(Number(e.target.value) / 100)}
          aria-label="Hedge ratio"
          className="mt-2.5 w-full cursor-pointer accent-[#9580ff]"
        />
      </div>

      {/* Add leg (visual only) */}
      <button
        type="button"
        className="flex items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-white/15 py-2.5 text-[13px] font-medium text-[#a3a3a3] transition-colors hover:border-[#9580ff]/40 hover:text-white"
      >
        <Plus className="size-4" /> Add leg
      </button>
    </div>
  );
}

export { BasketBuilder };
