"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
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
  type HedgeSuggestion,
} from "@/lib/mockData";
import { scaleSizing, sizeTwoState } from "@/lib/hedgeMath";

/* ---------- helpers ---------- */

function formatMoney(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function formatSigned(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
}

function formatCents(price: number): string {
  return `${Math.round(price * 100)}¢`;
}

// Offset score from two-state hedge quality at the default ratio.
function offsetScore(suggestion: HedgeSuggestion): number {
  const p = suggestion.position;
  const full = sizeTwoState(p.equityLeg.size, p.calibration);
  const scaled = scaleSizing(p.equityLeg.size, full, p.defaultHedgeRatio);
  return scaled.hedgeQuality;
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
  return (
    <div className="rounded-[10px] border border-[#ececec] bg-white px-3 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      {payload.map((row) => (
        <div key={row.name} className="flex items-center justify-between gap-4 text-[12px]">
          <span className="flex items-center gap-1.5 text-[#737373]">
            <span className="size-2 rounded-full" style={{ background: row.color }} />
            {row.name}
          </span>
          <span className="font-semibold text-[#0a0a0a]">
            {formatSigned(Number(row.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

function PayoffChart({
  suggestion,
  hedgeRatio,
}: {
  suggestion: HedgeSuggestion;
  hedgeRatio: number;
}) {
  const data = React.useMemo(() => {
    const points = computePayoff(suggestion.position, hedgeRatio);
    return points.map((p, i) => ({
      hedged: p.hedged,
      unhedged: p.unhedged,
      label: i === 0 ? "Downside" : i === points.length - 1 ? "Upside" : "",
    }));
  }, [suggestion, hedgeRatio]);

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 16, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="0" />
          <XAxis
            dataKey="label"
            interval={0}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#a3a3a3", fontSize: 11, fontWeight: 600 }}
            padding={{ left: 8, right: 8 }}
          />
          <YAxis
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: "#a3a3a3", fontSize: 11, fontWeight: 600 }}
            tickFormatter={(v: number) => formatSigned(v)}
          />
          <Tooltip content={<PayoffTooltip />} cursor={{ stroke: "#0a0a0a", strokeWidth: 1, strokeDasharray: "4 2" }} />
          <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />
          <Line
            name="Unhedged"
            type="monotone"
            dataKey="unhedged"
            stroke="#a3a3a3"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            name="Hedged"
            type="monotone"
            dataKey="hedged"
            stroke="#0a0a0a"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 2, fill: "#0a0a0a" }}
            isAnimationActive={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- exposure / suggestion card ---------- */

function SideTag({ side }: { side: HedgeSuggestion["hedgeSide"] }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-bold",
        side === "YES" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]",
      )}
    >
      {side}
    </span>
  );
}

function ExposureCard({
  suggestion,
  selected,
  onSelect,
}: {
  suggestion: HedgeSuggestion;
  selected: boolean;
  onSelect: () => void;
}) {
  const offset = offsetScore(suggestion);
  const basisRisk = Math.round((1 - offset) * 100);
  const notional = suggestion.position.equityLeg.size;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-3 rounded-[16px] border bg-white p-4 text-left transition-all duration-150",
        selected
          ? "border-[#d0d0d0] shadow-[0_0_0_3px_rgba(0,0,0,0.04)]"
          : "border-[#ececec] hover:border-[#d0d0d0]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-[#0a0a0a]">{suggestion.equityLabel}</p>
          <p className="mt-0.5 truncate text-[12px] font-medium text-[#a3a3a3]">
            {suggestion.equitySymbols.join(" · ")} · {formatMoney(notional)}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[#ececec] px-2 py-1 text-[11px] font-semibold text-[#737373]">
          {suggestion.strength}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[12px]">
        <SideTag side={suggestion.hedgeSide} />
        <span className="min-w-0 truncate text-[#0a0a0a]">{suggestion.hedgeMarket}</span>
        <span className="ml-auto shrink-0 font-semibold tabular-nums text-[#0a0a0a]">
          {formatCents(suggestion.hedgePrice)}
        </span>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-[11px] text-[#737373]">
          <span>Offset score</span>
          <span className="font-semibold text-[#0a0a0a]">{Math.round(offset * 100)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
          <div className="h-full rounded-full bg-[#0a0a0a]" style={{ width: `${offset * 100}%` }} />
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-[#737373]">
        {suggestion.rationale}{" "}
        <span className="text-[#a3a3a3]">· leaves ~{basisRisk}% basis risk</span>
      </p>
      <p className="text-[11px] leading-relaxed text-[#a3a3a3]">{suggestion.approachNote}</p>
    </button>
  );
}

/* ---------- stat ---------- */

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red";
}) {
  return (
    <div className="rounded-[12px] border border-[#ececec] bg-white p-3">
      <p className="text-[11px] font-medium text-[#a3a3a3]">{label}</p>
      <p
        className={cn(
          "mt-1 text-[15px] font-bold tabular-nums",
          tone === "green" ? "text-[#16a34a]" : tone === "red" ? "text-[#dc2626]" : "text-[#0a0a0a]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/* ---------- page ---------- */

export default function HedgePage() {
  const [selectedId, setSelectedId] = React.useState(hedgeSuggestions[0]?.id ?? "");
  const selected =
    hedgeSuggestions.find((s) => s.id === selectedId) ?? hedgeSuggestions[0];

  const [hedgeRatio, setHedgeRatio] = React.useState(
    selected?.position.defaultHedgeRatio ?? 0.3,
  );

  const selectSuggestion = (id: string) => {
    setSelectedId(id);
    const next = hedgeSuggestions.find((s) => s.id === id);
    if (next) setHedgeRatio(next.position.defaultHedgeRatio);
    resetTicket();
  };

  const preview = React.useMemo(
    () => (selected ? computePreview(selected.position, hedgeRatio) : null),
    [selected, hedgeRatio],
  );

  const [status, setStatus] = React.useState<"idle" | "placing" | "placed">("idle");
  const [error, setError] = React.useState<string | null>(null);

  // Reset the button whenever the chosen combo changes.
  const resetTicket = React.useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const buyPair = React.useCallback(async () => {
    if (!selected || !preview) return;
    const { position } = selected;
    setStatus("placing");
    setError(null);
    try {
      const res = await fetch("/api/orders/combined", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equity: {
            symbol: position.equityLeg.symbols[0],
            notionalUsd: Math.round(position.equityLeg.size),
            action: "buy",
            order_type: "market",
          },
          hedge: {
            market_id: `curated:${selected.id}`,
            side: selected.hedgeSide,
            notionalUsd: Math.max(1, Math.round(preview.hedgeSize)),
            price: position.hedgeLeg.marketPrice,
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
  }, [selected, preview]);

  return (
    <div className="mx-auto flex max-w-[1540px] flex-col gap-6 px-8 py-6">
      <div>
        <h1 className="flex items-center gap-2 text-[24px] font-semibold tracking-[-0.025em] text-[var(--text-primary)]">
          <ShieldCheck className="size-6 text-[#0a0a0a]" strokeWidth={2} />
          Hedge
        </h1>
        <p className="mt-2 max-w-[820px] text-[14px] font-medium leading-6 text-[var(--text-secondary)]">
          The following combos are prepared by our in-house team of analysts. Not
          financial advice.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_560px]">
        {/* Suggestions / exposures */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#0a0a0a]">Your exposures</h2>
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
              Curated hedges
            </span>
          </div>
          {hedgeSuggestions.map((s) => (
            <ExposureCard
              key={s.id}
              suggestion={s}
              selected={s.id === selectedId}
              onSelect={() => selectSuggestion(s.id)}
            />
          ))}
        </section>

        {/* Combined payoff */}
        <section className="flex flex-col gap-4 rounded-[20px] border border-[#ececec] bg-white p-5">
          {selected && preview ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0a0a0a]">
                    <Sparkles className="size-4 text-[#0a0a0a]" />
                    Combined payoff
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#737373]">
                    {summarize(selected.position, hedgeRatio)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <SideTag side={selected.hedgeSide} />
                </div>
              </div>

              <PayoffChart suggestion={selected} hedgeRatio={hedgeRatio} />

              <div className="flex items-center gap-2 text-[11px] font-medium text-[#737373]">
                <span className="flex items-center gap-1.5">
                  <span className="h-[2px] w-4 rounded bg-[#0a0a0a]" /> Hedged
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-[2px] w-4 rounded bg-[#a3a3a3]" /> Unhedged
                </span>
                <span className="ml-auto flex items-center gap-1 text-[#a3a3a3]">
                  <TrendingDown className="size-3.5" /> downside cushioned
                </span>
              </div>

              {/* hedge ratio slider */}
              <div>
                <div className="mb-2 flex items-center justify-between text-[12px]">
                  <span className="text-[#737373]">Hedge ratio</span>
                  <span className="font-semibold tabular-nums text-[#0a0a0a]">
                    {Math.round(hedgeRatio * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={hedgeRatio}
                  onChange={(e) => {
                    setHedgeRatio(Number(e.target.value));
                    resetTicket();
                  }}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#f0f0f0] accent-[#0a0a0a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Net cost" value={formatMoney(preview.netCost)} />
                <Stat label="Hedge size" value={formatMoney(preview.hedgeSize)} />
                <Stat label="Max gain" value={formatSigned(preview.maxGain)} tone="green" />
                <Stat label="Max loss" value={formatSigned(preview.maxLoss)} tone="red" />
              </div>

              <button
                type="button"
                onClick={buyPair}
                disabled={status === "placing" || status === "placed"}
                className={cn(
                  "mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] text-[13px] font-semibold text-white transition-colors disabled:cursor-default",
                  status === "placed"
                    ? "bg-[#16a34a]"
                    : "bg-[#0a0a0a] hover:bg-[#262626]",
                )}
              >
                {status === "placing" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                    Placing…
                  </>
                ) : status === "placed" ? (
                  <>
                    <CheckCircle2 className="size-4" strokeWidth={2} />
                    Added to portfolio
                  </>
                ) : (
                  <>
                    Buy this pair
                    <ArrowRight className="size-4" strokeWidth={2} />
                  </>
                )}
              </button>
              {error ? (
                <p className="-mt-1 text-center text-[12px] font-medium text-[#dc2626]">
                  {error}
                </p>
              ) : null}
            </>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <p className="text-[14px] font-semibold text-[#0a0a0a]">Select an exposure</p>
              <p className="mt-1 text-[12px] text-[#737373]">
                The payoff chart will show how the hedge flattens your downside.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
