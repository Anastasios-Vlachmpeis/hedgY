"use client";

import * as React from "react";
import {
  Activity as ActivityIcon,
  ArrowDownRight,
  ArrowUpRight,
  Gauge,
  Globe2,
  Layers,
  PieChart,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { usd, usdCompact, signedUsd, pct } from "@/lib/format";
import {
  portfolio,
  pnlTimeframes,
  timeframeOrder,
  exposure,
  sectorWeights,
  regionExposure,
  positions,
  activity,
  platformBreakdown,
  type Position,
} from "@/lib/mockData";
import { riskMetrics, macroSignals } from "@/lib/fusionData";
import { GlowArea, Donut, Meter } from "@/components/fusion/charts";
import { CountUp } from "@/components/ui/count-up";

const ALLOC_COLORS = ["#9580ff", "#38e0ff", "#ff5cf0", "#ffb347"];

export default function PortfolioPage() {
  const [tf, setTf] = React.useState<string>("1M");
  const frame = pnlTimeframes[tf];
  const series = frame.series.map((p) => p.value);
  const up = frame.change >= 0;

  const allocation = exposure.map((e, i) => ({ label: e.label, value: e.pct, color: ALLOC_COLORS[i % ALLOC_COLORS.length] }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="fz-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="fz-chip"><span className="fz-live" /> Synced</span>
            <span className="fz-chip">Alpaca · Polymarket · Kalshi</span>
          </div>
          <h1 className="text-[30px] font-bold leading-none tracking-[-0.03em] text-white">
            Mission <span className="fz-gradient-text">Control</span>
          </h1>
          <p className="mt-2 text-[14px] text-[var(--fz-text-3)]">Welcome back, Maxim — your whole book, every venue, one view.</p>
        </div>
        <div className="flex gap-2.5">
          <MiniStat icon={<Wallet className="size-4" />} label="Buying power" value={usdCompact(portfolio.buyingPower)} />
          <MiniStat icon={<Layers className="size-4" />} label="Positions" value={String(portfolio.positionsCount)} />
          <MiniStat icon={<Shield className="size-4" />} label="Hedged" value="73%" />
        </div>
      </div>

      {/* Equity curve + allocation */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="fz-glass fz-rise relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-[var(--fz-violet)]/12 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-wide text-[var(--fz-text-4)]">Total equity</p>
              <p className="fz-data mt-1 text-[42px] font-bold leading-none text-white">
                <CountUp to={portfolio.totalValue} prefix="$" decimals={2} />
              </p>
              <p className={cn("fz-data mt-2 flex items-center gap-1.5 text-[15px] font-semibold", up ? "text-[var(--fz-up)]" : "text-[var(--fz-down)]")}>
                {up ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                {signedUsd(frame.change)} ({pct(frame.pct)}) <span className="text-[var(--fz-text-4)]">· {tf}</span>
              </p>
            </div>
            <div className="flex gap-1 rounded-full border border-[var(--fz-line)] bg-[var(--fz-inset)] p-1">
              {timeframeOrder.map((t) => (
                <button
                  key={t}
                  onClick={() => setTf(t)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[12px] font-medium transition-all",
                    tf === t ? "bg-[var(--fz-surface-2)] text-white" : "text-[var(--fz-text-3)] hover:text-white",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mt-4">
            <GlowArea key={tf} data={series} color={up ? "var(--fz-up)" : "var(--fz-down)"} height={240} fmt={(v) => usd(v, 0)} />
          </div>
        </div>

        {/* Allocation */}
        <div className="fz-glass fz-rise flex flex-col p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieChart className="size-4 text-[var(--fz-violet-2)]" />
            <h2 className="text-[15px] font-semibold text-white">Allocation</h2>
          </div>
          <div className="flex items-center justify-center">
            <Donut
              segments={allocation}
              center={
                <>
                  <p className="text-[11px] text-[var(--fz-text-4)]">Asset mix</p>
                  <p className="fz-data text-[20px] font-bold text-white">{allocation.length}</p>
                  <p className="text-[10px] text-[var(--fz-text-4)]">classes</p>
                </>
              }
            />
          </div>
          <div className="mt-5 space-y-2.5">
            {allocation.map((a) => (
              <div key={a.label} className="flex items-center gap-2.5 text-[13px]">
                <span className="size-2.5 rounded-full" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                <span className="flex-1 text-[var(--fz-text-2)]">{a.label}</span>
                <span className="fz-data font-semibold text-white">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk telemetry */}
      <section className="fz-rise">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--fz-surface)] text-[var(--fz-violet-2)] fz-ring"><Gauge className="size-4" /></span>
          <h2 className="text-[16px] font-semibold text-white">Risk telemetry</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {riskMetrics.map((r) => {
            const color = r.tone === "good" ? "var(--fz-up)" : r.tone === "warn" ? "var(--fz-amber)" : "var(--fz-down)";
            return (
              <div key={r.label} className="fz-card fz-glass-hover p-4">
                <p className="text-[11px] text-[var(--fz-text-3)]">{r.label}</p>
                <p className="fz-data mt-1 text-[22px] font-bold text-white">{r.value}</p>
                <div className="mt-2.5"><Meter pct={r.pct} color={color} /></div>
                <p className="mt-2 text-[10px] leading-snug text-[var(--fz-text-4)]">{r.hint}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Positions + side rail */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <section className="fz-glass fz-rise overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--fz-line)] px-5 py-3.5">
            <h2 className="text-[15px] font-semibold text-white">Positions</h2>
            <span className="text-[12px] text-[var(--fz-text-4)]">{positions.length} open</span>
          </div>
          <div className="divide-y divide-[var(--fz-line)]">
            {positions.map((p) => (
              <PositionRow key={p.id} p={p} />
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          {/* Platform breakdown */}
          <div className="fz-glass fz-rise p-5">
            <h2 className="mb-3 text-[15px] font-semibold text-white">By venue</h2>
            <div className="space-y-3">
              {platformBreakdown.map((b) => (
                <div key={b.platform}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 text-[var(--fz-text-2)]">
                      <span className="size-2.5 rounded-full" style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
                      {b.platform}
                    </span>
                    <span className="fz-data font-semibold text-white">{usdCompact(b.value)}</span>
                  </div>
                  <Meter pct={(b.value / platformBreakdown.reduce((s, x) => s + x.value, 0)) * 100} color={b.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Macro signals */}
          <div className="fz-glass fz-rise p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--fz-violet-2)]" />
              <h2 className="text-[15px] font-semibold text-white">Macro signals</h2>
            </div>
            <div className="space-y-2.5">
              {macroSignals.map((m) => (
                <div key={m.label} className="flex items-center gap-3 text-[13px]">
                  <span className="flex-1 truncate text-[var(--fz-text-2)]">{m.label}</span>
                  <span className="fz-data w-9 text-right font-semibold text-white">{Math.round(m.prob * 100)}%</span>
                  <span className={cn("fz-data w-9 text-right text-[11px]", m.delta >= 0 ? "text-[var(--fz-up)]" : "text-[var(--fz-down)]")}>
                    {m.delta >= 0 ? "+" : ""}{m.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exposure + activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="fz-glass fz-rise p-5">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="size-4 text-[var(--fz-violet-2)]" />
            <h2 className="text-[15px] font-semibold text-white">Sector exposure</h2>
          </div>
          <div className="space-y-3">
            {sectorWeights.map((s) => (
              <div key={s.sector}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-[var(--fz-text-2)]">{s.sector}</span>
                  <span className="fz-data font-semibold text-white">{s.pct}%</span>
                </div>
                <Meter pct={s.pct * 3.5} color={s.color} />
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 border-t border-[var(--fz-line)] pt-4">
            <Globe2 className="size-4 text-[var(--fz-text-3)]" />
            <div className="flex flex-1 flex-wrap gap-x-4 gap-y-1 text-[12px]">
              {regionExposure.map((r) => (
                <span key={r.region} className="text-[var(--fz-text-3)]">
                  {r.region} <span className="fz-data font-semibold text-white">{r.pct}%</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="fz-glass fz-rise p-5">
          <div className="mb-4 flex items-center gap-2">
            <ActivityIcon className="size-4 text-[var(--fz-violet-2)]" />
            <h2 className="text-[15px] font-semibold text-white">Recent activity</h2>
          </div>
          <div className="space-y-1">
            {activity.slice(0, 7).map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--fz-surface)]">
                <span className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold",
                  a.amount >= 0 ? "bg-[var(--fz-up)]/12 text-[var(--fz-up)]" : "bg-[var(--fz-down)]/12 text-[var(--fz-down)]",
                )}>
                  {a.kind.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white">{a.title}</p>
                  <p className="truncate text-[11px] text-[var(--fz-text-4)]">{a.detail}</p>
                </div>
                <div className="text-right">
                  <p className={cn("fz-data text-[13px] font-semibold", a.amount >= 0 ? "text-[var(--fz-up)]" : "text-[var(--fz-down)]")}>
                    {signedUsd(a.amount, 0)}
                  </p>
                  <p className="text-[10px] text-[var(--fz-text-4)]">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="fz-glass flex items-center gap-3 px-3.5 py-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--fz-surface)] text-[var(--fz-violet-2)]">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-[var(--fz-text-4)]">{label}</p>
        <p className="fz-data text-[16px] font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function PositionRow({ p }: { p: Position }) {
  const up = p.pnl >= 0;
  const typeColor = p.type === "Combined" ? "var(--fz-violet-2)" : p.type === "Prediction" ? "var(--fz-cyan)" : "var(--fz-text-2)";
  return (
    <div className="px-5 py-3.5 transition-colors hover:bg-[var(--fz-surface)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: typeColor, background: "rgba(20,24,46,0.05)" }}>
              {p.type}
            </span>
            <p className="truncate text-[14px] font-medium text-white">{p.title}</p>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-[var(--fz-text-4)]">{p.detail}</p>
        </div>
        <div className="text-right">
          <p className="fz-data text-[14px] font-semibold text-white">{usd(p.value, 0)}</p>
          <p className={cn("fz-data text-[12px] font-medium", up ? "text-[var(--fz-up)]" : "text-[var(--fz-down)]")}>
            {up ? "+" : ""}{usd(p.pnl, 0)} ({pct(p.pnlPct)})
          </p>
        </div>
      </div>
      {p.equityLeg && p.hedgeLeg && (
        <div className="mt-2.5 flex gap-2">
          <span className="flex-1 rounded-md border border-[var(--fz-line)] bg-[var(--fz-inset)] px-2.5 py-1.5 text-[11px]">
            <span className="text-[var(--fz-text-4)]">Long</span> <span className="text-[var(--fz-text-2)]">{p.equityLeg.label}</span>
          </span>
          <span className="flex-1 rounded-md border border-[var(--fz-line)] bg-[var(--fz-inset)] px-2.5 py-1.5 text-[11px]">
            <span className="text-[var(--fz-text-4)]">Hedge</span> <span className="text-[var(--fz-text-2)]">{p.hedgeLeg.label}</span>
          </span>
        </div>
      )}
    </div>
  );
}
