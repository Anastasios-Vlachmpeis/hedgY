import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Atom,
  Bolt,
  Boxes,
  Gauge,
  Globe2,
  Layers,
  Radio,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Sparkline } from "@/components/fusion/charts";

export default function Landing() {
  return (
    <div className="fusion fusion-bg min-h-screen">
      <LandingNav />
      <Hero />
      <StatBand />
      <Pillars />
      <FeatureGrid />
      <ShowcaseBand />
      <CtaBand />
      <Footer />
    </div>
  );
}

function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--fz-line)] bg-[var(--fz-bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--fz-violet)] to-[#6f5bff] fz-glow-violet">
            <Activity className="size-4 text-[#fff]" strokeWidth={2.4} />
          </span>
          <span className="text-[18px] font-bold tracking-[-0.03em] text-white">FUSION</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/trade" className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-[var(--fz-text-2)] transition-colors hover:text-white sm:block">
            Trade
          </Link>
          <Link href="/portfolio" className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-[var(--fz-text-2)] transition-colors hover:text-white sm:block">
            Portfolio
          </Link>
          <Link href="/trade" className="fz-btn fz-btn-primary px-5 py-2 text-[14px]">
            Launch app <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pt-20 pb-16 sm:pt-28">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="fz-rise">
          <span className="fz-chip mb-6"><Sparkles className="size-3" /> The fusion exchange</span>
          <h1 className="text-[44px] font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-[60px]">
            Trade the world&apos;s markets —<br />
            <span className="fz-gradient-text">and its outcomes.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[18px] leading-relaxed text-[var(--fz-text-2)]">
            Fuse equities, energy futures and prediction markets into a single
            instrument. Express a real-world thesis, hedge the event that breaks
            it, and route it across every venue — in one ticket.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/trade" className="fz-btn fz-btn-primary h-12 px-6 text-[15px]">
              Start trading <ArrowRight className="size-4" />
            </Link>
            <Link href="/portfolio" className="fz-btn fz-btn-ghost h-12 px-6 text-[15px]">
              View portfolio
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-[13px] text-[var(--fz-text-3)]">
            <span className="flex items-center gap-2"><span className="fz-live" /> 312 markets live</span>
            <span className="flex items-center gap-2"><Shield className="size-4" /> Suggestion-only · non-custodial</span>
          </div>
        </div>

        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="fz-rise relative" style={{ animationDelay: "120ms" }}>
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[var(--fz-violet)]/20 blur-3xl" />
      <div className="fz-glass overflow-hidden p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--fz-surface)] fz-ring">
              <Atom className="size-5 text-[var(--fz-violet-2)]" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-white">Long Defense · Hedge Midterms</p>
              <p className="text-[12px] text-[var(--fz-text-3)]">Fusion contract · LMT · RTX · NOC</p>
            </div>
          </div>
          <span className="fz-chip"><span className="fz-live" /> Live</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--fz-line)] bg-[var(--fz-inset)] p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--fz-violet-2)]"><TrendingUp className="size-3.5" /> Long leg</p>
            <p className="mt-2 text-[14px] font-semibold text-white">$5,000 equities</p>
            <div className="mt-1.5"><Sparkline data={[465, 466, 464, 470, 469, 472, 471, 474]} up width={150} height={26} /></div>
          </div>
          <div className="rounded-xl border border-[var(--fz-line)] bg-[var(--fz-inset)] p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--fz-cyan)]"><Shield className="size-3.5" /> Hedge leg</p>
            <p className="mt-2 text-[14px] font-semibold text-white">NO · 57¢</p>
            <div className="mt-1.5"><Sparkline data={[60, 59, 58, 57, 58, 56, 57, 57]} up={false} width={150} height={26} /></div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--fz-line)] bg-gradient-to-r from-[var(--fz-violet)]/12 to-transparent p-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[var(--fz-text-4)]">Net position</p>
            <p className="fz-data text-[22px] font-bold text-white">+$840 <span className="text-[14px] font-medium text-[var(--fz-up)]">+8.4%</span></p>
          </div>
          <button className="fz-btn fz-btn-primary px-5 py-2.5 text-[14px]">Execute <Zap className="size-4" /></button>
        </div>
      </div>
    </div>
  );
}

function StatBand() {
  const stats = [
    { v: "$184M", l: "24h fused volume" },
    { v: "4", l: "venues unified" },
    { v: "312", l: "live markets" },
    { v: "1-ticket", l: "to hedge any thesis" },
  ];
  return (
    <section className="border-y border-[var(--fz-line)] bg-[var(--fz-bg-2)]/50 py-8">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-6 px-5 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <p className="fz-data text-[30px] font-bold text-white">{s.v}</p>
            <p className="mt-1 text-[13px] text-[var(--fz-text-3)]">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pillars() {
  const pillars = [
    { icon: Layers, title: "Equities & Bonds", desc: "Build the conviction leg from any liquid name or basket, routed via Alpaca and IBKR.", color: "var(--fz-violet-2)" },
    { icon: Bolt, title: "Energy & Commodities", desc: "Trade the transition — crude, gas, uranium, carbon and power, all in one book.", color: "var(--fz-amber)" },
    { icon: Radio, title: "Prediction Markets", desc: "Hedge the exact event that breaks your thesis at the best price across Kalshi & Polymarket.", color: "var(--fz-cyan)" },
  ];
  return (
    <section className="px-5 py-20">
      <div className="mx-auto w-full max-w-[1200px]">
        <SectionHead eyebrow="One book" title="Three worlds, fused into one position" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="fz-glass fz-glass-hover p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--fz-surface)] fz-ring" style={{ color: p.color }}>
                <p.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-[18px] font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--fz-text-2)]">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    { icon: Atom, title: "Combined instruments", desc: "Pair a long leg with a prediction hedge. Drag the hedge ratio and watch the payoff reshape live." },
    { icon: Gauge, title: "Mission-control risk", desc: "Net beta, event VaR, hedge coverage and energy exposure — telemetry across every venue." },
    { icon: Globe2, title: "Cross-venue best price", desc: "We cluster duplicate questions and route each side to the cheapest venue automatically." },
    { icon: Sparkles, title: "Macro signal feed", desc: "The events that move your book, ranked by probability shift and portfolio impact." },
    { icon: Shield, title: "Hedged by design", desc: "Every thesis ships with the offset baked in. Cushion the downside before you click buy." },
    { icon: Boxes, title: "One ticket, every leg", desc: "Equity, energy and event legs route together. No tab-juggling across four apps." },
  ];
  return (
    <section className="px-5 py-20">
      <div className="mx-auto w-full max-w-[1200px]">
        <SectionHead eyebrow="Built for the future" title="A trading desk that thinks in theses, not tickers" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="fz-card fz-glass-hover p-5">
              <f.icon className="size-5 text-[var(--fz-violet-2)]" />
              <h3 className="mt-3 text-[16px] font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--fz-text-3)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseBand() {
  const steps = [
    { n: "01", t: "Pick a thesis", d: "Long defense, short the transition, fade a recession — start from a worldview." },
    { n: "02", t: "Fuse the hedge", d: "We surface the prediction market that offsets it and the best cross-venue price." },
    { n: "03", t: "Route in one ticket", d: "Both legs execute together. Track the combined P&L from mission control." },
  ];
  return (
    <section className="border-y border-[var(--fz-line)] bg-[var(--fz-bg-2)]/40 px-5 py-20">
      <div className="mx-auto w-full max-w-[1200px]">
        <SectionHead eyebrow="How it works" title="From conviction to hedged position in three moves" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="fz-glass relative overflow-hidden p-6">
              <span className="fz-data absolute right-4 top-2 text-[56px] font-bold text-white/5">{s.n}</span>
              <h3 className="text-[18px] font-semibold text-white">{s.t}</h3>
              <p className="mt-2 max-w-[240px] text-[14px] leading-relaxed text-[var(--fz-text-2)]">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="px-5 py-24">
      <div className="mx-auto w-full max-w-[900px]">
        <div className="fz-glass relative overflow-hidden p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute -inset-20 -z-10 bg-[radial-gradient(circle_at_center,rgba(149,128,255,0.25),transparent_60%)]" />
          <h2 className="text-[34px] font-bold leading-tight tracking-[-0.03em] text-white sm:text-[44px]">
            Start trading the <span className="fz-gradient-text">future</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-[var(--fz-text-2)]">
            Every instrument. Every outcome. One position. Join the fusion exchange.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/trade" className="fz-btn fz-btn-primary h-12 px-7 text-[15px]">
              Launch the app <ArrowRight className="size-4" />
            </Link>
            <Link href="/portfolio" className="fz-btn fz-btn-ghost h-12 px-7 text-[15px]">
              See mission control
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <span className="fz-chip mb-4">{eyebrow}</span>
      <h2 className="text-[30px] font-bold leading-tight tracking-[-0.03em] text-white sm:text-[38px]">{title}</h2>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--fz-line)] px-5 py-10">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--fz-violet)] to-[#6f5bff]">
            <Activity className="size-3.5 text-[#fff]" strokeWidth={2.4} />
          </span>
          <span className="text-[15px] font-bold tracking-[-0.03em] text-white">FUSION</span>
        </div>
        <p className="text-[12px] text-[var(--fz-text-4)]">
          Suggestion-only demo. No trades executed, no custody, no settlement — by design.
        </p>
      </div>
    </footer>
  );
}
