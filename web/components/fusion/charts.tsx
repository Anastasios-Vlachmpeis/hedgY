"use client";

import * as React from "react";

/* ----------------------------------------------------------------------------
   Lightweight, dependency-free SVG charts tuned for the FUSION dark UI.
   All use a viewBox with non-uniform scaling so they fill any container.
---------------------------------------------------------------------------- */

function toXY(values: number[], w: number, h: number, pad = 2) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = (w - pad * 2) / (values.length - 1 || 1);
  return values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (h - pad * 2) * (1 - (v - min) / span);
    return [x, y] as const;
  });
}

function linePath(pts: ReadonlyArray<readonly [number, number]>) {
  return pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
}

/** Tiny inline sparkline. */
export function Sparkline({
  data,
  up,
  width = 96,
  height = 28,
  strokeWidth = 1.6,
}: {
  data: number[];
  up?: boolean;
  width?: number;
  height?: number;
  strokeWidth?: number;
}) {
  const dir = up ?? data[data.length - 1] >= data[0];
  const color = dir ? "var(--fz-up)" : "var(--fz-down)";
  const pts = toXY(data, width, height, 2);
  const id = React.useId();
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${linePath(pts)} L${pts[pts.length - 1][0]} ${height} L${pts[0][0]} ${height} Z`}
        fill={`url(#sp-${id})`}
      />
      <path d={linePath(pts)} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2} fill={color} />
    </svg>
  );
}

/** Big glowing area chart with grid + animated draw + crosshair hover. */
export function GlowArea({
  data,
  color = "var(--fz-violet)",
  height = 260,
  fmt = (v: number) => v.toLocaleString(),
}: {
  data: number[];
  color?: string;
  height?: number;
  fmt?: (v: number) => string;
}) {
  const W = 760;
  const H = height;
  const pts = toXY(data, W, H, 6);
  const id = React.useId();
  const [hover, setHover] = React.useState<number | null>(null);
  const ref = React.useRef<SVGSVGElement>(null);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p[0] - x);
      if (d < best) { best = d; nearest = i; }
    });
    setHover(nearest);
  };

  const hp = hover != null ? pts[hover] : null;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`ga-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.34" />
            <stop offset="60%" stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`gl-${id}`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="var(--fz-grid)" strokeWidth="1" />
        ))}
        <path d={`${linePath(pts)} L${W} ${H} L0 ${H} Z`} fill={`url(#ga-${id})`} />
        <path
          d={linePath(pts)}
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#gl-${id})`}
          className="fz-draw"
          style={{ strokeDasharray: 2600, strokeDashoffset: 0, animation: "fz-dash 1.6s cubic-bezier(.16,1,.3,1) both" }}
        />
        {hp && (
          <g>
            <line x1={hp[0]} x2={hp[0]} y1={0} y2={H} stroke="var(--fz-axis)" strokeDasharray="3 3" />
            <circle cx={hp[0]} cy={hp[1]} r={5} fill={color} stroke="var(--fz-panel)" strokeWidth="2" />
          </g>
        )}
        <style>{`@keyframes fz-dash{from{stroke-dashoffset:2600}to{stroke-dashoffset:0}}`}</style>
      </svg>
      {hp && hover != null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--fz-line)] bg-[var(--fz-elevated)] px-2.5 py-1 text-[12px] shadow-xl"
          style={{ left: `${(hp[0] / W) * 100}%`, top: `${(hp[1] / H) * 100}%` }}
        >
          <span className="fz-data font-semibold text-white">{fmt(data[hover])}</span>
        </div>
      )}
    </div>
  );
}

/** Allocation donut with hover labels. */
export function Donut({
  segments,
  size = 168,
  thickness = 18,
  center,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--fz-grid)" strokeWidth={thickness} />
        {segments.map((s) => {
          const frac = s.value / total;
          const dash = frac * C;
          const el = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-acc * C}
              style={{ filter: "drop-shadow(0 0 6px rgba(149,128,255,.35))", transition: "stroke-dasharray .8s ease" }}
            />
          );
          acc += frac;
          return el;
        })}
      </svg>
      {center && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>}
    </div>
  );
}

/** Horizontal probability/exposure bar. */
export function Meter({ pct, color = "var(--fz-violet)" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--fz-track)]">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(2, Math.min(100, pct))}%`, background: color, boxShadow: `0 0 12px ${color}` }}
      />
    </div>
  );
}

/** Payoff curve (hedged vs unhedged) for the combined-instrument builder. */
export function PayoffChart({
  hedged,
  unhedged,
  labels,
  height = 200,
}: {
  hedged: number[];
  unhedged: number[];
  labels: [string, string];
  height?: number;
}) {
  const W = 520;
  const H = height;
  const all = [...hedged, ...unhedged, 0];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const x = (i: number, n: number) => 8 + (i / (n - 1)) * (W - 16);
  const y = (v: number) => 12 + (H - 36) * (1 - (v - min) / span);
  const zeroY = y(0);
  const hp = hedged.map((v, i) => [x(i, hedged.length), y(v)] as const);
  const up = unhedged.map((v, i) => [x(i, unhedged.length), y(v)] as const);
  const id = React.useId();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`pf-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--fz-violet)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--fz-violet)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" x2={W} y1={zeroY} y2={zeroY} stroke="var(--fz-axis)" strokeDasharray="4 4" />
      <path d={`${linePath(hp)} L${hp[hp.length - 1][0]} ${zeroY} L${hp[0][0]} ${zeroY} Z`} fill={`url(#pf-${id})`} />
      <path d={linePath(up)} fill="none" stroke="var(--fz-text-3)" strokeWidth="1.8" strokeDasharray="5 4" />
      <path d={linePath(hp)} fill="none" stroke="var(--fz-violet)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(149,128,255,.7))" }} />
      <text x="8" y={H - 6} fill="var(--fz-text-3)" fontSize="11" className="fz-data">{labels[0]}</text>
      <text x={W - 8} y={H - 6} fill="var(--fz-text-3)" fontSize="11" textAnchor="end" className="fz-data">{labels[1]}</text>
    </svg>
  );
}
