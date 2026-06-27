"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bell, CandlestickChart, Command, Gauge, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { GradientAvatar } from "@/components/ui/gradient-avatar";

const NAV = [
  { href: "/trade", label: "Trade", icon: CandlestickChart },
  { href: "/portfolio", label: "Portfolio", icon: Gauge },
] as const;

const TICKER = [
  { s: "FUSION·IDX", v: "1,284.6", c: 1.62 },
  { s: "BRENT", v: "$82.40", c: 0.9 },
  { s: "WTI", v: "$78.11", c: 1.2 },
  { s: "NatGas", v: "$2.84", c: -2.1 },
  { s: "Uranium", v: "$91.20", c: 3.4 },
  { s: "LMT", v: "$472.30", c: 1.2 },
  { s: "RTX", v: "$118.40", c: 0.8 },
  { s: "NVDA→$4T", v: "49%", c: 3 },
  { s: "Fed·Jul cut", v: "38%", c: 4 },
  { s: "BTC>$100k", v: "54%", c: 5 },
  { s: "ZIM", v: "$22.40", c: 3.1 },
  { s: "Recession'26", v: "29%", c: 3 },
  { s: "Carbon·EUA", v: "€68.30", c: -0.6 },
  { s: "Hormuz block", v: "17%", c: 2 },
];

function Ticker() {
  const row = (
    <div className="flex shrink-0 items-center gap-7 pr-7">
      {TICKER.map((t, i) => (
        <span key={`${t.s}-${i}`} className="flex items-center gap-2 text-[12px]">
          <span className="text-[var(--fz-text-3)]">{t.s}</span>
          <span className="fz-data font-medium text-[var(--fz-text)]">{t.v}</span>
          <span className={cn("fz-data text-[11px]", t.c >= 0 ? "text-[var(--fz-up)]" : "text-[var(--fz-down)]")}>
            {t.c >= 0 ? "▲" : "▼"}
            {Math.abs(t.c).toFixed(1)}%
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="border-b border-[var(--fz-line)] bg-[var(--fz-bg-2)]/80">
      <div className="fz-marquee-mask flex overflow-hidden">
        <div className="fz-marquee flex">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}

export function FusionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="fusion fusion-bg flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-[var(--fz-line)] bg-[var(--fz-bg)]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="relative flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--fz-violet)] to-[#d10a26] fz-glow-violet">
              <Activity className="size-4 text-[#fff]" strokeWidth={2.4} />
            </span>
            <span className="text-[17px] font-bold tracking-[-0.03em] text-white">FUSION</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-1.5 text-[14px] font-medium transition-all",
                    active
                      ? "bg-[var(--fz-surface-2)] text-white fz-ring"
                      : "text-[var(--fz-text-3)] hover:bg-[var(--fz-surface)] hover:text-white",
                  )}
                >
                  <Icon className="size-4" strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-[var(--fz-line-2)] bg-[var(--fz-surface)] px-3 py-1.5 text-[13px] text-[var(--fz-text-3)] md:flex">
              <Search className="size-4" strokeWidth={2} />
              <span>Search markets</span>
              <kbd className="ml-2 flex items-center gap-0.5 rounded border border-[var(--fz-line-2)] px-1 text-[10px] text-[var(--fz-text-4)]">
                <Command className="size-2.5" />K
              </kbd>
            </div>
            <button className="flex size-9 items-center justify-center rounded-full text-[var(--fz-text-3)] transition-colors hover:bg-[var(--fz-surface)] hover:text-white">
              <Bell className="size-[18px]" strokeWidth={2} />
            </button>
            <GradientAvatar seed="maxim.durand" size={32} className="cursor-pointer" />
          </div>
        </div>
        <Ticker />
      </header>

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
