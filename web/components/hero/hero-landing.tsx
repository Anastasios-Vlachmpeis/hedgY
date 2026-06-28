import Link from "next/link";
import {
  ArrowRight,
  Play,
  TrendingUp,
  Hexagon,
  Landmark,
  Pill,
} from "lucide-react";

import { FlowIllustration } from "@/components/hero/flow-illustration";

/* ──────────────────────────────────────────────────────────────────────── */

const GROTESQUE = "'Inter','Helvetica Neue','Helvetica',Arial,system-ui,sans-serif";

export function HeroLanding() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-white text-[#0A0A0A]"
      style={{ fontFamily: GROTESQUE }}
    >
      <div className="relative mx-auto w-full max-w-[1440px] px-8">
        <Nav />

        {/* hero copy — left headline, right paragraph + CTAs */}
        <section className="grid grid-cols-1 gap-y-10 pt-10 lg:grid-cols-12 lg:items-stretch lg:gap-x-12 lg:pt-16">
          <h1 className="lg:col-span-7 text-[clamp(32px,4.4vw,56px)] font-semibold leading-[1.02] tracking-[-0.035em] text-[#0A0A0A]">
            <span className="block">Invest in what</span>
            <span className="block">happens.</span>
            <span className="block">Hedge what really</span>
            <span className="block">matters.</span>
          </h1>

          <div className="flex flex-col items-start gap-7 lg:col-span-5 lg:h-full lg:justify-between lg:pb-1">
            <p className="max-w-[460px] text-[18px] leading-[1.55] text-[#52525B]">
              Combine stocks, bonds, and prediction markets to build smarter,
              hedged positions around real-world events.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#how-it-works"
                className="group inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[12px] border border-[#0A0A0A] bg-white px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A] transition-colors hover:bg-[#0A0A0A] hover:text-white"
              >
                See how it works
                <span className="flex size-5 items-center justify-center rounded-full border border-current">
                  <Play className="size-2.5 fill-current" />
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* visualization band */}
        <section className="relative mx-auto mt-10 h-[440px] w-full max-w-[1300px]">
          {/* colorful full-bleed ambient gradient (brand scheme) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 opacity-60"
            style={{
              background:
                "linear-gradient(180deg, #9FD6F1 0%, #AEC5EC 22%, #C9B0E4 42%, #E3A6CE 60%, #F5A0B0 78%, #F9AE63 100%)",
              WebkitMaskImage:
                "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
              maskImage:
                "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
            }}
          />
          <FlowIllustration />
          <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 lg:block">
            <StocksCard />
          </div>
          <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block">
            <PredictionCard />
          </div>
        </section>

        {/* markets marquee — every market we connect, scrolling left → right */}
        <section className="mb-20 mt-2">
          <div className="marquee-mask overflow-hidden">
            <div className="animate-marquee-rev flex w-max items-center gap-12 whitespace-nowrap">
              {[...MARKETS, ...MARKETS].map((m, i) => (
                <span
                  key={`${m}-${i}`}
                  className="flex items-center gap-12 text-[18px] font-semibold tracking-[-0.01em] text-[#0A0A0A]"
                >
                  {m}
                  <span aria-hidden className="size-1 rounded-full bg-[#0A0A0A]/30" />
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── nav ─────────────────────────────────────────────────────────────────── */

function Nav() {
  return (
    <header className="relative flex h-[88px] items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="text-[22px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">hedgY</span>
      </Link>

      <div className="flex items-center gap-5">
        <Link
          href="/dashboard"
          className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#52525B] transition-colors hover:text-[#0A0A0A]"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-11 items-center rounded-[12px] bg-[#0A0A0A] px-5 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-transform hover:-translate-y-0.5"
        >
          Get started
        </Link>
      </div>
    </header>
  );
}

/* ── left card: stocks ───────────────────────────────────────────────────── */

const STOCKS = [
  { sym: "AAPL", name: "Apple Inc.", price: "$195.42", chg: "+1.24%", logo: AppleLogo },
  { sym: "NVDA", name: "NVIDIA Corp.", price: "$128.71", chg: "+2.31%", logo: NvidiaLogo },
  { sym: "MSFT", name: "Microsoft Corp.", price: "$415.73", chg: "+0.72%", logo: MicrosoftLogo },
];

function StocksCard() {
  return (
    <Card>
      <CardHeader
        icon={<TrendingUp className="size-[18px] text-[#5E8CFF]" strokeWidth={2} />}
        iconBg="bg-[#EAF0FF]"
        title="Stocks & ETFs"
        titleColor="text-[#5E8CFF]"
        subtitle="Own the market."
      />
      <div className="mt-3 flex flex-col">
        {STOCKS.map((s, i) => (
          <div
            key={s.sym}
            className={`flex items-center justify-between py-2.5 ${i > 0 ? "border-t border-[#F1F4F9]" : ""}`}
          >
            <div className="flex items-center gap-3">
              <s.logo />
              <div className="leading-tight">
                <div className="text-[14px] font-semibold text-[#0F172A]">{s.sym}</div>
                <div className="text-[12px] text-[#94A3B8]">{s.name}</div>
              </div>
            </div>
            <div className="text-right leading-tight">
              <div className="text-[14px] font-semibold text-[#0F172A]">{s.price}</div>
              <div className="text-[12px] font-medium text-[#16A34A]">{s.chg}</div>
            </div>
          </div>
        ))}
      </div>
      <ExploreLink color="text-[#5E8CFF]" />
    </Card>
  );
}

/* ── right card: prediction markets ──────────────────────────────────────── */

const PREDICTIONS = [
  { q: "Fed rate cut in July?", pct: "62%", provider: "Kalshi", implied: "implied NO", icon: Landmark, grad: "from-[#94A3B8] to-[#475569]" },
  { q: "Trump wins re-election?", pct: "43%", provider: "Polymarket", implied: "implied YES", icon: Landmark, grad: "from-[#7C5CFF] to-[#5E8CFF]" },
  { q: "FDA approves Drug X?", pct: "28%", provider: "Kalshi", implied: "implied NO", icon: Pill, grad: "from-[#5E8CFF] to-[#22D3EE]" },
];

function PredictionCard() {
  return (
    <Card>
      <CardHeader
        icon={<Hexagon className="size-[18px] text-[#0A0A0A]" strokeWidth={2} />}
        iconBg="bg-[#F1EEFF]"
        title="Prediction Markets"
        titleColor="text-[#0A0A0A]"
        subtitle="Trade the outcome."
      />
      <div className="mt-3 flex flex-col">
        {PREDICTIONS.map((p, i) => (
          <div key={p.q} className={`flex gap-2.5 py-2.5 ${i > 0 ? "border-t border-[#F1F4F9]" : ""}`}>
            <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${p.grad}`}>
              <p.icon className="size-[16px] text-white" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13.5px] font-semibold text-[#0F172A]">{p.q}</span>
                <span className="whitespace-nowrap text-[11px] text-[#94A3B8]">{p.implied}</span>
              </div>
              <div className="mt-0.5 text-[20px] font-bold leading-none text-[#0F172A]">{p.pct}</div>
              <div className="mt-1 text-[12px] text-[#64748B]">{p.provider}</div>
            </div>
          </div>
        ))}
      </div>
      <ExploreLink color="text-[#0A0A0A]" />
    </Card>
  );
}

/* ── shared card pieces ──────────────────────────────────────────────────── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[300px] rounded-[26px] border border-white/60 bg-white/55 p-[18px] shadow-[0_24px_60px_-30px_rgba(15,23,42,0.3),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl backdrop-saturate-150 transition-transform duration-300 hover:-translate-y-[3px]">
      {children}
    </div>
  );
}

function CardHeader({
  icon,
  iconBg,
  title,
  titleColor,
  subtitle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  titleColor: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex size-9 items-center justify-center rounded-xl ${iconBg}`}>{icon}</span>
      <div className="leading-tight">
        <div className={`text-[15px] font-semibold ${titleColor}`}>{title}</div>
        <div className="text-[12px] text-[#64748B]">{subtitle}</div>
      </div>
    </div>
  );
}

function ExploreLink({ color }: { color: string }) {
  return (
    <a href="#" className={`group mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold ${color}`}>
      <span className="group-hover:underline">Explore markets</span>
      <ArrowRight className="size-[15px] transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

/* ── brand + data ────────────────────────────────────────────────────────── */

function AppleLogo() {
  return (
    <span className="flex size-7 items-center justify-center">
      <svg viewBox="0 0 24 24" className="size-[22px]" fill="#0F172A" aria-hidden>
        <path d="M16.37 1.43c0 1.07-.4 2.09-1.1 2.85-.8.9-2.1 1.6-3.18 1.5-.13-1.04.4-2.16 1.04-2.86.73-.8 2.05-1.4 3.24-1.49ZM20.5 17.2c-.58 1.33-.86 1.92-1.6 3.1-1.04 1.64-2.5 3.68-4.32 3.7-1.6.01-2.02-1.05-4.2-1.04-2.18.01-2.64 1.06-4.25 1.04-1.8-.02-3.18-1.86-4.23-3.5C-1.06 16.6-1.35 11.1 1.12 8.16 2.26 6.79 4.05 5.93 5.73 5.93c1.7 0 2.77 1.05 4.18 1.05 1.36 0 2.19-1.05 4.16-1.05 1.5 0 3.07.81 4.2 2.21-3.69 2.02-3.09 7.29.7 8.76Z" />
      </svg>
    </span>
  );
}

function NvidiaLogo() {
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-[#76B900]">
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
        <path
          d="M8 9c2.2-2.4 6-2.4 8.2 0 -2.2 2.4-6 2.4-8.2 0Z"
          fill="#fff"
        />
        <circle cx="12" cy="9" r="1.5" fill="#76B900" />
        <path d="M6 14c3 2.4 9 2.4 12 0" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function MicrosoftLogo() {
  return (
    <span className="grid size-7 grid-cols-2 gap-[2px] p-[3px]">
      <span className="rounded-[1px] bg-[#F25022]" />
      <span className="rounded-[1px] bg-[#7FBA00]" />
      <span className="rounded-[1px] bg-[#00A4EF]" />
      <span className="rounded-[1px] bg-[#FFB900]" />
    </span>
  );
}

const MARKETS = [
  "Kalshi",
  "Polymarket",
  "NYSE",
  "Nasdaq",
  "Alpaca",
  "Interactive Brokers",
  "CME Group",
  "Cboe",
];
