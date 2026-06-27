import * as React from "react";
import { Boxes, Globe, Gauge, PieChart } from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { IconTile } from "@/components/ui/icon-tile";
import { SectionHeading } from "@/components/landing/section-heading";

/* ---------- per-card mini visuals (lightly self-animating) ---------- */

function LegsAssembling() {
  return (
    <div className="flex w-full flex-col justify-center gap-2 px-1">
      {[
        { label: "Long defense basket", w: "60%", c: "bg-[#9580ff]" },
        { label: "NO — incumbent wins", w: "40%", c: "bg-[#b3a6ff]" },
      ].map((r) => (
        <div key={r.label} className="rounded-lg bg-white px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#181925]">{r.label}</span>
            <span className="font-mono text-[12px] text-[#666666]">{r.w}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#ececec]">
            <div className={cn("anim-grow h-full rounded-full", r.c)} style={{ width: r.w }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function VenueChips() {
  return (
    <div className="flex w-full flex-wrap content-center justify-center gap-2">
      {["Kalshi", "Polymarket", "Alpaca", "IBKR", "+ more"].map((v) => (
        <span
          key={v}
          className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#3f3f46]"
        >
          {v}
        </span>
      ))}
    </div>
  );
}

function HedgeDial() {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="relative h-20 w-40">
        <svg viewBox="0 0 160 90" className="h-full w-full">
          <path d="M12 84 A68 68 0 0 1 148 84" fill="none" stroke="#ececec" strokeWidth="10" strokeLinecap="round" />
          <path d="M12 84 A68 68 0 0 1 96 22" fill="none" stroke="#9580ff" strokeWidth="10" strokeLinecap="round" />
        </svg>
        <div className="anim-dial absolute bottom-1.5 left-1/2 h-14 w-0.5 -translate-x-1/2 rounded-full bg-[#181925]" />
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 font-mono text-[13px] font-semibold text-[#181925]">
          0.67
        </span>
      </div>
    </div>
  );
}

function ExposureBreakdown() {
  const segs = [
    { c: "bg-[#9580ff]", w: "46%" },
    { c: "bg-[#b3a6ff]", w: "28%" },
    { c: "bg-[#dad9fc]", w: "26%" },
  ];
  return (
    <div className="flex w-full flex-col justify-center gap-3 px-1">
      <div className="flex h-3 overflow-hidden rounded-full bg-white">
        {segs.map((s, i) => (
          <div key={i} className={cn("h-full", s.c)} style={{ width: s.w }} />
        ))}
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
