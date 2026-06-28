import {
  Area,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PayoffResult } from "../lib/api/types";
import { formatMoney, formatPercent } from "../lib/format";

export function PayoffChart({ result }: { result: PayoffResult }) {
  const data = result.points.map((p) => ({
    move: p.x,
    moveLabel: formatPercent(p.x, true),
    unhedged: p.unhedged,
    combined: p.combined,
  }));

  const worstPoint = result.points.reduce((min, p) =>
    p.unhedged < min.unhedged ? p : min,
  );
  const savedAtWorst = worstPoint.unhedged - worstPoint.combined;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 8 }}>
            <XAxis
              dataKey="move"
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              stroke="var(--text-dim)"
              tick={{ fill: "var(--text-dim)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatMoney(v, true)}
              stroke="var(--text-dim)"
              tick={{ fill: "var(--text-dim)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload;
                return (
                  <div className="glass-strong rounded-lg px-3 py-2 text-xs">
                    <p className="text-text-dim">Stock move: {row.moveLabel}</p>
                    <p className="text-down">
                      Unhedged: {formatMoney(row.unhedged)}
                    </p>
                    <p className="text-up">
                      Combined: {formatMoney(row.combined)}
                    </p>
                  </div>
                );
              }}
            />

            {/* Residual risk band */}
            <ReferenceArea
              x1={-0.2}
              x2={-0.05}
              fill="var(--express)"
              fillOpacity={0.08}
              strokeOpacity={0}
            />

            <Line
              type="monotone"
              dataKey="unhedged"
              stroke="#FF5000"
              strokeWidth={2.5}
              dot={false}
              name="Unhedged"
              isAnimationActive={!reducedMotion}
            />
            <Line
              type="monotone"
              dataKey="combined"
              stroke="#000080"
              strokeWidth={3}
              dot={false}
              name="Combined"
              isAnimationActive={!reducedMotion}
            />

            <Area
              type="monotone"
              dataKey="combined"
              fill="#000080"
              fillOpacity={0.18}
              stroke="none"
              isAnimationActive={!reducedMotion}
            />

            <ReferenceDot
              x={worstPoint.x}
              y={worstPoint.combined}
              r={5}
              fill="#000080"
              stroke="var(--bg)"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="glass-inset mt-2 flex items-center justify-between rounded-xl px-3 py-2 text-xs">
          <span className="text-text-dim">Worst-case savings</span>
          <span className="font-semibold text-up tabular-nums">
            {formatMoney(savedAtWorst)} protected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          label="Variance removed"
          value={formatPercent(result.varianceRemovedPct, false)}
          accent="accent"
        />
        <StatTile
          label="Basis risk left"
          value={formatPercent(result.residualRiskPct, false)}
          accent="express"
        />
        <StatTile
          label="Hedge cost"
          value={`${result.hedgeCostBps} bps`}
          accent="dim"
        />
      </div>

      <div className="flex gap-4 text-xs text-text-dim">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-down" /> Unhedged
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-accent" /> Combined
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-express/20" /> Residual band
        </span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "accent" | "up" | "express" | "dim";
}) {
  const colors = {
    accent: "text-white",
    up: "text-up",
    express: "text-express",
    dim: "text-text",
  };
  const tile = {
    accent: "bg-accent/25 border-accent/40",
    up: "",
    express: "",
    dim: "",
  };
  return (
    <div className={`glass rounded-xl p-3 text-center ${tile[accent]}`}>
      <p className="text-xs uppercase tracking-wide text-text-dim">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${colors[accent]}`}>
        {value}
      </p>
    </div>
  );
}
