"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

import { cn } from "@/lib/utils";
import { usd, signedUsd, pct } from "@/lib/format";
import type { Exposure, Portfolio, PortfolioPoint } from "@/lib/mockData";

const EXPOSURE_COLORS: Record<string, string> = {
  Equities: "#9580ff",
  "Prediction Markets": "#b3a6ff",
  Derivatives: "#cdbcff",
  Bonds: "#c9c9d4",
};

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "up" | "down";
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-[16px] font-semibold tabular-nums",
          tone === "default" && "text-[#181925]",
          tone === "up" && "text-[#16a34a]",
          tone === "down" && "text-[#dc2626]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PortfolioOverview({
  portfolio,
  series,
  exposure,
}: {
  portfolio: Portfolio;
  series: PortfolioPoint[];
  exposure: Exposure[];
}) {
  const up = portfolio.dayChange >= 0;

  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          Portfolio value
        </p>
        <p className="mt-0.5 text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#181925]">
          {usd(portfolio.totalValue)}
        </p>
        <div
          className={cn(
            "mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium tabular-nums",
            up ? "text-[#16a34a]" : "text-[#dc2626]",
          )}
        >
          <span>{signedUsd(portfolio.dayChange)}</span>
          <span>({pct(portfolio.dayChangePct)})</span>
          <span className="text-[#a3a3a3]">today</span>
        </div>
      </div>

      {/* Equity curve */}
      <div className="mt-3 h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9580ff" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#9580ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={["dataMin - 1500", "dataMax + 1500"]} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#9580ff"
              strokeWidth={2}
              fill="url(#pv)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stat tiles — plain, lined up */}
      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#f0f0f0] pt-3 sm:grid-cols-4">
        <StatTile label="Net Liquidity" value={usd(portfolio.totalValue, 0)} />
        <StatTile
          label="Day P/L"
          value={signedUsd(portfolio.dayChange, 0)}
          tone={up ? "up" : "down"}
        />
        <StatTile label="Buying Power" value={usd(portfolio.buyingPower, 0)} />
        <StatTile label="Positions" value={String(portfolio.positionsCount)} />
      </div>

      {/* Exposure */}
      <div className="mt-3 border-t border-[#f0f0f0] pt-3">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          Exposure
        </p>
        <div className="flex h-2 overflow-hidden rounded-full">
          {exposure.map((e) => (
            <div
              key={e.label}
              style={{ width: `${e.pct}%`, background: EXPOSURE_COLORS[e.label] }}
              className="h-full"
            />
          ))}
        </div>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
          {exposure.map((e) => (
            <li key={e.label} className="flex items-center gap-1.5 text-[11px]">
              <span
                className="size-2 rounded-full"
                style={{ background: EXPOSURE_COLORS[e.label] }}
              />
              <span className="text-[#666666]">{e.label}</span>
              <span className="ml-auto font-medium tabular-nums text-[#181925]">
                {e.pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export { PortfolioOverview };
