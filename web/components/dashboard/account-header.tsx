"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowDownToLine, ArrowUpFromLine, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { usd, signedUsd, pct } from "@/lib/format";
import {
  pnlTimeframes,
  timeframeOrder,
  platformBreakdown,
  type Portfolio,
  type PlatformBreakdown,
} from "@/lib/mockData";

const CARD =
  "rounded-[14px] border border-[#ececec] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

/* ── "Full breakdown ›" pill ── */
function BreakdownButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex shrink-0 items-center gap-1 rounded-full bg-[#f5f5f5] px-3 py-1.5 text-[12px] font-medium text-[#737373] transition-colors hover:bg-[#ececec] hover:text-[#181925]"
    >
      Full breakdown
      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
    </button>
  );
}

/* ── Generic slide-up modal backdrop ── */
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-t-[22px] bg-white p-6 shadow-xl sm:rounded-[22px]">
        {children}
      </div>
    </div>
  );
}

/* ── Platform row in the breakdown modal ── */
function PlatformRow({ p, totalValue }: { p: PlatformBreakdown; totalValue: number }) {
  const share = totalValue > 0 ? (p.value / totalValue) * 100 : 0;
  const pnlUp = p.pnl >= 0;
  return (
    <div className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0 [&+&]:border-t [&+&]:border-[#f0f0f0]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#181925]">{p.platform}</p>
          <p className="text-[11px] text-[#a3a3a3]">{p.kind}</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-semibold tabular-nums text-[#181925]">{usd(p.value, 0)}</p>
          {p.pnl !== 0 && (
            <p className={cn("text-[11px] tabular-nums", pnlUp ? "text-[#16a34a]" : "text-[#dc2626]")}>
              {signedUsd(p.pnl, 0)} ({pct(p.pnlPct)}) today
            </p>
          )}
        </div>
      </div>
      {/* Allocation bar */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${share.toFixed(1)}%`, backgroundColor: p.color }}
          />
        </div>
        <span className="w-10 text-right text-[11px] tabular-nums text-[#a3a3a3]">
          {share.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

/* ── Portfolio value breakdown modal ── */
function ValueBreakdownModal({ open, onClose, totalValue }: { open: boolean; onClose: () => void; totalValue: number }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-[#181925]">Portfolio breakdown</h2>
          <p className="mt-0.5 text-[12.5px] text-[#737373]">Value by connected platform</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f5f5] text-[#737373] transition-colors hover:bg-[#ececec] hover:text-[#181925]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div>
        {platformBreakdown.map((p) => (
          <PlatformRow key={p.platform} p={p} totalValue={totalValue} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-4">
        <span className="text-[12px] font-medium uppercase tracking-wide text-[#a3a3a3]">Total</span>
        <span className="text-[15px] font-bold tabular-nums text-[#181925]">{usd(totalValue)}</span>
      </div>
    </Modal>
  );
}

/* ── P&L breakdown modal ── */
function PnlBreakdownModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-[#181925]">P&amp;L breakdown</h2>
          <p className="mt-0.5 text-[12.5px] text-[#737373]">Today's P&amp;L by platform</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f5f5] text-[#737373] transition-colors hover:bg-[#ececec] hover:text-[#181925]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div>
        {platformBreakdown.filter((p) => p.pnl !== 0).map((p) => {
          const up = p.pnl >= 0;
          return (
            <div
              key={p.platform}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 [&+&]:border-t [&+&]:border-[#f0f0f0]"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <div>
                  <p className="text-[13px] font-semibold text-[#181925]">{p.platform}</p>
                  <p className="text-[11px] text-[#a3a3a3]">{p.kind}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-[13px] font-semibold tabular-nums", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
                  {signedUsd(p.pnl, 0)}
                </p>
                <p className={cn("text-[11px] tabular-nums", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
                  {pct(p.pnlPct)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-4">
        <span className="text-[12px] font-medium uppercase tracking-wide text-[#a3a3a3]">Total today</span>
        <div className="text-right">
          <span className="text-[15px] font-bold tabular-nums text-[#16a34a]">
            {signedUsd(platformBreakdown.reduce((s, p) => s + p.pnl, 0), 0)}
          </span>
        </div>
      </div>
    </Modal>
  );
}

/* ── Account header ── */
function AccountHeader({ portfolio }: { portfolio: Portfolio }) {
  const [tf, setTf] = React.useState<(typeof timeframeOrder)[number]>("1D");
  const [valueOpen, setValueOpen] = React.useState(false);
  const [pnlOpen, setPnlOpen] = React.useState(false);

  const data = pnlTimeframes[tf];
  const up = data.change >= 0;
  const dayUp = portfolio.dayChange >= 0;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Portfolio value card */}
        <section className={cn(CARD, "flex flex-col")}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
              Portfolio value
            </p>
            <BreakdownButton onClick={() => setValueOpen(true)} />
          </div>
          <p className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[#181925]">
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

          <div className="mt-auto pt-4 flex gap-2">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#9580ff] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#a99bff]"
            >
              <ArrowDownToLine className="size-4" /> Deposit
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#f5f5f5] py-2.5 text-[14px] font-medium text-[#181925] transition-colors hover:bg-[#ececec]"
            >
              <ArrowUpFromLine className="size-4" /> Withdraw
            </button>
          </div>
        </section>

        {/* P&L card */}
        <section className={CARD}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
              Profit / Loss
            </p>
            <div className="flex items-center gap-1.5">
              <BreakdownButton onClick={() => setPnlOpen(true)} />
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
          </div>

          <p
            className={cn(
              "mt-1 text-[30px] font-semibold leading-none tracking-[-0.02em] tabular-nums",
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
                    <stop offset="0%" stopColor={up ? "#16a34a" : "#dc2626"} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={up ? "#16a34a" : "#dc2626"} stopOpacity={0} />
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

      <ValueBreakdownModal
        open={valueOpen}
        onClose={() => setValueOpen(false)}
        totalValue={portfolio.totalValue}
      />
      <PnlBreakdownModal
        open={pnlOpen}
        onClose={() => setPnlOpen(false)}
      />
    </>
  );
}

export { AccountHeader };
