import * as React from "react";
import { Boxes, Globe, Gauge, PieChart, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { DialValue } from "@/components/landing/dial-value";
import { IconTile } from "@/components/ui/icon-tile";
import { SectionHeading } from "@/components/landing/section-heading";

/* ---------- per-card mini visuals (lightly self-animating) ---------- */

function LegsAssembling() {
  return (
    <div className="flex w-full flex-col justify-center gap-2 px-1">
      {[
        { label: "Long defense basket", w: "60%", c: "bg-[#9580ff]", d: "0s" },
        { label: "NO — incumbent wins", w: "40%", c: "bg-[#b3a6ff]", d: "0.55s" },
      ].map((r) => (
        <div key={r.label} className="rounded-lg bg-white px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#181925]">{r.label}</span>
            <span className="font-mono text-[12px] text-[#666666]">{r.w}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#ececec]">
            <div
              className={cn("anim-leg relative h-full overflow-hidden rounded-full", r.c)}
              style={{ width: r.w, animationDelay: r.d }}
            >
              <span
                className="anim-leg-glint absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                style={{ animationDelay: r.d }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const VENUES = [
  { name: "Kalshi", mark: "K", bg: "#00B86B", fg: "#ffffff" },
  { name: "Polymarket", mark: "P", bg: "#2D6BFF", fg: "#ffffff" },
  { name: "Alpaca", mark: "A", bg: "#FFD400", fg: "#1A1A1A" },
  { name: "IBKR", mark: "IB", bg: "#D6202A", fg: "#ffffff" },
] as const;

function VenueChips() {
  return (
    <div className="flex w-full flex-wrap content-center justify-center gap-2">
      {VENUES.map((v) => (
        <span
          key={v.name}
          className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-[12px] font-medium text-[#3f3f46] shadow-[0_2px_10px_-6px_rgba(15,23,42,0.35)]"
        >
          <span
            className="flex size-[18px] items-center justify-center rounded-[6px] font-bold tabular-nums"
            style={{
              background: v.bg,
              color: v.fg,
              fontSize: v.mark.length > 1 ? "8px" : "10px",
            }}
          >
            {v.mark}
          </span>
          {v.name}
        </span>
      ))}
      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#71717a] shadow-[0_2px_10px_-6px_rgba(15,23,42,0.35)]">
        <Plus className="size-3.5" strokeWidth={2.4} />
        more
      </span>
    </div>
  );
}

function HedgeDial() {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="relative h-20 w-40">
        <svg viewBox="0 0 160 90" className="h-full w-full">
          <defs>
            <linearGradient id="dial-grad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#b3a6ff" />
              <stop offset="100%" stopColor="#7c5cff" />
            </linearGradient>
          </defs>
          <path d="M12 84 A68 68 0 0 1 148 84" fill="none" stroke="#ececec" strokeWidth="10" strokeLinecap="round" />
          <path
            className="anim-dial-draw"
            d="M12 84 A68 68 0 0 1 148 84"
            fill="none"
            stroke="url(#dial-grad)"
            strokeWidth="10"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset={33}
          />
        </svg>

        {/* needle */}
        <div className="anim-dial-sweep absolute bottom-1.5 left-1/2 h-14 w-px -translate-x-1/2">
          <div className="absolute inset-0 mx-auto w-[2px] rounded-full bg-[#181925]" />
          <span className="anim-dial-pulse absolute -top-1 left-1/2 size-2 rounded-full bg-[#7c5cff] shadow-[0_0_8px_rgba(124,92,255,0.95)]" />
        </div>
        {/* hub */}
        <span className="absolute bottom-1.5 left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-[#e4e4e7] bg-white" />

        <DialValue className="absolute bottom-0 left-1/2 -translate-x-1/2 font-mono text-[13px] font-semibold tabular-nums text-[#181925]" />
      </div>
    </div>
  );
}

function ExposureBreakdown() {
  const segs = [
    { c: "bg-[#9580ff]", w: "46%", d: "0s" },
    { c: "bg-[#b3a6ff]", w: "28%", d: "0.18s" },
    { c: "bg-[#dad9fc]", w: "26%", d: "0.36s" },
  ];
  return (
    <div className="flex w-full flex-col justify-center gap-3 px-1">
      <div className="relative flex h-3 overflow-hidden rounded-full bg-white">
        {segs.map((s, i) => (
          <div
            key={i}
            className={cn("anim-seg h-full", s.c)}
            style={{ width: s.w, animationDelay: s.d }}
          />
        ))}
        <span className="anim-seg-glint pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-transparent via-white/75 to-transparent" />
      </div>
      <div className="flex justify-between text-[12px] text-[#666666]">
        <span>Equities 46%</span>
        <span>Hedges 28%</span>
        <span>Cash 26%</span>
      </div>
    </div>
  );
}

/* ---------- card ---------- */

const FEATURES = [
  {
    icon: Boxes,
    title: "Combined positions",
    desc: "Build one basket from stocks, bonds, options and prediction outcomes in the Basket Builder.",
    visual: <LegsAssembling />,
  },
  {
    icon: Globe,
    title: "Cross-venue access",
    desc: "Reach every major exchange and prediction market through a single account.",
    visual: <VenueChips />,
  },
  {
    icon: Gauge,
    title: "Hedge real-world risk",
    desc: "We compute the hedge ratio that offsets your thesis with the matching outcome.",
    visual: <HedgeDial />,
  },
  {
    icon: PieChart,
    title: "Unified portfolio & risk",
    desc: "See blended exposure across instruments and venues in one risk view.",
    visual: <ExposureBreakdown />,
  },
] as const;

function Features() {
  return (
    <section id="features" className="px-4 pt-28 sm:pt-32">
      <SectionHeading
        eyebrow="Features"
        title="One workspace for views and hedges"
        sub="Everything you need to express a thesis and protect it — without leaving the position."
      />
      <Reveal className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-[24px] bg-[#f5f5f5] p-7">
            <div className="mb-5 flex h-[132px] flex-col justify-center rounded-[18px] bg-[#f0f0f0]/60 p-4">
              {f.visual}
            </div>
            <IconTile icon={f.icon} />
            <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.01em] text-[#181925]">
              {f.title}
            </h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-[#666666]">{f.desc}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export { Features };
