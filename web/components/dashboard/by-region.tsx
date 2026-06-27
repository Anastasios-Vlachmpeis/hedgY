import * as React from "react";

import type { RegionExposure } from "@/lib/mockData";

/**
 * Static, on-brand globe placeholder. A soft violet sphere with lat/long
 * lines — swapped for a spinning 3D globe later.
 * TODO: globe animation hook — mount react-globe.gl / three.js here, feed it
 * `regions` for arc/marker data. Keep this SVG as the SSR/no-JS fallback.
 */
function GlobePlaceholder() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[150px]">
      <svg viewBox="0 0 200 200" className="size-full">
        <defs>
          <radialGradient id="globe" cx="38%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#b3a6ff" />
            <stop offset="55%" stopColor="#9580ff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="86" fill="url(#globe)" />
        {/* latitudes */}
        <g stroke="#ffffff" strokeOpacity="0.35" fill="none" strokeWidth="1">
          <line x1="20" y1="100" x2="180" y2="100" />
          <ellipse cx="100" cy="100" rx="86" ry="30" />
          <ellipse cx="100" cy="100" rx="86" ry="58" />
          {/* longitudes */}
          <ellipse cx="100" cy="100" rx="30" ry="86" />
          <ellipse cx="100" cy="100" rx="58" ry="86" />
          <line x1="100" y1="14" x2="100" y2="186" />
        </g>
        {/* a couple of activity dots */}
        <circle cx="74" cy="78" r="3.5" fill="#ffffff" />
        <circle cx="120" cy="112" r="3" fill="#ffffff" fillOpacity="0.85" />
      </svg>
    </div>
  );
}

function ByRegion({ regions }: { regions: RegionExposure[] }) {
  return (
    <section className="flex h-full flex-col rounded-[12px] bg-[#f5f5f5] p-4">
      <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
        By Region
      </h2>
      <GlobePlaceholder />
      <ul className="mt-3 flex flex-col gap-1.5">
        {regions.map((r) => (
          <li key={r.region} className="flex items-center gap-2 text-[12px]">
            <span className="text-[#3f3f46]">{r.region}</span>
            <span className="mx-1 h-px flex-1 bg-[#e8e8e8]" />
            <span className="font-mono font-medium text-[#181925]">{r.pct}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { ByRegion };
