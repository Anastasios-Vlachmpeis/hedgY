import type { ExposureSlice } from "../lib/api/types";
import { formatMoney, formatPercent } from "../lib/format";

const COLORS = [
  "#000080",
  "#5b8def",
  "#ffc24b",
  "#4dd0e1",
  "#ff5a3c",
  "#9aa0a6",
  "#9b7bff",
];

interface ExposureChartProps {
  title: string;
  data: ExposureSlice[];
  emptyMessage?: string;
}

export function ExposureChart({ title, data, emptyMessage }: ExposureChartProps) {
  const max = data.reduce((m, d) => Math.max(m, d.pct), 0) || 1;

  return (
    <div>
      <h3 className="mb-5 text-xs uppercase tracking-wide text-text-dim">
        {title}
      </h3>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-dim">
          {emptyMessage ?? "No exposure data"}
        </p>
      ) : (
        <ul className="space-y-5">
          {data.map((d, i) => (
            <li key={d.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="truncate text-text-dim">{d.label}</span>
                </span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-semibold">
                    {formatPercent(d.pct, false)}
                  </span>
                  <span className="ml-2 text-text-dim">
                    {formatMoney(d.value, true)}
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(d.pct / max) * 100}%`,
                    background: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
