"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, Shield, TrendingDown, ChevronRight } from "lucide-react";

/* ── At-risk stocks shown in the live feed ── */
const LIVE_RISKS = [
  {
    emoji: "🛡️",
    symbol: "LMT",
    name: "Lockheed Martin",
    risks: 3,
    event: "Republicans win 2026 midterms",
    probability: 43,
    impact: "bearish" as const,
    href: "/trade",
  },
  {
    emoji: "🍎",
    symbol: "AAPL",
    name: "Apple Inc.",
    risks: 2,
    event: "Fed rate hike in September",
    probability: 38,
    impact: "bearish" as const,
    href: "/trade",
  },
  {
    emoji: "💚",
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    risks: 4,
    event: "China chip export ban expansion",
    probability: 61,
    impact: "bearish" as const,
    href: "/trade",
  },
  {
    emoji: "🚗",
    symbol: "TSLA",
    name: "Tesla Inc.",
    risks: 2,
    event: "EV tax credit elimination",
    probability: 52,
    impact: "bearish" as const,
    href: "/trade",
  },
];

const STEPS = [
  {
    n: "01",
    icon: Shield,
    title: "Add your position",
    body: "Tell us what stocks you hold and how many shares — or connect your broker directly.",
  },
  {
    n: "02",
    icon: Zap,
    title: "We detect the risks",
    body: "Our engine scans thousands of prediction markets to find events correlated with your holdings.",
  },
  {
    n: "03",
    icon: ArrowRight,
    title: "Hedge in one click",
    body: "We calculate the optimal hedge ratio and execute the position automatically on your behalf.",
  },
];

const STATS = [
  { value: "$2.4M", label: "Total hedged" },
  { value: "847",   label: "Positions protected" },
  { value: "62%",   label: "Avg downside reduction" },
  { value: "3,200", label: "Prediction markets tracked" },
];

/* ── Nav ── */
function Nav() {
  return (
    <nav className="sticky top-0 z-20 border-b border-[#f0f0f0] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="size-[6px] rounded-full bg-[#9580ff]" />
          <span className="text-[15px] font-bold tracking-[-0.02em] text-[#0a0a0a]">
            hedgeflow
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-[13px] font-medium text-[#737373] hover:text-[#0a0a0a]">
            How it works
          </a>
          <a href="#live" className="text-[13px] font-medium text-[#737373] hover:text-[#0a0a0a]">
            Live risks
          </a>
          <Link href="/trade" className="text-[13px] font-medium text-[#737373] hover:text-[#0a0a0a]">
            Trade
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-[13px] font-medium text-[#737373] hover:text-[#0a0a0a]">
            Sign in
          </Link>
          <Link
            href="/trade"
            className="rounded-[9px] bg-[#171B3B] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  const router = useRouter();
  const [ticker, setTicker] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/trade");
  }

  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-20">
      {/* Subtle grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-[1100px] px-6 text-center">
        {/* Label */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ececec] bg-[#fafafa] px-4 py-1.5">
          <span className="size-1.5 rounded-full bg-[#16a34a] animate-pulse" />
          <span className="text-[12px] font-medium text-[#737373]">
            Live — 14 macro events threatening portfolios right now
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-[740px] text-[56px] font-black leading-[1.05] tracking-[-0.03em] text-[#0a0a0a]">
          Hedge your stocks with{" "}
          <span className="relative">
            <span className="relative z-10">prediction markets.</span>
            <span
              className="absolute bottom-1 left-0 right-0 -z-0 h-4 rounded-sm opacity-20"
              style={{ background: "linear-gradient(90deg,#9580ff,#6366f1)" }}
            />
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-[520px] text-[18px] leading-relaxed text-[#737373]">
          We detect which macro events threaten your portfolio and place the
          perfect hedge — automatically, in one click.
        </p>

        {/* Input CTA */}
        <form onSubmit={handleSubmit} className="mt-10 flex items-center justify-center gap-3">
          <div className="relative w-[300px]">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter a ticker — e.g. LMT"
              className="h-12 w-full rounded-[12px] border border-[#d4d4d4] bg-white pl-4 pr-4 text-[14px] text-[#0a0a0a] placeholder:text-[#a3a3a3] outline-none shadow-sm focus:border-[#171B3B]"
            />
          </div>
          <button
            type="submit"
            className="flex h-12 items-center gap-2 rounded-[12px] bg-[#171B3B] px-6 text-[14px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Get hedge recommendations
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </button>
        </form>

        <p className="mt-4 text-[12px] text-[#a3a3a3]">
          No account needed · Try with LMT, AAPL, or NVDA
        </p>
      </div>
    </section>
  );
}

/* ── Live risk feed ── */
function LiveRisks() {
  return (
    <section id="live" className="bg-[#fafafa] py-20">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#ef4444]">
            Live
          </span>
        </div>
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="text-[32px] font-black tracking-[-0.02em] text-[#0a0a0a]">
            Stocks at risk — right now
          </h2>
          <p className="max-w-[380px] text-[14px] text-[#737373]">
            These positions are exposed to upcoming macro events. Each can be hedged in one click.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {LIVE_RISKS.map((r, i) => (
            <div
              key={r.symbol}
              className="group flex items-center gap-5 rounded-[16px] border border-[#ececec] bg-white px-6 py-5 transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            >
              {/* Rank */}
              <span className="w-5 shrink-0 text-[12px] font-semibold text-[#d4d4d4]">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Stock */}
              <div className="flex w-[160px] shrink-0 items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#f5f5f5] text-[20px] leading-none">
                  {r.emoji}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#0a0a0a]">{r.symbol}</p>
                  <p className="text-[11px] text-[#a3a3a3]">{r.name}</p>
                </div>
              </div>

              {/* Risk count */}
              <div className="flex w-[120px] shrink-0 items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-semibold text-[#ea580c]">
                  <Shield className="size-2.5" strokeWidth={2.5} />
                  {r.risks} risks
                </span>
              </div>

              {/* Event */}
              <div className="flex flex-1 items-center gap-3 min-w-0">
                <TrendingDown className="size-4 shrink-0 text-[#dc2626]" strokeWidth={2} />
                <p className="truncate text-[13px] font-medium text-[#0a0a0a]">{r.event}</p>
              </div>

              {/* Probability */}
              <div className="flex w-[80px] shrink-0 flex-col items-end">
                <span className="text-[18px] font-black tabular-nums text-[#dc2626]">
                  {r.probability}%
                </span>
                <span className="text-[10px] text-[#a3a3a3]">probability</span>
              </div>

              {/* CTA */}
              <Link
                href={r.href}
                className="ml-2 flex shrink-0 items-center gap-1.5 rounded-[10px] bg-[#171B3B] px-4 py-2 text-[12px] font-bold text-white opacity-0 transition-all group-hover:opacity-100"
              >
                <Zap className="size-3" strokeWidth={2.5} />
                Hedge now
              </Link>
              <Link
                href={r.href}
                className="ml-2 flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#737373] transition-colors group-hover:hidden hover:text-[#0a0a0a]"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ── */
function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9580ff]">
            How it works
          </p>
          <h2 className="text-[36px] font-black tracking-[-0.02em] text-[#0a0a0a]">
            From exposure to protection in seconds
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              {/* Connector line */}
              <div className="absolute right-0 top-6 hidden h-px w-8 -translate-y-1/2 bg-[#ececec] lg:block" />
              <p className="mb-5 text-[13px] font-bold text-[#d4d4d4]">{s.n}</p>
              <div className="mb-4 flex size-11 items-center justify-center rounded-[12px] border border-[#ececec] bg-[#fafafa]">
                <s.icon className="size-5 text-[#0a0a0a]" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 text-[17px] font-bold text-[#0a0a0a]">{s.title}</h3>
              <p className="text-[14px] leading-relaxed text-[#737373]">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Product showcase ── */
function Showcase() {
  return (
    <section className="bg-[#fafafa] py-24">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9580ff]">
            The product
          </p>
          <h2 className="text-[36px] font-black tracking-[-0.02em] text-[#0a0a0a]">
            See exactly what happens when you hedge
          </h2>
          <p className="mt-3 text-[15px] text-[#737373]">
            Real numbers, real outcomes — before you commit a single dollar.
          </p>
        </div>

        {/* Mock product UI */}
        <div className="overflow-hidden rounded-[20px] border border-[#e0e0e0] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-[#f0f0f0] bg-[#fafafa] px-4 py-3">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <div className="ml-4 flex-1 rounded-md bg-[#eeeeee] px-3 py-1 text-center text-[11px] text-[#a3a3a3]">
              hedgeflow.io/trade
            </div>
          </div>

          {/* Simulated product */}
          <div className="grid grid-cols-2 gap-0 divide-x divide-[#f5f5f5] p-6">
            {/* Left: hedge recommendation */}
            <div className="pr-6">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">
                Recommended hedge · LMT
              </p>
              <div className="mt-4 flex items-center gap-5">
                <div>
                  <p className="text-[56px] font-black leading-none tabular-nums tracking-tighter text-[#0a0a0a]">
                    0.58
                  </p>
                  <p className="mt-1 text-[11px] text-[#a3a3a3]">Hedge ratio</p>
                </div>
                <div className="flex-1 border-l border-[#f5f5f5] pl-5">
                  <p className="text-[10px] text-[#a3a3a3]">Protected if:</p>
                  <p className="mt-1 text-[13px] font-bold leading-snug text-[#0a0a0a]">
                    Republicans win midterms (NO)
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#d97706]">
                    43% probability
                  </span>
                </div>
              </div>
              <div className="mt-5 rounded-[12px] bg-[#171B3B] py-3 text-center text-[14px] font-bold text-white">
                ⚡ Apply hedge — 1 click
              </div>
            </div>

            {/* Right: projected outcomes */}
            <div className="pl-6">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">
                Projected outcomes
              </p>
              <div className="flex flex-col gap-3">
                <div className="rounded-[12px] bg-[#f0fdf4] p-4">
                  <p className="text-[10px] font-medium text-[#15803d]">If Republicans win · hedge pays out</p>
                  <p className="mt-1.5 text-[28px] font-black tabular-nums leading-none text-[#15803d]">
                    +$4,320
                  </p>
                  <p className="mt-0.5 text-[12px] font-semibold text-[#16a34a]">+8.5% total return</p>
                </div>
                <div className="rounded-[12px] bg-[#fff1f2] p-4">
                  <p className="text-[10px] font-medium text-[#b91c1c]">If event doesn&apos;t happen</p>
                  <p className="mt-1.5 text-[28px] font-black tabular-nums leading-none text-[#dc2626]">
                    -$1,230
                  </p>
                  <p className="mt-0.5 text-[12px] font-semibold text-[#ef4444]">
                    -2.4% &nbsp;
                    <span className="font-normal text-[#a3a3a3] line-through">vs -17.1% unhedged</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/trade"
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#171B3B] px-8 py-3.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Try it with your portfolio
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Stats bar ── */
function Stats() {
  return (
    <section className="border-y border-[#ececec] bg-white py-16">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="grid grid-cols-4 divide-x divide-[#ececec]">
          {STATS.map((s) => (
            <div key={s.label} className="px-10 text-center first:pl-0 last:pr-0">
              <p className="text-[40px] font-black tabular-nums tracking-[-0.03em] text-[#0a0a0a]">
                {s.value}
              </p>
              <p className="mt-1 text-[13px] text-[#737373]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ── */
function FinalCta() {
  return (
    <section className="bg-[#171B3B] py-24">
      <div className="mx-auto max-w-[1100px] px-6 text-center">
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9580ff]">
          Start today
        </p>
        <h2 className="mx-auto max-w-[520px] text-[40px] font-black leading-[1.1] tracking-[-0.02em] text-white">
          Your portfolio deserves protection.
        </h2>
        <p className="mt-4 text-[16px] text-[rgba(255,255,255,0.55)]">
          Most investors lose 15–40% when macro events hit.
          <br />
          Yours don&apos;t have to.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/trade"
            className="flex items-center gap-2 rounded-[12px] bg-white px-8 py-3.5 text-[14px] font-bold text-[#171B3B] transition-opacity hover:opacity-90"
          >
            Hedge your first position
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.15)] px-8 py-3.5 text-[14px] font-semibold text-white transition-colors hover:border-[rgba(255,255,255,0.3)]"
          >
            View dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="border-t border-[#f0f0f0] bg-white py-8">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6">
        <div className="flex items-center gap-1.5">
          <span className="size-[5px] rounded-full bg-[#9580ff]" />
          <span className="text-[13px] font-bold text-[#0a0a0a]">hedgeflow</span>
        </div>
        <p className="text-[12px] text-[#a3a3a3]">
          Built at Paris Hackathon 2026
        </p>
        <div className="flex items-center gap-5">
          <Link href="/trade" className="text-[12px] text-[#737373] hover:text-[#0a0a0a]">Trade</Link>
          <Link href="/dashboard" className="text-[12px] text-[#737373] hover:text-[#0a0a0a]">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ── */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <LiveRisks />
      <HowItWorks />
      <Showcase />
      <Stats />
      <FinalCta />
      <Footer />
    </div>
  );
}
