import * as React from "react";
import {
  TrendingUp,
  Shield,
  Target,
  Globe,
  CalendarClock,
  SlidersHorizontal,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";

import { Reveal } from "@/components/ui/reveal";

/* ──────────────────────────────────────────────────────────────────────────
   "How it works" — the product explainer that sits directly below the hero.
   An educational product diagram, not a marketing section: a user should
   understand the entire business in under five seconds.
   ────────────────────────────────────────────────────────────────────────── */

export function ProductExplainer() {
  return (
    <section className="relative bg-[#FAFAFC] px-6 py-24 text-[#0F172A] sm:py-28 lg:py-32">
      <div className="mx-auto w-full max-w-[1400px]">
        {/* ── header ─────────────────────────────────────────────────────── */}
        <Reveal className="flex flex-col items-center text-center">
          <span className="inline-flex rounded-full bg-[#F1EEFF] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7C5CFF]">
            How it works
          </span>

          <h2 className="mt-6 text-[40px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[52px] lg:text-[64px]">
            Two markets. <span className="text-[#7C5CFF]">One position.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-[650px] text-[18px] leading-[1.55] text-[#64748B]">
            Combine traditional assets with prediction markets to express your view
            while protecting against real-world risk.
          </p>
        </Reveal>

        {/* ── process row ────────────────────────────────────────────────── */}
        <Reveal
          delay={80}
          className="mt-16 flex flex-col items-stretch gap-10 md:flex-row md:items-start md:gap-0"
        >
          {STEPS.map((s, i) => (
            <React.Fragment key={s.title}>
              <div className="flex flex-1 basis-0 flex-col items-center px-4 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl border border-[#E8EBF2] bg-white shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)]">
                  <s.icon className="size-6 text-[#7C5CFF]" strokeWidth={1.7} />
                </span>
                <h3 className="mt-4 text-[16px] font-semibold text-[#0F172A]">{s.title}</h3>
                <p className="mt-1.5 max-w-[260px] text-[13.5px] leading-[1.55] text-[#64748B]">
                  {s.desc}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="mt-7 hidden h-px w-12 shrink-0 self-start border-t-2 border-dotted border-[#D5DBE8] md:block lg:w-20"
                />
              )}
            </React.Fragment>
          ))}
        </Reveal>

        {/* ── main demonstration card ────────────────────────────────────── */}
        <Reveal delay={120} className="mt-16">
          <div className="rounded-[28px] border border-[#E8EBF2] bg-white p-5 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.28)] sm:p-7 lg:p-9">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_128px_minmax(0,0.95fr)_minmax(0,0.95fr)] lg:gap-5">
              <LeftAnalysis />
              <Spine />
              <Legs />
              <SummaryCard />
            </div>
          </div>
        </Reveal>

        {/* ── feature strip ──────────────────────────────────────────────── */}
        <Reveal
          delay={80}
          className="mt-16 grid grid-cols-1 gap-x-8 gap-y-9 border-t border-[#E8EBF2] pt-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-3.5">
              <span className="flex size-10 items-center justify-center rounded-[12px] bg-[#F4F2FF]">
                <f.icon className="size-5 text-[#7C5CFF]" strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-[#0F172A]">{f.title}</h3>
                <p className="mt-1 text-[13.5px] leading-[1.5] text-[#64748B]">{f.desc}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ── left: thesis + institutional chart + KPIs ───────────────────────────── */

function LeftAnalysis() {
  return (
    <div className="flex flex-col">
      <h3 className="text-[20px] font-semibold leading-snug tracking-[-0.01em] text-[#0F172A]">
        Long tech exposure,
        <br />
        hedge a rate cut in July.
      </h3>
      <p className="mt-2 max-w-[440px] text-[14px] leading-[1.55] text-[#64748B]">
        Hold large-cap tech for the upside, then offset the risk of the July Fed
        decision. Verso sizes both sides so the position stays balanced.
      </p>

      {/* chart card */}
      <div className="mt-5 rounded-[18px] border border-[#E8EBF2] bg-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Legend swatch="#5E8CFF" label="Hedged" />
            <Legend swatch="#D98DFF" label="Unhedged" />
          </div>
          <div className="rounded-full border border-[#E8EBF2] bg-white px-2.5 py-1 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.4)]">
            <span className="text-[13px] font-semibold tabular-nums text-[#0F172A]">$11,420</span>
            <span className="ml-1.5 text-[12px] font-medium tabular-nums text-[#16A34A]">+14.2%</span>
          </div>
        </div>

        <HedgeChart />

        <div className="mt-2 flex justify-between px-0.5 text-[11px] tabular-nums text-[#94A3B8]">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>

      {/* KPI boxes */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Kpi label="Historical correlation" value="−0.72" />
        <Kpi label="Hedge effectiveness" value="83%" valueClassName="text-[#16A34A]" />
        <Kpi label="Optimal hedge ratio" value="0.58" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
      <span className="h-[3px] w-4 rounded-full" style={{ background: swatch }} />
      {label}
    </span>
  );
}

function HedgeChart() {
  return (
    <div className="relative mt-3 h-[176px] w-full">
      <svg
        viewBox="0 0 560 200"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="hedge-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5E8CFF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#5E8CFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[40, 90, 140].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="560"
            y2={y}
            stroke="#EEF1F6"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <line
          x1="0"
          y1="190"
          x2="560"
          y2="190"
          stroke="#E8EBF2"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d="M12,115 L119,122 L226,96 L334,105 L441,79 L548,61 L548,190 L12,190 Z"
          fill="url(#hedge-area)"
        />
        <polyline
          points="12,125 119,119 226,129 334,110 441,116 548,100"
          fill="none"
          stroke="#D98DFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points="12,115 119,122 226,96 334,105 441,79 548,61"
          fill="none"
          stroke="#5E8CFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* current value marker (kept circular by overlaying outside the SVG) */}
      <span
        className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-[#5E8CFF] bg-white"
        style={{ left: "97.8%", top: "30.5%" }}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#E8EBF2] bg-[#FCFCFE] px-3.5 py-3">
      <div className="text-[10.5px] font-medium uppercase tracking-[0.05em] leading-tight text-[#64748B]">
        {label}
      </div>
      <div
        className={`mt-1.5 text-[20px] font-semibold tabular-nums tracking-[-0.01em] text-[#0F172A] ${
          valueClassName ?? ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/* ── center spine: the conceptual flow ───────────────────────────────────── */

function Spine() {
  return (
    <div className="hidden min-h-[460px] flex-col items-center lg:flex">
      <SpineNode label="Stocks" />
      <DashSeg />
      <SpineBadge />
      <DashSeg />
      <SpineNode label="Prediction market" />
      <DashSeg />
      <SpineNode label="One position" />
    </div>
  );
}

function DashSeg() {
  return <span aria-hidden className="my-1 w-px flex-1 border-l border-dashed border-[#D9DEEA]" />;
}

function SpineNode({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="size-3 rounded-full border-[2.5px] border-[#CBD5E1] bg-white" />
      <span className="w-[112px] text-center text-[10px] font-medium uppercase leading-tight tracking-[0.05em] text-[#94A3B8]">
        {label}
      </span>
    </div>
  );
}

function SpineBadge() {
  return (
    <div className="flex flex-col items-center">
      <span className="rounded-2xl border border-[#E5DEFF] bg-[#F4F1FF] px-3 py-1.5 text-center shadow-[0_12px_26px_-18px_rgba(124,92,255,0.7)]">
        <span className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7C5CFF]">
          Hedge ratio
        </span>
        <span className="block text-[16px] font-bold tabular-nums leading-tight text-[#0F172A]">
          0.58
        </span>
      </span>
      <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.05em] text-[#94A3B8]">
        Optimization
      </span>
    </div>
  );
}

/* ── right column: the two legs ──────────────────────────────────────────── */

function Legs() {
  return (
    <div className="flex flex-col gap-4">
      {/* leg 1 — long */}
      <div className="rounded-[18px] border border-[#E8EBF2] bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div className="leading-tight">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
              You go long
            </div>
            <div className="text-[15px] font-semibold text-[#0F172A]">Tech Basket</div>
          </div>
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#EAF0FF]">
            <TrendingUp className="size-[18px] text-[#5E8CFF]" strokeWidth={2} />
          </span>
        </div>

        <div className="mt-3 flex flex-col">
          {TECH.map((s, i) => (
            <div
              key={s.sym}
              className={`flex items-center justify-between py-2 ${
                i > 0 ? "border-t border-[#F1F4F9]" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <s.logo />
                <div className="leading-tight">
                  <div className="text-[13px] font-semibold text-[#0F172A]">{s.sym}</div>
                  <div className="text-[11px] text-[#94A3B8]">{s.name}</div>
                </div>
              </div>
              <div className="text-right leading-tight">
                <div className="text-[13px] font-semibold tabular-nums text-[#0F172A]">{s.price}</div>
                <div className="text-[11px] font-medium tabular-nums text-[#16A34A]">{s.chg}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#F1F4F9] pt-3">
          <span className="text-[20px] font-bold tabular-nums text-[#0F172A]">70%</span>
          <span className="text-[13px] font-medium tabular-nums text-[#64748B]">$7,000</span>
        </div>
      </div>

      {/* leg 2 — hedge */}
      <div className="rounded-[18px] border border-[#E8EBF2] bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div className="leading-tight">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
              You hedge
            </div>
            <div className="text-[15px] font-semibold text-[#0F172A]">Prediction Market</div>
          </div>
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#F1EEFF]">
            <Shield className="size-[18px] text-[#7C5CFF]" strokeWidth={2} />
          </span>
        </div>

        <div className="mt-3 text-[13.5px] font-semibold text-[#0F172A]">Fed rate cut in July?</div>

        <div className="mt-3">
          <div className="flex h-2.5 overflow-hidden rounded-full">
            <span className="bg-[#16A34A]" style={{ width: "62%" }} />
            <span className="bg-[#EF4444]" style={{ width: "38%" }} />
          </div>
          <div className="mt-2 flex justify-between text-[12px] font-medium tabular-nums">
            <span className="text-[#16A34A]">YES 62%</span>
            <span className="text-[#EF4444]">NO 38%</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#F1F4F9] pt-3">
          <span className="text-[20px] font-bold tabular-nums text-[#0F172A]">30%</span>
          <span className="text-[13px] font-medium tabular-nums text-[#64748B]">$3,000</span>
        </div>
      </div>
    </div>
  );
}

/* ── far-right: combined position summary ────────────────────────────────── */

function SummaryCard() {
  return (
    <div className="flex flex-col justify-between gap-6 rounded-[18px] border border-[#E7E2FB] bg-[#FBFAFF] p-5 shadow-[0_24px_60px_-44px_rgba(124,92,255,0.55)]">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#7C5CFF]">
          Your combined position
        </div>
        <div className="mt-4 space-y-4">
          <SummaryRow label="Net cost" value="$10,000" />
          <SummaryRow label="Potential return" value="+14.2%" valueClassName="text-[#16A34A]" />
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-[12px] border border-[#E8EBF2] bg-white p-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7]">
          <ShieldCheck className="size-3.5 text-[#16A34A]" strokeWidth={2.2} />
        </span>
        <div className="leading-tight">
          <div className="text-[12.5px] font-semibold text-[#0F172A]">Downside protected</div>
          <div className="mt-0.5 text-[11.5px] text-[#64748B]">with the NO outcome</div>
        </div>
      </div>

      <div>
        <span className="inline-flex rounded-full bg-[#F1EEFF] px-3 py-1.5 text-[12px] font-semibold text-[#7C5CFF]">
          Balanced. Hedged. Smarter.
        </span>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[13px] text-[#64748B]">{label}</span>
      <span
        className={`text-[22px] font-bold tabular-nums tracking-[-0.01em] text-[#0F172A] ${
          valueClassName ?? ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ── brand marks ─────────────────────────────────────────────────────────── */

function AppleLogo() {
  return (
    <span className="flex size-6 items-center justify-center">
      <svg viewBox="0 0 24 24" className="size-[19px]" fill="#0F172A" aria-hidden>
        <path d="M16.37 1.43c0 1.07-.4 2.09-1.1 2.85-.8.9-2.1 1.6-3.18 1.5-.13-1.04.4-2.16 1.04-2.86.73-.8 2.05-1.4 3.24-1.49ZM20.5 17.2c-.58 1.33-.86 1.92-1.6 3.1-1.04 1.64-2.5 3.68-4.32 3.7-1.6.01-2.02-1.05-4.2-1.04-2.18.01-2.64 1.06-4.25 1.04-1.8-.02-3.18-1.86-4.23-3.5C-1.06 16.6-1.35 11.1 1.12 8.16 2.26 6.79 4.05 5.93 5.73 5.93c1.7 0 2.77 1.05 4.18 1.05 1.36 0 2.19-1.05 4.16-1.05 1.5 0 3.07.81 4.2 2.21-3.69 2.02-3.09 7.29.7 8.76Z" />
      </svg>
    </span>
  );
}

function MicrosoftLogo() {
  return (
    <span className="grid size-6 grid-cols-2 gap-[2px] p-[3px]">
      <span className="rounded-[1px] bg-[#F25022]" />
      <span className="rounded-[1px] bg-[#7FBA00]" />
      <span className="rounded-[1px] bg-[#00A4EF]" />
      <span className="rounded-[1px] bg-[#FFB900]" />
    </span>
  );
}

function NvidiaLogo() {
  return (
    <span className="flex size-6 items-center justify-center rounded-full bg-[#76B900]">
      <svg viewBox="0 0 24 24" className="size-[15px]" fill="none" aria-hidden>
        <path d="M8 9c2.2-2.4 6-2.4 8.2 0 -2.2 2.4-6 2.4-8.2 0Z" fill="#fff" />
        <circle cx="12" cy="9" r="1.5" fill="#76B900" />
        <path d="M6 14c3 2.4 9 2.4 12 0" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* ── data ────────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    icon: TrendingUp,
    title: "Choose your exposure",
    desc: "Pick stocks, ETFs, bonds or options from global markets.",
  },
  {
    icon: Shield,
    title: "Hedge the risk",
    desc: "Select prediction markets related to the events affecting your position.",
  },
  {
    icon: Target,
    title: "One combined position",
    desc: "Verso calculates the optimal hedge ratio and creates one unified investment.",
  },
] as const;

const TECH = [
  { sym: "AAPL", name: "Apple Inc.", price: "$195.42", chg: "+1.24%", logo: AppleLogo },
  { sym: "MSFT", name: "Microsoft Corp.", price: "$415.73", chg: "+0.72%", logo: MicrosoftLogo },
  { sym: "NVDA", name: "NVIDIA Corp.", price: "$128.71", chg: "+2.31%", logo: NvidiaLogo },
] as const;

const FEATURES = [
  { icon: Globe, title: "Access global markets", desc: "Stocks, ETFs, bonds, options." },
  { icon: CalendarClock, title: "Trade real-world events", desc: "Prediction markets on anything." },
  { icon: SlidersHorizontal, title: "Smart hedge engine", desc: "Optimized ratio. Lower risk." },
  { icon: LayoutGrid, title: "One unified position", desc: "All your views. One dashboard." },
] as const;
