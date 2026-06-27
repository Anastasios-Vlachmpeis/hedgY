import * as React from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

/* ---------- Sparkline ---------- */

function Sparkline({
  className,
  stroke = "#16a34a",
}: {
  className?: string;
  stroke?: string;
}) {
  // Static illustrative path — gently rising.
  const d = "M0 22 L10 19 L20 21 L30 14 L40 16 L50 9 L60 11 L70 5 L80 7";
  return (
    <svg viewBox="0 0 80 26" className={cn("h-7 w-20", className)} fill="none">
      <path d={d} stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Stock tile ---------- */

function StockTile({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-[210px] rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#f5f5f5] text-[12px] font-semibold text-[#181925]">
            LMT
          </span>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-[#181925]">Lockheed Martin</p>
            <p className="text-[12px] text-[#a3a3a3]">Equity · NYSE</p>
          </div>
        </div>
        <Sparkline />
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="font-mono text-[22px] font-bold tracking-[-0.02em] text-[#181925]">
          $471.20
        </span>
        <span className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[#16a34a]">
          <ArrowUpRight className="size-3.5" /> 1.2%
        </span>
      </div>
    </div>
  );
}

/* ---------- Prediction-market tile ---------- */

function PredictionTile({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-[210px] rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#f3f1ff] px-2 py-0.5 text-[11px] font-medium text-[#9580ff]">
          Prediction
        </span>
        <span className="text-[11px] text-[#a3a3a3]">Kalshi · Polymarket</span>
      </div>
      <p className="mt-2.5 text-[14px] font-semibold leading-snug text-[#181925]">
        Incumbent wins re-election?
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[22px] font-bold tracking-[-0.02em] text-[#181925]">
          43%
        </span>
        <span className="text-[12px] text-[#666666]">implied YES</span>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#ececec]">
        <div className="h-full rounded-full bg-[#9580ff]" style={{ width: "43%" }} />
      </div>
    </div>
  );
}

/* ---------- Basket Builder (centerpiece) ---------- */

function LegRow({
  badge,
  badgeClass,
  title,
  sub,
  weight,
  amount,
}: {
  badge: string;
  badgeClass: string;
  title: string;
  sub: string;
  weight: string;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[#f6f6f7] px-3.5 py-3">
      <div className="flex items-center gap-3">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", badgeClass)}>
          {badge}
        </span>
        <div className="leading-tight">
          <p className="text-[13.5px] font-semibold text-[#181925]">{title}</p>
          <p className="text-[12px] text-[#737373]">{sub}</p>
        </div>
      </div>
      <div className="text-right leading-tight">
        <p className="font-mono text-[13.5px] font-semibold text-[#181925]">{weight}</p>
        <p className="font-mono text-[12px] text-[#737373]">{amount}</p>
      </div>
    </div>
  );
}

function BasketBuilderCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-[420px] max-w-full rounded-[24px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.02)]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#9580ff]" />
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#666666]">
            Basket Builder
          </span>
        </div>
        <span className="rounded-full bg-[#f3f1ff] px-2.5 py-0.5 text-[11px] font-medium text-[#9580ff]">
          Combined position
        </span>
      </div>

      <p className="mt-3 text-[15px] font-semibold text-[#181925]">
        Long defense, hedge the election
      </p>

      <div className="mt-4 flex flex-col gap-2.5">
        <LegRow
          badge="LONG"
          badgeClass="bg-[#dcfce7] text-[#16a34a]"
          title="Defense basket"
          sub="LMT · RTX · NOC"
          weight="60%"
          amount="$6,000"
        />
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f5ff] px-3 py-1 text-[11px] font-medium text-[#9580ff]">
            <TrendingUp className="size-3.5" strokeWidth={1.9} /> hedge ratio 0.67
          </span>
        </div>
        <LegRow
          badge="NO"
          badgeClass="bg-[#f3f1ff] text-[#9580ff]"
          title="Incumbent wins"
          sub="Prediction hedge · Kalshi"
          weight="40%"
          amount="$4,000"
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#f0f0f0] pt-4">
        <span className="text-[13px] text-[#666666]">Net cost</span>
        <span className="font-mono text-[18px] font-bold tracking-[-0.02em] text-[#181925]">
          $10,000.00
        </span>
      </div>
    </div>
  );
}

export { StockTile, PredictionTile, BasketBuilderCard, Sparkline };
