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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-[22px] border border-[#ececec] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.10)] sm:rounded-[22px]">
        {children}
      </div>
    </div>
  );
}

/* ── Platform row in breakdown modal ── */
function PlatformRow({ p, totalValue }: { p: PlatformBreakdown; totalValue: number }) {
  const share = totalValue > 0 ? (p.value / totalValue) * 100 : 0;
  const pnlUp = p.pnl >= 0;
  return (
    <div className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0 [&+&]:border-t [&+&]:border-[#f0f0f0]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#0a0a0a]">{p.platform}</p>
          <p className="text-[11px] text-[#a3a3a3]">{p.kind}</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-semibold tabular-nums text-[#0a0a0a]">{usd(p.value, 0)}</p>
          {p.pnl !== 0 && (
            <p className={cn("text-[11px] tabular-nums", pnlUp ? "text-[#16a34a]" : "text-[#dc2626]")}>
              {signedUsd(p.pnl, 0)} ({pct(p.pnlPct)}) today
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${share.toFixed(1)}%`, backgroundColor: p.color }} />
        </div>
        <span className="w-10 text-right text-[11px] tabular-nums text-[#a3a3a3]">{share.toFixed(1)}%</span>
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
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">Portfolio breakdown</h2>
          <p className="mt-0.5 text-[12px] text-[#a3a3a3]">Value by connected platform</p>
        </div>
        <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-full bg-[#f5f5f5] text-[#737373] transition-colors hover:bg-[#ececec] hover:text-[#0a0a0a]">
          <X className="size-3.5" />
        </button>
      </div>
      <div>{platformBreakdown.map((p) => <PlatformRow key={p.platform} p={p} totalValue={totalValue} />)}</div>
      <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Total</span>
        <span className="text-[15px] font-bold tabular-nums text-[#0a0a0a]">{usd(totalValue)}</span>
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
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">P&amp;L breakdown</h2>
          <p className="mt-0.5 text-[12px] text-[#a3a3a3]">Today's P&amp;L by platform</p>
        </div>
        <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-full bg-[#f5f5f5] text-[#737373] transition-colors hover:bg-[#ececec] hover:text-[#0a0a0a]">
          <X className="size-3.5" />
        </button>
      </div>
      <div>
        {platformBreakdown.filter((p) => p.pnl !== 0).map((p) => {
          const up = p.pnl >= 0;
          return (
            <div key={p.platform} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 [&+&]:border-t [&+&]:border-[#f0f0f0]">
              <div className="flex items-center gap-2.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                <div>
                  <p className="text-[13px] font-semibold text-[#0a0a0a]">{p.platform}</p>
                  <p className="text-[11px] text-[#a3a3a3]">{p.kind}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-[13px] font-semibold tabular-nums", up ? "text-[#16a34a]" : "text-[#dc2626]")}>{signedUsd(p.pnl, 0)}</p>
                <p className={cn("text-[11px] tabular-nums", up ? "text-[#16a34a]" : "text-[#dc2626]")}>{pct(p.pnlPct)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Total today</span>
        <span className="text-[15px] font-bold tabular-nums text-[#16a34a]">{signedUsd(platformBreakdown.reduce((s, p) => s + p.pnl, 0), 0)}</span>
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
        <section className="flex flex-col rounded-[18px] border border-[#ececec] bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Portfolio value</p>
            <button
              type="button"
              onClick={() => setValueOpen(true)}
              className="group flex shrink-0 items-center gap-1 rounded-full bg-[#f5f5f5] px-3 py-1.5 text-[11px] font-semibold text-[#737373] transition-colors hover:bg-[#ececec] hover:text-[#0a0a0a]"
            >
              Full breakdown
              <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </button>
          </div>
          <p className="mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#0a0a0a]">
            {usd(portfolio.totalValue)}
          </p>
          <div className={cn("mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold tabular-nums", dayUp ? "text-[#16a34a]" : "text-[#dc2626]")}>
            <span>{signedUsd(portfolio.dayChange)}</span>
            <span>({pct(portfolio.dayChangePct)})</span>
            <span className="font-normal text-[#a3a3a3]">today</span>
          </div>

          <div className="mt-auto flex gap-2 pt-5">
            <button type="button" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#ececec] bg-white py-2.5 text-[13px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]">
              <ArrowDownToLine className="size-4" /> Deposit
            </button>
            <button type="button" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#ececec] bg-white py-2.5 text-[13px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]">
              <ArrowUpFromLine className="size-4" /> Withdraw
            </button>
          </div>
        </section>

        {/* P&L card */}
        <section className="flex flex-col rounded-[18px] border border-[#ececec] bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Profit / Loss</p>
            <button
              type="button"
              onClick={() => setPnlOpen(true)}
              className="group flex shrink-0 items-center gap-1 rounded-full bg-[#f5f5f5] px-3 py-1.5 text-[11px] font-semibold text-[#737373] transition-colors hover:bg-[#ececec] hover:text-[#0a0a0a]"
            >
              Full breakdown
              <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </button>
          </div>

          <p className={cn("mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
            {signedUsd(data.change, 0)}
          </p>
          <p className={cn("mt-1.5 text-[13px] font-semibold tabular-nums", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
            {pct(data.pct)} <span className="font-normal text-[#a3a3a3]">· past {tf}</span>
          </p>

          <div className="mt-auto pt-4">
            <div className="h-[64px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={up ? "#16a34a" : "#dc2626"} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={up ? "#16a34a" : "#dc2626"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={["dataMin", "dataMax"]} hide />
                  <Area type="monotone" dataKey="value" stroke={up ? "#16a34a" : "#dc2626"} strokeWidth={1.5} fill="url(#pnlGrad)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex justify-end gap-0.5">
              {timeframeOrder.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTf(t)}
                  className={cn(
                    "h-7 rounded-full px-3 text-[12px] font-semibold transition-colors",
                    t === tf ? "bg-[#f0f0f0] text-[#0a0a0a]" : "text-[#a3a3a3] hover:text-[#0a0a0a]",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <ValueBreakdownModal open={valueOpen} onClose={() => setValueOpen(false)} totalValue={portfolio.totalValue} />
      <PnlBreakdownModal open={pnlOpen} onClose={() => setPnlOpen(false)} />
    </>
  );
}

export { AccountHeader };
