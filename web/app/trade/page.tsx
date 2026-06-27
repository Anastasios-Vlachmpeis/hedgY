"use client";

import * as React from "react";
import {
  ArrowRight,
  Atom,
  Bolt,
  Boxes,
  Flame,
  Layers,
  Radio,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { usd, usdCompact } from "@/lib/format";
import {
  hedgeSuggestions,
  marketEvents,
  trendingStocks,
  computePreview,
  computePayoff,
  summarize,
  type MarketEvent,
} from "@/lib/mockData";
import { energyFutures, type EnergyInstrument } from "@/lib/fusionData";
import { Sparkline, PayoffChart, Meter } from "@/components/fusion/charts";

const cents = (p: number) => Math.round(p * 100);

export default function TradeFloor() {
  const [activeId, setActiveId] = React.useState(hedgeSuggestions[0].id);
  const [ratio, setRatio] = React.useState(hedgeSuggestions[0].position.defaultHedgeRatio);

  const suggestion = hedgeSuggestions.find((s) => s.id === activeId)!;
  const position = suggestion.position;
  const preview = computePreview(position, ratio);
  const payoff = computePayoff(position, ratio);

  const select = (id: string) => {
    const s = hedgeSuggestions.find((x) => x.id === id)!;
    setActiveId(id);
    setRatio(s.position.defaultHedgeRatio);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="fz-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="fz-chip">
              <span className="fz-live" /> Markets live
            </span>
            <span className="fz-chip">Kalshi · Polymarket · Alpaca · IBKR</span>
          </div>
          <h1 className="text-[30px] font-bold leading-none tracking-[-0.03em] text-white">
            Trading <span className="fz-gradient-text">Floor</span>
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-[var(--fz-text-3)]">
            Fuse equities, energy futures and prediction markets into a single
            instrument. One thesis. One ticket. Hedged across every venue.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Stat label="Fusion Index" value="1,284.6" delta="+1.62%" up />
          <Stat label="24h Volume" value="$184.2M" delta="+8.4%" up />
          <Stat label="Open Markets" value="312" delta="live" />
        </div>
      </div>

      {/* ── Combined instrument builder + order ticket ───────────────────── */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="fz-glass fz-rise relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[var(--fz-violet)]/15 blur-3xl" />
          <div className="relative">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--fz-surface)] fz-ring">
                  <Atom className="size-5 text-[var(--fz-violet-2)]" />
                </span>
                <div>
                  <h2 className="text-[16px] font-semibold text-white">Combined Instrument Builder</h2>
                  <p className="text-[12px] text-[var(--fz-text-3)]">{suggestion.equityLabel} · structured hedge</p>
                </div>
              </div>
              <span className="fz-chip">
                <Sparkles className="size-3" /> Fusion contract
              </span>
            </div>

            {/* Two legs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Leg
                tone="violet"
                icon={<TrendingUp className="size-4" />}
                kicker="Long leg · Equity"
                title={position.equityLeg.label}
                sub={`${usd(position.equityLeg.size, 0)} notional`}
              />
              <Leg
                tone="cyan"
                icon={<Shield className="size-4" />}
                kicker={`Hedge leg · ${position.hedgeLeg.side}`}
                title={position.hedgeLeg.label}
                sub={`${cents(position.hedgeLeg.marketPrice)}¢ · ${usd(preview.hedgeSize, 0)}`}
              />
            </div>

            {/* Hedge ratio slider */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[13px]">
                <span className="text-[var(--fz-text-3)]">Hedge ratio</span>
                <span className="fz-data font-semibold text-white">{Math.round(ratio * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.05}
                value={ratio}
                onChange={(e) => setRatio(Number(e.target.value))}
                className="fz-range w-full"
              />
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--fz-text-2)]">{summarize(position, ratio)}</p>
            </div>

            {/* Payoff */}
            <div className="mt-4 rounded-xl border border-[var(--fz-line)] bg-[var(--fz-inset)] p-3">
              <div className="mb-1 flex items-center justify-between text-[12px] text-[var(--fz-text-3)]">
                <span>Scenario payoff</span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5"><i className="inline-block h-0.5 w-4 rounded bg-[var(--fz-violet)]" /> Hedged</span>
                  <span className="flex items-center gap-1.5"><i className="inline-block h-0.5 w-4 rounded bg-[var(--fz-text-3)]" /> Unhedged</span>
                </span>
              </div>
              <PayoffChart
                hedged={payoff.map((p) => p.hedged)}
                unhedged={payoff.map((p) => p.unhedged)}
                labels={[payoff[0].scenario, payoff[payoff.length - 1].scenario]}
                height={180}
              />
            </div>
          </div>
        </div>

        {/* Order ticket */}
        <OrderTicket preview={preview} position={position} />
      </section>

      {/* ── Prebuilt combined instruments ──────────────────────────────── */}
      <Section icon={<Boxes className="size-4" />} title="Combined Instruments" hint="Curated fusion contracts — click to load into the builder">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {hedgeSuggestions.map((s) => {
            const active = s.id === activeId;
            return (
              <button
                key={s.id}
                onClick={() => select(s.id)}
                className={cn(
                  "fz-card fz-glass-hover group relative overflow-hidden p-4 text-left",
                  active && "fz-glow-violet",
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                <span className="fz-chip">{s.strength}</span>
                <span className="fz-data text-[12px] text-[var(--fz-text-3)]">{s.equitySymbols.join(" · ")}</span>
                </div>
                <h3 className="text-[15px] font-semibold text-white">{s.equityLabel}</h3>
                <p className="mt-1 text-[12px] text-[var(--fz-text-3)]">vs {s.hedgeMarket}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", s.hedgeSide === "YES" ? "bg-[var(--fz-up)]/15 text-[var(--fz-up)]" : "bg-[var(--fz-down)]/15 text-[var(--fz-down)]")}>
                    {s.hedgeSide} {cents(s.hedgePrice)}¢
                  </span>
                  <span className="flex items-center gap-1 text-[12px] font-medium text-[var(--fz-violet-2)] opacity-0 transition-opacity group-hover:opacity-100">
                    Load <ArrowRight className="size-3.5" />
                  </span>
                </div>
                <p className="mt-3 border-t border-[var(--fz-line)] pt-2 text-[12px] leading-snug text-[var(--fz-text-2)]">{s.rationale}</p>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Prediction markets + energy ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Section icon={<Radio className="size-4" />} title="Prediction Markets" hint="Best cross-venue price per side">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {marketEvents.slice(0, 8).map((m) => (
              <MarketRow key={m.id} m={m} />
            ))}
          </div>
        </Section>

        <Section icon={<Bolt className="size-4" />} title="Energy & Commodities" hint="Powering the transition">
          <div className="fz-glass divide-y divide-[var(--fz-line)] overflow-hidden">
            {energyFutures.map((e) => (
              <EnergyRow key={e.symbol} e={e} />
            ))}
          </div>
        </Section>
      </div>

      {/* ── Equities ───────────────────────────────────────────────────── */}
      <Section icon={<Layers className="size-4" />} title="Equities" hint="Long legs for your next fusion contract">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {trendingStocks.map((s) => (
            <div key={s.symbol} className="fz-card fz-glass-hover p-3">
              <div className="flex items-center justify-between">
                <span className="fz-data text-[13px] font-semibold text-white">{s.symbol}</span>
                <span className={cn("fz-data text-[11px]", s.changePct >= 0 ? "text-[var(--fz-up)]" : "text-[var(--fz-down)]")}>
                  {s.changePct >= 0 ? "+" : ""}{s.changePct}%
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-[var(--fz-text-3)]">{s.name}</p>
              <div className="my-2"><Sparkline data={s.spark} up={s.changePct >= 0} width={140} height={26} /></div>
              <p className="fz-data text-[14px] font-semibold text-white">{usd(s.price)}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ─────────────────────────── sub-components ─────────────────────────────── */

function Stat({ label, value, delta, up }: { label: string; value: string; delta: string; up?: boolean }) {
  return (
    <div className="fz-glass min-w-[120px] px-3.5 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-[var(--fz-text-4)]">{label}</p>
      <p className="fz-data mt-0.5 text-[18px] font-semibold text-white">{value}</p>
      <p className={cn("fz-data text-[11px]", up ? "text-[var(--fz-up)]" : "text-[var(--fz-text-3)]")}>{delta}</p>
    </div>
  );
}

function Section({ icon, title, hint, children }: { icon: React.ReactNode; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="fz-rise">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--fz-surface)] text-[var(--fz-violet-2)] fz-ring">{icon}</span>
        <h2 className="text-[16px] font-semibold text-white">{title}</h2>
        {hint && <span className="hidden text-[12px] text-[var(--fz-text-4)] sm:inline">— {hint}</span>}
      </div>
      {children}
    </section>
  );
}

function Leg({ tone, icon, kicker, title, sub }: { tone: "violet" | "cyan"; icon: React.ReactNode; kicker: string; title: string; sub: string }) {
  const color = tone === "violet" ? "var(--fz-violet-2)" : "var(--fz-cyan)";
  return (
    <div className="rounded-xl border border-[var(--fz-line)] bg-[var(--fz-inset)] p-3.5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide" style={{ color }}>
        {icon}
        {kicker}
      </div>
      <p className="mt-2 text-[14px] font-semibold text-white">{title}</p>
      <p className="fz-data mt-0.5 text-[12px] text-[var(--fz-text-3)]">{sub}</p>
    </div>
  );
}

function OrderTicket({
  preview,
  position,
}: {
  preview: ReturnType<typeof computePreview>;
  position: (typeof hedgeSuggestions)[number]["position"];
}) {
  const [placed, setPlaced] = React.useState(false);
  React.useEffect(() => setPlaced(false), [preview.hedgeRatio, position]);

  return (
    <div className="fz-glass fz-rise flex flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-white">Order ticket</h3>
        <span className="fz-chip"><Zap className="size-3" /> 1-click</span>
      </div>

      <div className="space-y-2.5 text-[13px]">
        <Row label="Equity leg" value={usd(position.equityLeg.size, 0)} />
        <Row label="Hedge leg" value={usd(preview.hedgeSize, 0)} />
        <div className="my-1 h-px bg-[var(--fz-line)]" />
        <Row label="Net cost" value={usd(preview.netCost, 0)} strong />
        <Row label="Max gain" value={`+${usd(preview.maxGain, 0)}`} tone="up" />
        <Row label="Max loss" value={usd(preview.maxLoss, 0)} tone="down" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[var(--fz-line)] bg-[var(--fz-inset)] p-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wide text-[var(--fz-text-4)]">Breakeven</p>
          <p className="fz-data text-[15px] font-semibold text-white">{Math.round(preview.hedgeRatio * 100)}%</p>
        </div>
        <div className="rounded-xl border border-[var(--fz-line)] bg-[var(--fz-inset)] p-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wide text-[var(--fz-text-4)]">R/R</p>
          <p className="fz-data text-[15px] font-semibold text-white">
            {(Math.abs(preview.maxGain / (preview.maxLoss || -1))).toFixed(2)}
          </p>
        </div>
      </div>

      <button
        onClick={() => setPlaced(true)}
        className={cn("fz-btn mt-4 h-12 w-full text-[15px]", placed ? "fz-btn-ghost" : "fz-btn-primary")}
      >
        {placed ? "✓ Fusion order routed" : <>Execute fusion order <ArrowRight className="size-4" /></>}
      </button>
      <p className="mt-2 text-center text-[11px] text-[var(--fz-text-4)]">
        Suggestion-only demo · routed across Alpaca + Polymarket
      </p>
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "up" | "down" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--fz-text-3)]">{label}</span>
      <span
        className={cn(
          "fz-data font-medium",
          strong ? "text-[15px] text-white" : "text-white",
          tone === "up" && "text-[var(--fz-up)]",
          tone === "down" && "text-[var(--fz-down)]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function MarketRow({ m }: { m: MarketEvent }) {
  const yes = m.yesProbability != null ? cents(m.yesProbability) : m.outcomes ? cents(m.outcomes[0].yes) : 50;
  return (
    <div className="fz-card fz-glass-hover p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fz-surface)] text-[18px] fz-ring">{m.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="fz-chip !px-1.5 !py-0 !text-[10px]">{m.category}</span>
            {m.live && <span className="fz-live" />}
          </div>
          <p className="line-clamp-2 text-[13px] font-medium leading-snug text-white">{m.title}</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="text-[var(--fz-text-3)]">Yes {yes}¢</span>
          <span className="text-[var(--fz-text-4)]">{usdCompact(m.volume)} vol</span>
        </div>
        <Meter pct={yes} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="rounded-lg bg-[var(--fz-up)]/12 py-1.5 text-[12px] font-semibold text-[var(--fz-up)] transition-colors hover:bg-[var(--fz-up)]/20">
          Yes {yes}¢
        </button>
        <button className="rounded-lg bg-[var(--fz-down)]/12 py-1.5 text-[12px] font-semibold text-[var(--fz-down)] transition-colors hover:bg-[var(--fz-down)]/20">
          No {100 - yes}¢
        </button>
      </div>
    </div>
  );
}

function EnergyRow({ e }: { e: EnergyInstrument }) {
  const Icon = e.tag === "Nuclear" ? Atom : e.tag === "Renewable" ? Sparkles : e.tag === "Power" ? Zap : e.tag === "Carbon" ? Boxes : Flame;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--fz-surface)]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--fz-surface)] text-[var(--fz-amber)]">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="fz-data text-[13px] font-semibold text-white">{e.symbol}</p>
        <p className="truncate text-[11px] text-[var(--fz-text-3)]">{e.name}</p>
      </div>
      <Sparkline data={e.spark} up={e.changePct >= 0} width={70} height={22} />
      <div className="w-[78px] text-right">
        <p className="fz-data text-[13px] font-semibold text-white">{e.price}<span className="text-[10px] text-[var(--fz-text-4)]">{e.unit}</span></p>
        <p className={cn("fz-data text-[11px]", e.changePct >= 0 ? "text-[var(--fz-up)]" : "text-[var(--fz-down)]")}>
          {e.changePct >= 0 ? "+" : ""}{e.changePct}%
        </p>
      </div>
    </div>
  );
}
