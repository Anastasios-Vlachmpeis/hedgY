import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { formatMoney } from "../lib/format";

const RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const;

export function LineChart({
  data,
  height = 280,
  showRanges = true,
}: {
  data: number[];
  height?: number;
  showRanges?: boolean;
}) {
  const [activeRange, setActiveRange] = useState<(typeof RANGES)[number]>("1D");

  const chartData = useMemo(
    () => data.map((value, i) => ({ i, value })),
    [data],
  );

  const isUp = data.length > 1 ? data[data.length - 1] >= data[0] : true;
  const color = isUp ? "#2bd96b" : "#FF5000";
  const baseline = data[0] ?? 0;

  return (
    <div>
      {showRanges && (
        <div className="mb-3 flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setActiveRange(r)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeRange === r
                  ? "glass-inset text-text"
                  : "text-text-dim hover:text-text"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              return (
                <div className="glass-strong rounded-lg px-3 py-2 text-sm">
                  <span className="font-semibold tabular-nums">
                    {formatMoney(payload[0].value as number)}
                  </span>
                </div>
              );
            }}
          />
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#chartFill)"
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: "var(--bg)", strokeWidth: 2 }}
            isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches}
          />
          {/* Baseline reference */}
          <Area
            type="monotone"
            dataKey={() => baseline}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
