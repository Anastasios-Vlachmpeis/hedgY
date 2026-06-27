import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

/* ---------- demo areas (172px) ---------- */

function ThesisDemo() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="rounded-[14px] bg-white p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#a3a3a3]">
          Your view
        </p>
        <p className="mt-2 text-[15px] font-semibold leading-snug text-[#181925]">
          &ldquo;Long defense, hedge the election.&rdquo;
        </p>
      </div>
    </div>
  );
}

function StructureDemo() {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {[
        { t: "Defense basket", w: "60%", c: "bg-[#9580ff]" },
        { t: "Election hedge", w: "40%", c: "bg-[#b3a6ff]" },
      ].map((r) => (
        <div key={r.t} className="rounded-[12px] bg-white px-3 py-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium text-[#181925]">{r.t}</span>
            <span className="font-mono text-[#666666]">{r.w}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#ececec]">
            <div className={cn("h-full rounded-full", r.c)} style={{ width: r.w }} />
          </div>
        </div>
      ))}
      <p className="text-center text-[11px] text-[#9580ff]">hedge ratio 0.67</p>
    </div>
  );
}

function ExecuteDemo() {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {["Alpaca — equities filled", "Kalshi — hedge filled"].map((v) => (
        <div
          key={v}
          className="flex items-center gap-2 rounded-[12px] bg-white px-3 py-2.5 text-[12px] font-medium text-[#181925]"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-[#dcfce7]">
            <Check className="size-3 text-[#16a34a]" strokeWidth={3} />
          </span>
          {v}
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  {
    n: 1,
    title: "Tell us your thesis",
    desc: "Describe the real-world view you want exposure to.",
    demo: <ThesisDemo />,
  },
  {
    n: 2,
    title: "We structure the position",
    desc: "Legs and the hedge ratio that balances them, computed for you.",
    demo: <StructureDemo />,
  },
  {
    n: 3,
    title: "Execute in one click",
    desc: "Routed and filled across every venue at once.",
    demo: <ExecuteDemo />,
  },
] as const;

function HowItWorks() {
  return (
    <section id="how" className="px-4 pt-28 sm:pt-32">
      <SectionHeading
        eyebrow="How it works"
        title="From a view to a position in three steps"
        sub="No spreadsheets, no juggling brokers. Describe the idea — we build and execute it."
      />
      <Reveal className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-[20px] bg-[#f6f6f7] p-5">
            <div className="h-[172px] rounded-[14px] bg-[#f0f0f0]/60 p-3">{s.demo}</div>
            <div className="my-4 h-px bg-[#ececec]" />
            <div className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-[#9580ff] font-mono text-[13px] font-semibold text-white">
                {s.n}
              </span>
              <div>
                <h3 className="text-[16px] font-semibold text-[#181925]">{s.title}</h3>
                <p className="mt-1 text-[13.5px] leading-[1.55] text-[#666666]">{s.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export { HowItWorks };
