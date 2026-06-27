import * as React from "react";

/** Deterministic PRNG so server + client render the identical field. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Radiating "particle-track" motif echoing the brand poster: fine curved
 * tracks + droplets bursting from a focal point, drifting on a slow rotation.
 * Purely decorative; kept low-opacity so it never fights the type.
 */
export function ParticleField({
  className = "",
  lines = 52,
  dots = 46,
  seed = 7,
}: {
  className?: string;
  lines?: number;
  dots?: number;
  seed?: number;
}) {
  const W = 640;
  const H = 460;
  const cx = W / 2;
  const cy = H / 2;
  const rnd = mulberry32(seed);

  const tracks = Array.from({ length: lines }, () => {
    const ang = rnd() * Math.PI * 2;
    const len = 90 + rnd() * 360;
    const curve = (rnd() - 0.5) * 150;
    const x2 = cx + Math.cos(ang) * len;
    const y2 = cy + Math.sin(ang) * len;
    const mx = (cx + x2) / 2 + Math.cos(ang + Math.PI / 2) * curve;
    const my = (cy + y2) / 2 + Math.sin(ang + Math.PI / 2) * curve;
    const red = rnd() < 0.24;
    return {
      d: `M ${cx} ${cy} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
      w: rnd() < 0.16 ? 1.2 : 0.5,
      red,
    };
  });

  const droplets = Array.from({ length: dots }, () => {
    const ang = rnd() * Math.PI * 2;
    const dist = 20 + rnd() * 360;
    return {
      x: (cx + Math.cos(ang) * dist).toFixed(1),
      y: (cy + Math.sin(ang) * dist).toFixed(1),
      r: (1 + rnd() * 4.5).toFixed(1),
      red: rnd() < 0.2,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <g className="anim-spin-slow" style={{ transformOrigin: "center" }}>
        {tracks.map((t, i) => (
          <path
            key={`t${i}`}
            d={t.d}
            stroke={t.red ? "#b3924f" : "#1c1814"}
            strokeWidth={t.w}
            strokeOpacity={t.red ? 0.62 : 0.42}
            strokeLinecap="round"
          />
        ))}
        {droplets.map((d, i) => (
          <circle
            key={`d${i}`}
            cx={d.x}
            cy={d.y}
            r={d.r}
            stroke={d.red ? "#b3924f" : "#1c1814"}
            strokeOpacity={d.red ? 0.55 : 0.34}
            strokeWidth={0.9}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={5.5} fill="#b3924f" className="anim-pulse-dot" />
    </svg>
  );
}
