"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { usd, signedUsd, pct } from "@/lib/format";
import {
  pnlTimeframes,
  timeframeOrder,
  type Portfolio,
} from "@/lib/mockData";

const DEPOSIT_AMOUNT = 1000;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        {label}
      </p>
      <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-[#181925]">
        {value}
      </p>
    </div>
  );
}

const CARD =
  "rounded-[14px] border border-[#ececec] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

function AccountHeader({ portfolio }: { portfolio: Portfolio }) {
  const router = useRouter();
  const [tf, setTf] = React.useState<(typeof timeframeOrder)[number]>("1D");
  const [depositing, setDepositing] = React.useState(false);
  const data = pnlTimeframes[tf];
  const up = data.change >= 0;
  const dayUp = portfolio.dayChange >= 0;

  async function deposit() {
    setDepositing(true);
    try {
      await fetch("/api/account/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: DEPOSIT_AMOUNT }),
      });
      router.refresh();
    } finally {
      setDepositing(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Summary card */}
      <section className={CARD}>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          Portfolio value
        </p>
        <p className="mt-0.5 text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#181925]">
          {usd(portfolio.totalValue)}
        </p>
        <div
          className={cn(
            "mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium tabular-nums",
            dayUp ? "text-[#16a34a]" : "text-[#dc2626]",
          )}
        >
          <span>{signedUsd(portfolio.dayChange)}</span>
          <span>({pct(portfolio.dayChangePct)})</span>
          <span className="text-[#a3a3a3]">today</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#f0f0f0] pt-4">
          <Stat label="Net Liquidity" value={usd(portfolio.totalValue, 0)} />
          <Stat label="Buying Power" value={usd(portfolio.buyingPower, 0)} />
          <Stat label="Positions" value={String(portfolio.positionsCount)} />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={deposit}
            disabled={depositing}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#9580ff] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#a99bff] disabled:opacity-70"
          >
            {depositing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowDownToLine className="size-4" />
            )}
            Deposit $1,000
          </button>
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#f5f5f5] py-2.5 text-[14px] font-medium text-[#181925] transition-colors hover:bg-[#ececec]"
          >
            <ArrowUpFromLine className="size-4" /> Withdraw
          </button>
        </div>
      </section>

      {/* Profit / Loss card */}
      <section className={CARD}>
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
            Profit / Loss
          </p>
          <div className="flex gap-0.5">
            {timeframeOrder.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTf(t)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[12px] font-medium tabular-nums transition-colors",
                  t === tf
                    ? "bg-[#181925] text-white"
                    : "text-[#666666] hover:bg-[#f5f5f5]",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <p
          className={cn(
            "mt-1 text-[30px] font-bold leading-none tracking-[-0.02em] tabular-nums",
            up ? "text-[#16a34a]" : "text-[#dc2626]",
          )}
        >
          {signedUsd(data.change, 0)}
        </p>
        <p
          className={cn(
            "mt-1 text-[13px] font-medium tabular-nums",
            up ? "text-[#16a34a]" : "text-[#dc2626]",
          )}
        >
          {pct(data.pct)} <span className="text-[#a3a3a3]">· past {tf}</span>
        </p>

        <div className="mt-3 h-[96px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="pnl" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={up ? "#16a34a" : "#dc2626"}
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="100%"
                    stopColor={up ? "#16a34a" : "#dc2626"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <YAxis domain={["dataMin", "dataMax"]} hide />
              <Area
                type="monotone"
                dataKey="value"
                stroke={up ? "#16a34a" : "#dc2626"}
                strokeWidth={2}
                fill="url(#pnl)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export { AccountHeader };
