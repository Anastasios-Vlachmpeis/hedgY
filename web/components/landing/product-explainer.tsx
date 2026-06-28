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
  Info,
  ChevronDown,
} from "lucide-react";

import { Reveal } from "@/components/ui/reveal";

/* ──────────────────────────────────────────────────────────────────────────
   "How it works" — the product explainer that sits directly below the hero.
   An educational product diagram: thesis + live chart on the left, the two
   legs and the combined position on the right, linked by the hedge flow.
   ────────────────────────────────────────────────────────────────────────── */

export function ProductExplainer() {
  return (
    <section id="how-it-works" className="relative overflow-x-clip scroll-mt-8 bg-[#FAFAFC] px-6 pb-24 pt-12 text-[#0F172A] sm:pb-28 sm:pt-14 lg:pb-32 lg:pt-16">
      <div className="mx-auto w-full max-w-[1400px]">
        {/* ── header ─────────────────────────────────────────────────────── */}
        <Reveal className="flex flex-col items-center text-center">
          <h2 className="text-[40px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[52px] lg:text-[64px]">
            Two markets. <span className="text-[#0F172A]">One position.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-[640px] text-[18px] leading-[1.55] text-[#64748B]">
            Combine traditional assets with prediction markets to express your view
            and hedge real-world risk.
          </p>
        </Reveal>

        {/* ── process row ────────────────────────────────────────────────── */}
        <Reveal
          delay={80}
          className="mt-14 flex flex-col items-stretch gap-10 md:flex-row md:items-start md:gap-0"
        >
          {STEPS.map((s, i) => (
            <React.Fragment key={s.title}>
              <div
                className="anim-step flex flex-1 basis-0 flex-col items-center px-4 text-center"
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                <span
                  className="anim-step-glow flex size-14 items-center justify-center rounded-full bg-[#F4F2FF]"
                  style={{ animationDelay: `${1.4 + i * 0.5}s` }}
                >
                  <s.icon className="size-6 text-[#0F172A]" strokeWidth={1.7} />
                </span>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="anim-badge-pulse flex size-[18px] items-center justify-center rounded-full bg-[#0F172A] text-[10px] font-bold text-white"
                    style={{ animationDelay: `${1.4 + i * 0.5}s` }}
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-[16px] font-semibold text-[#0F172A]">{s.title}</h3>
                </div>
                <p className="mt-1.5 max-w-[260px] text-[13.5px] leading-[1.55] text-[#64748B]">
                  {s.desc}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="anim-connector mt-7 hidden h-px w-12 shrink-0 self-start border-t-2 border-dotted border-[#D5DBE8] md:block lg:w-20"
                  style={{ animationDelay: `${0.4 + i * 0.5}s` }}
                />
              )}
            </React.Fragment>
          ))}
        </Reveal>

        {/* ── main demonstration area ────────────────────────────────────── */}
        <Reveal delay={120} className="relative mt-14">
          {/* full-bleed light-grey band so it reads as part of the page, not a card */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-gradient-to-r from-[#F0F1F3] via-[#F6F7F8] to-[#F0F1F3]"
          />
          <div className="relative p-5 sm:p-7 lg:p-9">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-12">
              <ChartPanel />
              <PositionPanel />
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
                <f.icon className="size-5 text-[#0F172A]" strokeWidth={1.8} />
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

/* ── left panel: thesis + diverging chart + KPIs ─────────────────────────── */

function ChartPanel() {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0F172A]">
        Example in action
      </span>
      <h3 className="mt-3 text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-[#0F172A]">
        Long tech exposure, hedge rate cut in July.
      </h3>
      <p className="mt-2 max-w-[460px] text-[14px] leading-[1.55] text-[#64748B]">
        You&rsquo;re long tech for growth, but worried the Fed won&rsquo;t cut rates in
        July. Hedge that risk.
      </p>

      <DivergingChart />

      <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-[16px] border border-[#E8EBF2] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.4)]">
        <Kpi label="Historical correlation" value="−0.72" />
        <Kpi label="Hedge effectiveness" value="83%" valueClassName="text-[#16A34A]" divided />
        <Kpi label="Optimal hedge ratio" value="0.58" divided />
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  valueClassName,
  divided,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  divided?: boolean;
}) {
  return (
    <div className={`px-4 py-3.5 ${divided ? "border-l border-[#EEF1F6]" : ""}`}>
      <div className="flex items-center gap-1 text-[10.5px] font-medium leading-tight text-[#94A3B8]">
        <span className="truncate">{label}</span>
        <Info className="size-3 shrink-0 text-[#CBD5E1]" strokeWidth={2} />
      </div>
      <div
        className={`mt-1.5 text-[19px] font-bold tabular-nums tracking-[-0.01em] text-[#0F172A] ${
          valueClassName ?? ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/* ── the diverging chart ─────────────────────────────────────────────────── */

const BASELINE = 60; // y% of the 0% gridline (range +30 → −20)
const Y_TICKS = [
  { label: "+30%", top: 0 },
  { label: "+20%", top: 20 },
  { label: "+10%", top: 40 },
  { label: "0%", top: 60 },
  { label: "−10%", top: 80 },
  { label: "−20%", top: 100 },
];

function makeSeries(end: number, seed: number, vol: number) {
  let r = seed;
  const rnd = () => {
    r = (r * 1103515245 + 12345) & 0x7fffffff;
    return r / 0x7fffffff;
  };
  const N = 44;
  const pts: Array<readonly [number, number]> = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const smooth = t * t * (3 - 2 * t);
    let p = end * smooth + (rnd() - 0.5) * vol;
    if (i === 0) p = 0;
    if (i === N) p = end;
    const x = t * 100;
    let y = ((30 - p) / 50) * 100;
    y = Math.max(2, Math.min(98, y));
    pts.push([x, y] as const);
  }
  return pts;
}

const BLUE = makeSeries(18.7, 24571, 4.2);
const PINK = makeSeries(-12.3, 9133, 3.6);

const toPolyline = (pts: Array<readonly [number, number]>) =>
  pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
const toArea = (pts: Array<readonly [number, number]>) =>
  `M0,${BASELINE} ${pts.map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`).join(" ")} L100,${BASELINE} Z`;

function DivergingChart() {
  const blueEndY = BLUE[BLUE.length - 1][1];
  const pinkEndY = PINK[PINK.length - 1][1];
  return (
    <div className="mt-5 rounded-[18px] border border-[#E8EBF2] bg-white p-4">
      {/* legend + range selector */}
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <Legend swatch="#6E84FF" label="Tech stocks (long)" />
          <Legend swatch="#EC4899" label="Fed rate cut in July? (NO)" />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-[#E8EBF2] bg-white px-2.5 py-1 text-[12px] font-medium text-[#475569] shadow-[0_6px_16px_-12px_rgba(15,23,42,0.4)]"
        >
          YTD <ChevronDown className="size-3.5 text-[#94A3B8]" />
        </button>
      </div>

      {/* plot */}
      <div className="relative mt-4 h-[210px] w-full pl-9">
        {/* y-axis labels */}
        {Y_TICKS.map((t) => (
          <span
            key={t.label}
            className="absolute left-0 -translate-y-1/2 text-[10px] tabular-nums text-[#94A3B8]"
            style={{ top: `${t.top}%` }}
          >
            {t.label}
          </span>
        ))}

        <div className="relative h-full w-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="exp-blue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6E84FF" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#6E84FF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="exp-pink" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#EC4899" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
              </linearGradient>
            </defs>

            {Y_TICKS.map((t) => (
              <line
                key={t.label}
                x1="0"
                y1={t.top}
                x2="100"
                y2={t.top}
                stroke={t.top === BASELINE ? "#E2E6EF" : "#F1F3F8"}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <path d={toArea(BLUE)} fill="url(#exp-blue)" />
            <path d={toArea(PINK)} fill="url(#exp-pink)" />
            <polyline
              points={toPolyline(PINK)}
              fill="none"
              stroke="#EC4899"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={toPolyline(BLUE)}
              fill="none"
              stroke="#6E84FF"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* end markers + value pills */}
          <EndPill color="#6E84FF" value="+18.7%" top={blueEndY} />
          <EndPill color="#EC4899" value="−12.3%" top={pinkEndY} />
        </div>
      </div>

      {/* x-axis */}
      <div className="mt-2 flex justify-between pl-9 text-[10px] font-medium uppercase tracking-[0.04em] tabular-nums text-[#94A3B8]">
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

function EndPill({ color, value, top }: { color: string; value: string; top: number }) {
  return (
    <div
      className="absolute right-0 flex -translate-y-1/2 items-center gap-1"
      style={{ top: `${top}%` }}
    >
      <span
        className="size-2 rounded-full border-2 border-white"
        style={{ background: color, boxShadow: `0 0 0 1px ${color}` }}
      />
      <span
        className="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white"
        style={{ background: color }}
      >
        {value}
      </span>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
      <span className="size-2 rounded-full" style={{ background: swatch }} />
      {label}
    </span>
  );
}

/* ── right panel: the two legs → combined position ───────────────────────── */

function PositionPanel() {
  return (
    <div className="relative">
      {/* connector flow (desktop) */}
      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        viewBox="0 0 320 240"
        preserveAspectRatio="none"
        aria-hidden
      >
        <g fill="none" stroke="#C7CEDD" strokeWidth="1.4" strokeDasharray="2 4" strokeLinecap="round">
          <path d="M150 70 C 185 70, 188 120, 214 120" />
          <path d="M150 172 C 185 172, 188 120, 214 120" />
        </g>
        <path d="M210 116 l6 4 -6 4" fill="none" stroke="#A9B2C6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)] lg:items-center lg:gap-12">
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 text-[12px] font-semibold text-[#5E8CFF]">You go long</div>
            <LongCard />
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold text-[#0F172A]">You hedge</div>
            <HedgeCard />
          </div>
        </div>
        <CombinedCard />
      </div>
    </div>
  );
}

function LongCard() {
  return (
    <div className="rounded-[18px] border border-[#E8EBF2] bg-white p-4 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.4)]">
      <div className="flex flex-col">
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
                <div className="text-[13px] font-semibold text-[#0F172A]">{s.name}</div>
                <div className="text-[11px] text-[#94A3B8]">{s.sym}</div>
              </div>
            </div>
            <div className="text-right leading-tight">
              <div className="text-[13px] font-semibold tabular-nums text-[#0F172A]">{s.price}</div>
              <div className="text-[11px] font-medium tabular-nums text-[#16A34A]">{s.chg}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-[#F1F4F9] pt-3">
        <span className="text-[14px] font-semibold text-[#0F172A]">Tech Basket</span>
        <div className="text-right leading-tight">
          <span className="text-[16px] font-bold tabular-nums text-[#0F172A]">70%</span>
          <span className="ml-1.5 text-[12px] font-medium tabular-nums text-[#94A3B8]">$7,000</span>
        </div>
      </div>
    </div>
  );
}

function HedgeCard() {
  return (
    <div className="rounded-[18px] border border-[#E8EBF2] bg-white p-4 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.4)]">
      <div className="flex items-start justify-between">
        <div className="leading-tight">
          <div className="text-[13.5px] font-semibold text-[#0F172A]">Fed rate cut in July?</div>
          <div className="mt-0.5 text-[11px] text-[#94A3B8]">Prediction Market · Kalshi</div>
        </div>
        <div className="text-right leading-tight">
          <div className="text-[16px] font-bold tabular-nums text-[#0F172A]">30%</div>
          <div className="text-[11px] font-medium tabular-nums text-[#94A3B8]">$3,000</div>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-[12px] font-semibold tabular-nums">
        <span className="text-[#5E8CFF]">YES 62%</span>
        <span className="text-[#EC4899]">NO 38%</span>
      </div>
      <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-[#EEF1F6]">
        <span className="bg-[#5E8CFF]" style={{ width: "62%" }} />
        <span className="bg-[#EC4899]" style={{ width: "38%" }} />
      </div>
    </div>
  );
}

function CombinedCard() {
  return (
    <div className="flex h-full flex-col gap-5 rounded-[20px] border border-[#E7E2FB] bg-[#FBFAFF] p-5 shadow-[0_24px_60px_-44px_rgba(124,92,255,0.55)]">
      <div className="text-[14px] font-bold tracking-[-0.01em] text-[#0F172A]">
        Your combined position
      </div>

      <div className="space-y-3.5">
        <div>
          <div className="text-[12px] text-[#64748B]">Net cost</div>
          <div className="mt-0.5 text-[24px] font-bold tabular-nums tracking-[-0.01em] text-[#0F172A]">
            $10,000
          </div>
        </div>
        <div>
          <div className="text-[12px] text-[#64748B]">Potential return</div>
          <div className="mt-0.5 text-[24px] font-bold tabular-nums tracking-[-0.01em] text-[#16A34A]">
            +14.2%
          </div>
        </div>
      </div>

      <div className="text-[12px] leading-[1.5] text-[#64748B]">
        Downside protected{" "}
        <span className="font-semibold text-[#0F172A]">with NO outcome</span>
      </div>

      <div className="mt-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1EEFF] px-3 py-1.5 text-[12px] font-semibold text-[#0F172A]">
          <ShieldCheck className="size-3.5" strokeWidth={2.2} />
          Balanced. Hedged. Smarter.
        </span>
      </div>
    </div>
  );
}

/* ── brand marks ─────────────────────────────────────────────────────────── */

function AppleLogo() {
  return (
    <span className="flex size-7 items-center justify-center">
      <svg viewBox="0 0 24 24" className="size-[20px]" fill="#0F172A" aria-hidden>
        <path d="M16.37 1.43c0 1.07-.4 2.09-1.1 2.85-.8.9-2.1 1.6-3.18 1.5-.13-1.04.4-2.16 1.04-2.86.73-.8 2.05-1.4 3.24-1.49ZM20.5 17.2c-.58 1.33-.86 1.92-1.6 3.1-1.04 1.64-2.5 3.68-4.32 3.7-1.6.01-2.02-1.05-4.2-1.04-2.18.01-2.64 1.06-4.25 1.04-1.8-.02-3.18-1.86-4.23-3.5C-1.06 16.6-1.35 11.1 1.12 8.16 2.26 6.79 4.05 5.93 5.73 5.93c1.7 0 2.77 1.05 4.18 1.05 1.36 0 2.19-1.05 4.16-1.05 1.5 0 3.07.81 4.2 2.21-3.69 2.02-3.09 7.29.7 8.76Z" />
      </svg>
    </span>
  );
}

function MicrosoftLogo() {
  return (
    <span className="grid size-7 grid-cols-2 gap-[2px] p-[4px]">
      <span className="rounded-[1px] bg-[#F25022]" />
      <span className="rounded-[1px] bg-[#7FBA00]" />
      <span className="rounded-[1px] bg-[#00A4EF]" />
      <span className="rounded-[1px] bg-[#FFB900]" />
    </span>
  );
}

function NvidiaLogo() {
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-[#76B900]">
      <svg viewBox="0 0 24 24" className="size-[17px]" fill="none" aria-hidden>
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
    desc: "Pick stocks, ETFs, bonds, or options from global markets.",
  },
  {
    icon: Shield,
    title: "Hedge the risk",
    desc: "Select a prediction market that offsets the event risk behind your position.",
  },
  {
    icon: Target,
    title: "One combined position",
    desc: "We calculate the hedge ratio so your view is balanced and optimized.",
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
