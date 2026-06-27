"use client";

import * as React from "react";
import { Zap } from "lucide-react";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { usd, signedUsd } from "@/lib/format";
import type { PayoffPoint, PreviewResult } from "@/lib/mockData";

function StatRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "up" | "down" | "accent";
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[12px] text-[#a3a3a3]">{label}</span>
      <span
        className={cn(
          "font-mono text-[14px] font-semibold tabular-nums",
          tone === "default" && "text-white",
          tone === "up" && "text-[#3fb950]",
          tone === "down" && "text-[#f85149]",
          tone === "accent" && "text-[#b3a6ff]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** Combined P&L across the two election outcomes — the "specialised graph". */
function PayoffChart({ payoff }: { payoff: PayoffPoint[] }) {
  return (
    <div className="h-[116px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={payoff} margin={{ top: 8, right: 6, bottom: 0, left: 6 }}>
          <defs>
            <linearGradient id="payoff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9580ff" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#9580ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="scenario"
            tick={{ fill: "#a3a3a3", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            height={14}
          />
          <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3" />
          {/* unhedged reference */}
          <Line
            type="monotone"
            dataKey="unhedged"
            stroke="#6b6b76"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
          {/* hedged combined position */}
          <Area
            type="monotone"
            dataKey="hedged"
            stroke="#9580ff"
            strokeWidth={2.25}
            fill="url(#payoff)"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function PositionPreview({
  preview,
  payoff,
  summary,
  onExecute,
}: {
  preview: PreviewResult;
  payoff: PayoffPoint[];
  summary: string;
  onExecute: () => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Payoff / scenario chart */}
      <div className="rounded-[10px] bg-[#20212e] p-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-medium text-[#a3a3a3]">
            Combined P&amp;L by outcome
          </span>
          <span className="flex items-center gap-2 text-[10px] text-[#a3a3a3]">
            <span className="flex items-center gap-1">
              <span className="h-0.5 w-3 rounded bg-[#9580ff]" /> hedged
            </span>
            <span className="flex items-center gap-1">
              <span className="h-0.5 w-3 rounded bg-[#6b6b76]" /> unhedged
            </span>
          </span>
        </div>
        <PayoffChart payoff={payoff} />
      </div>

      {/* Stat rows */}
      <div className="divide-y divide-white/[0.06] rounded-[10px] bg-[#20212e] px-3.5">
        <StatRow label="Net cost" value={usd(preview.netCost, 0)} />
        <StatRow label="Max gain" value={signedUsd(preview.maxGain, 0)} tone="up" />
        <StatRow label="Max loss" value={signedUsd(preview.maxLoss, 0)} tone="down" />
        <StatRow
          label="Hedge ratio"
          value={`${Math.round(preview.hedgeRatio * 100)}%`}
          tone="accent"
        />
      </div>

      <p className="text-[12px] leading-[1.5] text-[#a3a3a3]">{summary}</p>

      <button
        type="button"
        onClick={onExecute}
        className="mt-0.5 flex items-center justify-center gap-2 rounded-full bg-[#9580ff] py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[#a99bff] active:translate-y-px"
      >
        <Zap className="size-4" /> Execute combined position
      </button>
    </div>
  );
}

export { PositionPreview };
