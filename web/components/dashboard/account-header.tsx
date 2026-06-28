"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowDownToLine, ArrowUpFromLine, ChevronRight, Layers, Wallet, Coins, Hash } from "lucide-react";

import { cn } from "@/lib/utils";
import { usd, signedUsd, pct } from "@/lib/format";
import { type Portfolio, type PlatformBreakdown } from "@/lib/mockData";
import { BreakdownModal } from "@/components/dashboard/breakdown-modal";

export interface EquityPoint {
  value: number;
}

type FilterKey = "Combined" | "Equity" | "Prediction";

/* ── Stacked allocation bar ── */
function AllocationBar({ breakdown, totalValue }: { breakdown: PlatformBreakdown[]; totalValue: number }) {
  if (!breakdown.length || totalValue <= 0) return null;
  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-[#f0f0f0]">
      {breakdown.map((p) => {
        const share = (p.value / totalValue) * 100;
        if (share <= 0) return null;
        return (
          <div
            key={p.platform}
            className="h-full transition-all duration-700"
            style={{ width: `${share}%`, backgroundColor: p.color }}
            title={`${p.platform} · ${share.toFixed(1)}%`}
          />
        );
      })}
    </div>
  );
}

function BreakdownButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex shrink-0 items-center gap-1 rounded-full bg-[#f5f5f5] px-3 py-1.5 text-[11px] font-semibold text-[#737373] transition-colors hover:bg-[#ececec] hover:text-[#0a0a0a]"
    >
      Full breakdown
      <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
    </button>
  );
}

/* ── KPI tile ── */
function Kpi({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-[#ececec] bg-white px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[#64748B]">
        <Icon className="size-[18px]" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#a3a3a3]">{label}</p>
        <p className="text-[15px] font-bold tabular-nums tracking-[-0.01em] text-[#0a0a0a]">{value}</p>
      </div>
    </div>
  );
}

/* ── Linked-card row (demo) ── */
function CardRow({ label }: { label: string }) {
  return (
    <div className="mt-5 flex items-center gap-2.5 rounded-[12px] border border-[#ececec] bg-[#fafafa] px-3 py-2.5">
      <span className="flex h-7 w-11 items-center justify-center rounded-[5px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] text-[13px] font-bold italic tracking-tight text-[#1A1F71]">
        VISA
      </span>
      <span className="text-[13px] font-medium tabular-nums tracking-[0.06em] text-[#0a0a0a]">** 4242</span>
      <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">{label}</span>
    </div>
  );
}

/* ── Deposit / Withdraw modal with amount slider ── */
function TransferModal({
  mode,
  cash,
  onClose,
}: {
  mode: "deposit" | "withdraw";
  cash: number;
  onClose: () => void;
}) {
  const isDeposit = mode === "deposit";
  const max = isDeposit ? 50_000 : Math.max(0, Math.floor(cash));
  const step = max > 5000 ? 100 : 50;
  const [amount, setAmount] = React.useState(() =>
    isDeposit ? 1000 : Math.min(1000, max),
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    if (amount <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.detail === "string" ? data.detail : "Transfer failed");
        return;
      }
      window.dispatchEvent(new Event("verso:account-updated"));
      onClose();
    } catch {
      setError("Network error — is the backend running on :8000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose}>
      <div className="mb-1 flex items-start justify-between">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
            {isDeposit ? "Deposit funds" : "Withdraw funds"}
          </h2>
          <p className="mt-0.5 text-[12px] text-[#a3a3a3]">
            {isDeposit
              ? "Add cash from your linked card."
              : "Move cash from your account to your card."}
          </p>
        </div>
        <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-full bg-[#f5f5f5] text-[#737373] transition-colors hover:bg-[#ececec] hover:text-[#0a0a0a]">
          <X className="size-3.5" />
        </button>
      </div>

      {!isDeposit && max <= 0 ? (
        <p className="py-8 text-center text-[13px] text-[#a3a3a3]">No cash available to withdraw.</p>
      ) : (
        <>
          <p className="mt-6 text-center text-[40px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#0a0a0a]">
            {usd(amount, 0)}
          </p>
          <input
            type="range"
            min={0}
            max={max}
            step={step}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-6 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#f0f0f0] accent-[#0a0a0a]"
          />
          <div className="mt-2 flex justify-between text-[11px] font-medium tabular-nums text-[#a3a3a3]">
            <span>$0</span>
            <span>{isDeposit ? "Available cash " : "Max "}{usd(max, 0)}</span>
          </div>

          <CardRow label={isDeposit ? "From card" : "To card"} />

          {error && (
            <p className="mt-3 rounded-[8px] bg-[#fee2e2] px-3 py-2 text-[12px] font-medium text-[#dc2626]">{error}</p>
          )}

          <div className="mt-5 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-[10px] bg-[#f5f5f5] py-2.5 text-[14px] font-medium text-[#0a0a0a] hover:bg-[#ececec]">
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={loading || amount <= 0}
              className="flex-1 rounded-[10px] bg-[#050505] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#222] disabled:opacity-60"
            >
              {loading ? "Processing…" : isDeposit ? `Deposit ${usd(amount, 0)}` : `Withdraw ${usd(amount, 0)}`}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ── Account header ── */
function AccountHeader({
  portfolio,
  series = [],
  breakdown = [],
  onSelectType,
}: {
  portfolio: Portfolio;
  series?: EquityPoint[];
  breakdown?: PlatformBreakdown[];
  onSelectType?: (key: FilterKey) => void;
}) {
  const [valueOpen, setValueOpen] = React.useState(false);
  const [pnlOpen, setPnlOpen] = React.useState(false);
  const [transfer, setTransfer] = React.useState<null | "deposit" | "withdraw">(null);

  const up = portfolio.dayChange >= 0;
  const invested = Math.max(0, portfolio.totalValue - portfolio.cash);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Portfolio value card */}
        <section className="flex flex-col rounded-[18px] border border-[#ececec] bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Portfolio value</p>
            <BreakdownButton onClick={() => setBreakdownOpen(true)} />
          </div>
          <p className="mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#0a0a0a]">
            {usd(portfolio.totalValue)}
          </p>
          <div className={cn("mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold tabular-nums", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
            <span>{signedUsd(portfolio.dayChange)}</span>
            <span>({pct(portfolio.dayChangePct)})</span>
            <span className="font-normal text-[#a3a3a3]">unrealized</span>
          </div>

          {breakdown.length > 0 && (
            <div className="mt-4">
              <AllocationBar breakdown={breakdown} totalValue={portfolio.totalValue} />
            </div>
          )}

          {portfolio.cash > 0 && (
            <p className="mt-2 text-[12px] tabular-nums text-[#737373]">
              Cash: <span className="font-semibold text-[#0a0a0a]">{usd(portfolio.cash, 0)}</span>
            </p>
          )}

          <div className="mt-auto flex gap-2 pt-5">
            <button type="button" onClick={() => setTransfer("deposit")} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#ececec] bg-white py-2.5 text-[13px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]">
              <ArrowDownToLine className="size-4" /> Deposit
            </button>
            <button type="button" onClick={() => setTransfer("withdraw")} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#ececec] bg-white py-2.5 text-[13px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]">
              <ArrowUpFromLine className="size-4" /> Withdraw
            </button>
          </div>
        </section>

        {/* P&L card */}
        <section className="flex flex-col rounded-[18px] border border-[#ececec] bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">Profit / Loss</p>
            <BreakdownButton onClick={() => setBreakdownOpen(true)} />
          </div>

          <p className={cn("mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
            {signedUsd(portfolio.dayChange, 0)}
          </p>
          <p className={cn("mt-1.5 text-[13px] font-semibold tabular-nums", up ? "text-[#16a34a]" : "text-[#dc2626]")}>
            {pct(portfolio.dayChangePct)} <span className="font-normal text-[#a3a3a3]">· unrealized</span>
          </p>

          <div className="mt-auto pt-4">
            <div className="h-[64px] w-full">
              {series.length >= 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
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
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] text-[#a3a3a3]">
                  Equity curve builds as you trade
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Layers} label="Invested" value={usd(invested, 0)} />
        <Kpi icon={Coins} label="Cash" value={usd(portfolio.cash, 0)} />
        <Kpi icon={Wallet} label="Buying power" value={usd(portfolio.buyingPower, 0)} />
        <Kpi icon={Hash} label="Positions" value={String(portfolio.positionsCount)} />
      </div>

      <BreakdownModal
        open={breakdownOpen}
        onClose={() => setBreakdownOpen(false)}
        portfolio={portfolio}
        breakdown={breakdown}
        onSelectType={onSelectType}
      />
    </>
  );
}

export { AccountHeader };
