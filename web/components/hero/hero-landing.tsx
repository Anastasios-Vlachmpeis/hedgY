import Link from "next/link";
import {
  ArrowRight,
  Play,
  ChevronDown,
  TrendingUp,
  Hexagon,
  Shield,
  Target,
  Lock,
  Globe,
  Users,
  ShieldCheck,
  Landmark,
  Pill,
} from "lucide-react";

import { FlowIllustration, VersoMark } from "@/components/hero/flow-illustration";

/* ──────────────────────────────────────────────────────────────────────── */

export function HeroLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFAFC] text-[#0F172A]">
      {/* extremely subtle background radial tints */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(46% 40% at 16% 6%, rgba(94,140,255,0.08) 0%, transparent 60%)",
            "radial-gradient(46% 40% at 84% 6%, rgba(124,92,255,0.08) 0%, transparent 60%)",
          ].join(","),
        }}
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-8">
        <Nav />

        {/* hero copy */}
        <section className="flex flex-col items-center pt-6 text-center">
          <span className="rounded-full bg-[#F1EEFF] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7C5CFF]">
            All markets. One platform.
          </span>

          <h1 className="mt-7 text-[78px] font-bold leading-[0.98] tracking-[-0.03em]">
            <span className="block text-[#0F172A]">Invest in what happens.</span>
            <span className="block bg-gradient-to-r from-[#5E8CFF] via-[#7C5CFF] to-[#A678FF] bg-clip-text text-transparent">
              Hedge what matters.
            </span>
          </h1>

          <p className="mt-7 max-w-[650px] text-[20px] leading-[1.55] text-[#64748B]">
            Combine stocks, bonds, and prediction markets
            <br />
            to build smarter, hedged positions around real-world events.
          </p>

          <div className="mt-9 flex items-center gap-5">
            <button className="group inline-flex h-[52px] items-center gap-2.5 rounded-[14px] bg-[#0A0A0A] px-6 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5">
              Build your first position
              <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-0.5" />
            </button>
            <button className="group inline-flex h-[52px] items-center gap-2.5 rounded-[14px] border border-[#E2E5EE] bg-white px-6 text-[15px] font-semibold text-[#0F172A] transition-transform hover:-translate-y-0.5">
              See how it works
              <span className="flex size-6 items-center justify-center rounded-full bg-[#0F172A]">
                <Play className="size-3 fill-white text-white" />
              </span>
            </button>
          </div>
        </section>

        {/* visualization band */}
        <section className="relative mx-auto mt-[10px] h-[440px] w-full max-w-[1300px]">
          <FlowIllustration />
          <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 lg:block">
            <StocksCard />
          </div>
          <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block">
            <PredictionCard />
          </div>
        </section>

        {/* benefit strip */}
        <section className="mt-2 flex flex-wrap items-center justify-center gap-x-16 gap-y-4">
          {BENEFITS.map((b) => (
            <div key={b.label} className="flex items-center gap-2.5">
              <b.icon className="size-[18px] text-[#7C5CFF]" strokeWidth={1.8} />
              <span className="text-[15px] font-medium text-[#0F172A]">{b.label}</span>
            </div>
          ))}
        </section>

        {/* metrics card */}
        <section className="mb-20 mt-10">
          <div className="grid grid-cols-2 rounded-3xl border border-[#E8EBF2] bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.25)] md:grid-cols-4">
            {METRICS.map((m, i) => (
              <div
                key={m.label}
                className={`flex items-center gap-4 px-8 py-7 ${
                  i > 0 ? "md:border-l md:border-[#EEF1F6]" : ""
                }`}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F4F2FF]">
                  <m.icon className="size-5 text-[#7C5CFF]" strokeWidth={1.8} />
                </span>
                <div>
                  <div
                    className={
                      m.small
                        ? "text-[16px] font-semibold leading-tight tracking-[-0.01em] text-[#0F172A]"
                        : "text-[24px] font-bold leading-none tracking-[-0.02em] text-[#0F172A]"
                    }
                  >
                    {m.value}
                  </div>
                  <div className="mt-1.5 text-[13px] text-[#64748B]">{m.label}</div>
                </div>
              </div>
            ))}
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
        <VersoMark className="h-[18px] w-auto" />
        <span className="text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A]">verso</span>
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
        {["Markets", "Platform", "Pricing"].map((l) => (
          <a key={l} href="#" className="text-[15px] font-medium text-[#334155] hover:text-[#0F172A]">
            {l}
          </a>
        ))}
        <a href="#" className="flex items-center gap-1 text-[15px] font-medium text-[#334155] hover:text-[#0F172A]">
          Resources <ChevronDown className="size-4 text-[#94A3B8]" />
        </a>
      </nav>

      <div className="flex items-center gap-5">
        <Link href="/login" className="text-[15px] font-medium text-[#334155] hover:text-[#0F172A]">
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-11 items-center rounded-[12px] bg-[#0A0A0A] px-5 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5"
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
        icon={<Hexagon className="size-[18px] text-[#7C5CFF]" strokeWidth={2} />}
        iconBg="bg-[#F1EEFF]"
        title="Prediction Markets"
        titleColor="text-[#7C5CFF]"
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
      <ExploreLink color="text-[#7C5CFF]" />
    </Card>
  );
}

/* ── shared card pieces ──────────────────────────────────────────────────── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[300px] rounded-[26px] border border-[#EBEEF4] bg-white/95 p-[18px] shadow-[0_24px_60px_-34px_rgba(15,23,42,0.28)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-[3px]">
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

const BENEFITS = [
  { icon: Shield, label: "Hedge risk" },
  { icon: Target, label: "Express views" },
  { icon: TrendingUp, label: "Diversify smarter" },
  { icon: Lock, label: "Stay protected" },
];

const METRICS = [
  { icon: Globe, value: "1M+", label: "Markets traded", small: false },
  { icon: Users, value: "250K+", label: "Active traders", small: false },
  { icon: TrendingUp, value: "$2.4B+", label: "Volume (24h)", small: false },
  { icon: ShieldCheck, value: "Institutional grade", label: "Security & compliance", small: true },
];
