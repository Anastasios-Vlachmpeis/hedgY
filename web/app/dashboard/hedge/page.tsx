"use client";

import * as React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import {
  computePayoff,
  computePreview,
  hedgeSuggestions,
  summarize,
  type CombinedPosition,
  type HedgeSuggestion,
} from "@/lib/mockData";
import { scaleSizing, sizeTwoState } from "@/lib/hedgeMath";

/* ---------- formatting ---------- */

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const signed = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "-" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
const cents = (p: number) => `${Math.round(p * 100)}¢`;
const pct0 = (x: number) => `${Math.round(x * 100)}%`;
const pct1 = (x: number) => `${(x * 100).toFixed(1)}%`;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const STRENGTH_RANK: Record<HedgeSuggestion["strength"], number> = {
  Strong: 3,
  Moderate: 2,
  Light: 1,
};

/** Two-state offset quality at a given notional + ratio. */
function offsetScore(position: CombinedPosition, notional: number, ratio: number): number {
  const full = sizeTwoState(notional, position.calibration);
  return scaleSizing(notional, full, ratio).hedgeQuality;
}

const NOTIONAL_PRESETS = [1000, 5000, 10000, 25000];
const RATIO_PRESETS: { v: number; label: string }[] = [
  { v: 0, label: "None" },
  { v: 0.25, label: "Light" },
  { v: 0.5, label: "Balanced" },
  { v: 0.75, label: "Heavy" },
  { v: 1, label: "Full" },
];

/* ---------- primitives ---------- */

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 flex-1 rounded-[9px] text-[12px] font-semibold tabular-nums transition-colors",
        active
          ? "bg-[#0F172A] text-white"
          : "bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:bg-[#ECEFF5] hover:text-[var(--text-primary)]",
      )}
    >
      {children}
    </button>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E7EAF0] accent-[#4F8DFF]"
    />
  );
}

function ControlRow({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</span>
        <span className="text-[13px] font-bold tabular-nums text-[var(--text-primary)]">{value}</span>
      </div>
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
  sub,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red" | "blue";
  sub?: string;
}) {
  const color =
    tone === "green"
      ? "text-[#16A34A]"
      : tone === "red"
        ? "text-[#EF4444]"
        : tone === "blue"
          ? "text-[#4F8DFF]"
          : "text-[var(--text-primary)]";
  return (
    <div className="rounded-[12px] border border-[var(--border-soft)] bg-white p-3">
      <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
      <p className={cn("mt-1 text-[15px] font-bold tabular-nums", color)}>{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] font-medium tabular-nums text-[var(--text-muted)]">{sub}</p> : null}
    </div>
  );
}

function SideTag({ side }: { side: HedgeSuggestion["hedgeSide"] }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-bold",
        side === "YES" ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#EF4444]",
      )}
    >
      {side}
    </span>
  );
}

/* ---------- payoff chart ---------- */

function PayoffTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
}) {
  if (!active || !payload?.length) return null;
  const seen = new Set<string>();
  return (
    <div className="rounded-[10px] border border-[var(--border-soft)] bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
      {payload
        .filter((r) => r.name && !seen.has(r.name) && (seen.add(r.name!), true))
        .map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-5 text-[12px]">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="size-2 rounded-full" style={{ background: row.color }} />
              {row.name}
            </span>
            <span className="font-semibold tabular-nums text-[var(--text-primary)]">
              {signed(Number(row.value))}
            </span>
          </div>
        ))}
    </div>
  );
}

function PayoffChart({ position, hedgeRatio }: { position: CombinedPosition; hedgeRatio: number }) {
  const data = React.useMemo(() => {
    let points = computePayoff(position, hedgeRatio, 13);
    // order adverse (worse unhedged) → favorable so the line reads left-to-right
    if (points[0].unhedged > points[points.length - 1].unhedged) {
      points = points.slice().reverse();
    }
    return points.map((p) => ({ hedged: p.hedged, unhedged: p.unhedged }));
  }, [position, hedgeRatio]);

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 16, right: 12, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="hedgedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F8DFF" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#4F8DFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F0F2F7" />
          <XAxis hide />
          <YAxis
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }}
            tickFormatter={(v: number) => signed(v)}
          />
          <Tooltip content={<PayoffTooltip />} cursor={{ stroke: "#CBD5E1", strokeWidth: 1, strokeDasharray: "4 2" }} />
          <ReferenceLine y={0} stroke="#CBD5E1" strokeDasharray="3 3" />
          <Area
            name="Hedged"
            type="monotone"
            dataKey="hedged"
            stroke="#4F8DFF"
            strokeWidth={2.5}
            fill="url(#hedgedFill)"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            name="Unhedged"
            type="monotone"
            dataKey="unhedged"
            stroke="#94A3B8"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- outcome card ---------- */

function OutcomeCard({
  kind,
  title,
  sub,
  unhedged,
  hedged,
}: {
  kind: "adverse" | "favorable";
  title: string;
  sub: string;
  unhedged: number;
  hedged: number;
}) {
  const delta = hedged - unhedged; // adverse: cushion (+) ; favorable: drag (−)
  const accent = kind === "adverse" ? "#EF4444" : "#16A34A";
  return (
    <div className="flex flex-col rounded-[14px] border border-[var(--border-soft)] bg-white p-4">
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full" style={{ background: accent }} />
        <span className="text-[11px] font-bold uppercase tracking-[0.04em]" style={{ color: accent }}>
          {kind === "adverse" ? "Adverse case" : "Favorable case"}
        </span>
      </div>
      <p className="mt-1.5 text-[13px] font-semibold leading-snug text-[var(--text-primary)]">{title}</p>
      <p className="mt-0.5 text-[11px] font-medium text-[var(--text-muted)]">{sub}</p>

      <div className="mt-3 space-y-1.5 border-t border-[var(--border-soft)] pt-3">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[var(--text-secondary)]">Unhedged</span>
          <span className={cn("font-semibold tabular-nums", unhedged >= 0 ? "text-[#16A34A]" : "text-[#EF4444]")}>
            {signed(unhedged)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-medium text-[var(--text-primary)]">Hedged</span>
          <span className={cn("font-bold tabular-nums", hedged >= 0 ? "text-[#16A34A]" : "text-[#EF4444]")}>
            {signed(hedged)}
          </span>
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-between rounded-[9px] px-2.5 py-1.5 text-[12px] font-semibold"
        style={{
          background: kind === "adverse" ? "#F0FDF4" : "#F8FAFC",
          color: kind === "adverse" ? "#16A34A" : "#64748B",
        }}
      >
        <span>{kind === "adverse" ? "Loss cushioned" : "Hedge cost"}</span>
        <span className="tabular-nums">{signed(delta)}</span>
      </div>
    </div>
  );
}

/* ---------- exposure card ---------- */

function ExposureCard({
  suggestion,
  selected,
  onSelect,
}: {
  suggestion: HedgeSuggestion;
  selected: boolean;
  onSelect: () => void;
}) {
  const offset = offsetScore(
    suggestion.position,
    suggestion.position.equityLeg.size,
    suggestion.position.defaultHedgeRatio,
  );
  const notional = suggestion.position.equityLeg.size;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-3 rounded-[16px] border bg-white p-4 text-left transition-all duration-150",
        selected
          ? "border-[#4F8DFF] shadow-[0_0_0_3px_rgba(79,141,255,0.12)]"
          : "border-[var(--border-soft)] hover:border-[#C7D2E5]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-[var(--text-primary)]">{suggestion.equityLabel}</p>
          <p className="mt-0.5 truncate text-[12px] font-medium text-[var(--text-muted)]">
            {suggestion.equitySymbols.join(" · ")} · {money(notional)}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--border-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
          {suggestion.strength}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[12px]">
        <SideTag side={suggestion.hedgeSide} />
        <span className="min-w-0 truncate text-[var(--text-primary)]">{suggestion.hedgeMarket}</span>
        <span className="ml-auto shrink-0 font-semibold tabular-nums text-[var(--text-primary)]">
          {cents(suggestion.hedgePrice)}
        </span>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-[11px]">
          <span className="text-[var(--text-secondary)]">Offset score</span>
          <span className="font-semibold tabular-nums text-[var(--text-primary)]">{pct0(offset)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF1F6]">
          <div className="h-full rounded-full bg-[#4F8DFF]" style={{ width: `${offset * 100}%` }} />
        </div>
      </div>
    </button>
  );
}

/* ---------- page ---------- */

export default function HedgePage() {
  const [selectedId, setSelectedId] = React.useState(hedgeSuggestions[0]?.id ?? "");
  const [query, setQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"strength" | "offset">("strength");

  const selected = hedgeSuggestions.find((s) => s.id === selectedId) ?? hedgeSuggestions[0];
  const base = selected.position;
  const cal = base.calibration;

  // live controls
  const [notional, setNotional] = React.useState(base.equityLeg.size);
  const [hedgeRatio, setHedgeRatio] = React.useState(base.defaultHedgeRatio);
  const [stressMove, setStressMove] = React.useState(cal.moveAdverse);
  const [eventOdds, setEventOdds] = React.useState(cal.yesProbability);
  const [scenarioOpen, setScenarioOpen] = React.useState(false);

  const [status, setStatus] = React.useState<"idle" | "placing" | "placed">("idle");
  const [error, setError] = React.useState<string | null>(null);

  const resetTicket = React.useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const applyDefaults = React.useCallback((s: HedgeSuggestion) => {
    setNotional(s.position.equityLeg.size);
    setHedgeRatio(s.position.defaultHedgeRatio);
    setStressMove(s.position.calibration.moveAdverse);
    setEventOdds(s.position.calibration.yesProbability);
  }, []);

  const selectSuggestion = (id: string) => {
    const next = hedgeSuggestions.find((s) => s.id === id);
    if (!next) return;
    setSelectedId(id);
    applyDefaults(next);
    resetTicket();
  };

  // derived position drives all the two-state math
  const position = React.useMemo<CombinedPosition>(
    () => ({
      ...base,
      equityLeg: { ...base.equityLeg, size: notional },
      calibration: { ...cal, moveAdverse: stressMove, yesProbability: eventOdds },
    }),
    [base, cal, notional, stressMove, eventOdds],
  );

  const preview = React.useMemo(() => computePreview(position, hedgeRatio), [position, hedgeRatio]);
  const sizing = React.useMemo(() => {
    const full = sizeTwoState(notional, position.calibration);
    return scaleSizing(notional, full, hedgeRatio);
  }, [position, notional, hedgeRatio]);

  const endpoints = React.useMemo(() => {
    const pts = computePayoff(position, hedgeRatio, 2);
    const a = pts[0];
    const b = pts[pts.length - 1];
    // adverse = the resolution that hurts the equity most (lowest unhedged P&L)
    const adverse = a.unhedged <= b.unhedged ? a : b;
    return { adverse, favorable: adverse === a ? b : a };
  }, [position, hedgeRatio]);

  const protectedUsd = Math.max(0, preview.maxLoss - preview.unhedgedWorst);
  const premiumPct = notional > 0 ? preview.hedgeSize / notional : 0;
  const isDefaults =
    notional === base.equityLeg.size &&
    Math.abs(hedgeRatio - base.defaultHedgeRatio) < 1e-9 &&
    stressMove === cal.moveAdverse &&
    eventOdds === cal.yesProbability;

  const exposures = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return hedgeSuggestions
      .filter((s) =>
        q
          ? `${s.equityLabel} ${s.equitySymbols.join(" ")} ${s.hedgeMarket}`.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) =>
        sortBy === "strength"
          ? STRENGTH_RANK[b.strength] - STRENGTH_RANK[a.strength]
          : offsetScore(b.position, b.position.equityLeg.size, b.position.defaultHedgeRatio) -
            offsetScore(a.position, a.position.equityLeg.size, a.position.defaultHedgeRatio),
      );
  }, [query, sortBy]);

  const buyPair = React.useCallback(async () => {
    setStatus("placing");
    setError(null);
    try {
      const res = await fetch("/api/orders/combined", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equity: {
            symbol: base.equityLeg.symbols[0],
            notionalUsd: Math.round(notional),
            action: "buy",
            order_type: "market",
          },
          hedge: {
            market_id: `curated:${selected.id}`,
            side: selected.hedgeSide,
            notionalUsd: Math.max(1, Math.round(preview.hedgeSize)),
            price: base.hedgeLeg.marketPrice,
            label: `${selected.hedgeSide} · ${selected.hedgeMarket}`,
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? `order failed (${res.status})`);
      }
      setStatus("placed");
      window.dispatchEvent(new CustomEvent("verso:account-updated"));
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "could not place combo");
    }
  }, [base, selected, notional, preview.hedgeSize]);

  return (
    <div className="mx-auto flex max-w-[1540px] flex-col gap-6 px-8 py-6">
      <div>
        <h1 className="flex items-center gap-2 text-[24px] font-semibold tracking-[-0.025em] text-[var(--text-primary)]">
          <ShieldCheck className="size-6 text-[#4F8DFF]" strokeWidth={2} />
          Hedge builder
        </h1>
        <p className="mt-2 max-w-[820px] text-[14px] font-medium leading-6 text-[var(--text-secondary)]">
          Pick an exposure, then size the hedge and stress-test the outcome. Numbers update live.
          Curated by our analysts — not financial advice.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* ── exposures ─────────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">Your exposures</h2>
            <div className="flex items-center gap-0.5 rounded-[9px] bg-[var(--muted-surface)] p-0.5">
              {(["strength", "offset"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSortBy(k)}
                  className={cn(
                    "rounded-[7px] px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                    sortBy === k
                      ? "bg-white text-[var(--text-primary)] shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exposures…"
              className="h-10 w-full rounded-[12px] border border-[var(--border-soft)] bg-white pl-10 pr-3 text-[13px] font-medium text-[var(--text-primary)] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#4F8DFF] focus:ring-4 focus:ring-[#4F8DFF]/10"
            />
          </div>

          <div className="flex flex-col gap-3">
            {exposures.map((s) => (
              <ExposureCard
                key={s.id}
                suggestion={s}
                selected={s.id === selectedId}
                onSelect={() => selectSuggestion(s.id)}
              />
            ))}
            {exposures.length === 0 && (
              <p className="rounded-[14px] border border-dashed border-[var(--border-soft)] bg-white px-4 py-8 text-center text-[13px] font-medium text-[var(--text-muted)]">
                No exposures match.
              </p>
            )}
          </div>
        </section>

        {/* ── builder ───────────────────────────────────────────── */}
        <section className="flex flex-col gap-4 rounded-[20px] border border-[var(--border-soft)] bg-white p-5">
          {/* summary bar */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
                <Sparkles className="size-4 text-[#4F8DFF]" />
                {selected.equityLabel}
                <ArrowRight className="size-3.5 text-[var(--text-muted)]" />
                <SideTag side={selected.hedgeSide} />
                <span className="truncate text-[var(--text-secondary)]">{selected.hedgeMarket}</span>
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--text-secondary)]">
                {summarize(position, hedgeRatio)}
              </p>
            </div>
            <div className="shrink-0 rounded-[10px] border border-[var(--border-soft)] px-3 py-1.5 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Offset</p>
              <p className="text-[15px] font-bold tabular-nums text-[#4F8DFF]">{pct0(preview.hedgeQuality)}</p>
            </div>
          </div>

          {/* worst-case banner */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[12px] bg-[#F8FAFC] px-4 py-3">
            <TrendingDown className="size-4 text-[#4F8DFF]" />
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">Worst case</span>
            <span className="text-[13px] font-semibold tabular-nums text-[#94A3B8] line-through">
              {signed(preview.unhedgedWorst)}
            </span>
            <ArrowRight className="size-3.5 text-[var(--text-muted)]" />
            <span className="text-[14px] font-bold tabular-nums text-[var(--text-primary)]">
              {signed(preview.maxLoss)}
            </span>
            <span className="ml-auto rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[12px] font-bold tabular-nums text-[#16A34A]">
              {signed(protectedUsd)} cushioned
            </span>
          </div>

          <PayoffChart position={position} hedgeRatio={hedgeRatio} />
          <div className="-mt-1 flex items-center justify-between px-1 text-[11px] font-medium text-[var(--text-muted)]">
            <span>◀ Adverse outcome</span>
            <span>Favorable outcome ▶</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="h-[2px] w-4 rounded bg-[#4F8DFF]" /> Hedged
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-[2px] w-4 rounded bg-[#94A3B8]" /> Unhedged
            </span>
          </div>

          {/* outcome cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <OutcomeCard
              kind="adverse"
              title="If it goes against you"
              sub={`${selected.equitySymbols.join(" · ")} ${pct1(stressMove)} · hedge pays out`}
              unhedged={endpoints.adverse.unhedged}
              hedged={endpoints.adverse.hedged}
            />
            <OutcomeCard
              kind="favorable"
              title="If it goes your way"
              sub={`${selected.equitySymbols.join(" · ")} ${pct1(cal.moveFavorable)} · hedge expires`}
              unhedged={endpoints.favorable.unhedged}
              hedged={endpoints.favorable.hedged}
            />
          </div>

          {/* controls */}
          <div className="flex flex-col gap-4 rounded-[14px] border border-[var(--border-soft)] bg-[#FCFDFE] p-4">
            <ControlRow label="Position size" value={money(notional)}>
              <div className="mb-2.5 flex gap-1.5">
                {NOTIONAL_PRESETS.map((v) => (
                  <Chip key={v} active={notional === v} onClick={() => { setNotional(v); resetTicket(); }}>
                    {v >= 1000 ? `$${v / 1000}k` : `$${v}`}
                  </Chip>
                ))}
              </div>
              <Slider
                value={clamp(notional, 500, 50000)}
                min={500}
                max={50000}
                step={500}
                onChange={(v) => { setNotional(v); resetTicket(); }}
              />
            </ControlRow>

            <ControlRow label="Hedge ratio" value={pct0(hedgeRatio)}>
              <div className="mb-2.5 flex gap-1.5">
                {RATIO_PRESETS.map((p) => (
                  <Chip
                    key={p.label}
                    active={Math.abs(hedgeRatio - p.v) < 1e-9}
                    onClick={() => { setHedgeRatio(p.v); resetTicket(); }}
                  >
                    {p.label}
                  </Chip>
                ))}
              </div>
              <Slider
                value={hedgeRatio}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => { setHedgeRatio(v); resetTicket(); }}
              />
            </ControlRow>

            {/* scenario assumptions */}
            <div className="rounded-[12px] border border-[var(--border-soft)] bg-white">
              <button
                type="button"
                onClick={() => setScenarioOpen((o) => !o)}
                className="flex w-full items-center justify-between px-3.5 py-2.5"
              >
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                  Scenario assumptions
                </span>
                <span className="text-[11px] font-medium text-[var(--text-muted)]">
                  {scenarioOpen ? "Hide" : "What-if ▾"}
                </span>
              </button>
              {scenarioOpen && (
                <div className="flex flex-col gap-4 border-t border-[var(--border-soft)] px-3.5 py-3.5">
                  <ControlRow
                    label={`If it happens, ${selected.equitySymbols.join(" · ")} move`}
                    value={pct1(stressMove)}
                  >
                    <Slider
                      value={stressMove}
                      min={-0.3}
                      max={-0.01}
                      step={0.01}
                      onChange={(v) => { setStressMove(v); resetTicket(); }}
                    />
                  </ControlRow>
                  <ControlRow label="Event odds (implied)" value={pct0(eventOdds)}>
                    <Slider
                      value={eventOdds}
                      min={0.05}
                      max={0.95}
                      step={0.01}
                      onChange={(v) => { setEventOdds(v); resetTicket(); }}
                    />
                  </ControlRow>
                  <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
                    {sizing.approachNote}
                  </p>
                </div>
              )}
            </div>

            {!isDefaults && (
              <button
                type="button"
                onClick={() => { applyDefaults(selected); resetTicket(); }}
                className="flex items-center gap-1.5 self-start text-[12px] font-semibold text-[#4F8DFF] hover:underline"
              >
                <RotateCcw className="size-3.5" /> Reset to suggested
              </button>
            )}
          </div>

          {/* metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric label="Net cost" value={money(preview.netCost)} />
            <Metric
              label="Hedge premium"
              value={money(preview.hedgeSize)}
              sub={`${pct1(premiumPct)} of position`}
            />
            <Metric label={`${sizing.execSide} contracts`} value={sizing.contracts.toLocaleString("en-US")} />
            <Metric label="Downside protected" value={signed(protectedUsd)} tone="green" />
            <Metric label="Max gain" value={signed(preview.maxGain)} tone="green" />
            <Metric label="Max loss" value={signed(preview.maxLoss)} tone="red" />
          </div>

          {/* order ticket */}
          <div className="flex flex-col gap-2 rounded-[14px] border border-[var(--border-soft)] bg-[#FCFDFE] p-4">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--text-secondary)]">
                Buy {selected.equitySymbols[0]} equity
              </span>
              <span className="font-semibold tabular-nums text-[var(--text-primary)]">{money(notional)}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                Hedge <SideTag side={selected.hedgeSide} /> {sizing.contracts.toLocaleString("en-US")} @ {cents(base.hedgeLeg.marketPrice)}
              </span>
              <span className="font-semibold tabular-nums text-[var(--text-primary)]">{money(preview.hedgeSize)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-[var(--border-soft)] pt-2 text-[13px]">
              <span className="font-semibold text-[var(--text-primary)]">Total outlay</span>
              <span className="font-bold tabular-nums text-[var(--text-primary)]">{money(preview.netCost)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={buyPair}
            disabled={status === "placing" || status === "placed"}
            className={cn(
              "flex h-11 w-full items-center justify-center gap-2 rounded-[12px] text-[13px] font-semibold text-white transition-colors disabled:cursor-default",
              status === "placed" ? "bg-[#16A34A]" : "bg-[#050505] hover:bg-[#1f1f1f]",
            )}
          >
            {status === "placing" ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2} /> Placing…
              </>
            ) : status === "placed" ? (
              <>
                <CheckCircle2 className="size-4" strokeWidth={2} /> Added to portfolio
              </>
            ) : (
              <>
                Buy this pair · {money(preview.netCost)} <ArrowRight className="size-4" strokeWidth={2} />
              </>
            )}
          </button>
          {error ? (
            <p className="-mt-1 text-center text-[12px] font-medium text-[#EF4444]">{error}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
