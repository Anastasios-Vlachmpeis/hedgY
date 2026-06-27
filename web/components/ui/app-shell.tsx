"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { WORDMARK } from "@/lib/brand";
import { GradientAvatar } from "@/components/ui/gradient-avatar";

const NAV_LINKS = [
  { href: "/trade", label: "Trade" },
  { href: "/dashboard", label: "Portfolio" },
  { href: "/structure", label: "Structure" },
] as const;

/**
 * App shell — sticky top nav on the white base, matching the landing
 * wordmark + violet dot. Denser than marketing chrome (it's an app).
 */
function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  return (
    <div className={cn("flex min-h-full flex-col bg-white", className)}>
      <div className="sticky top-0 z-40 flex justify-center px-4 pt-3">
        <header className="flex w-full max-w-[860px] items-center gap-4 rounded-2xl bg-white/80 px-4 py-2.5 shadow-[0_2px_16px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <Link href="/markets" className="flex items-center gap-2 shrink-0">
            {WORDMARK && (
              <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#181925]">
                {WORDMARK}
              </span>
            )}
            <span className="size-2 rounded-full bg-[#9580ff]" aria-hidden />
          </Link>

          <nav className="flex flex-1 items-center justify-center gap-1">
            {NAV_LINKS.map(({ href, label }, i) => {
              const active =
                i === NAV_LINKS.findIndex((l) => l.href === pathname);
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[14px] font-medium transition-colors",
                    active
                      ? "bg-[#C5D3E6] text-[#181925]"
                      : "text-[#666666] hover:bg-[#C5D3E6]/60 hover:text-[#181925]",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              className="flex size-8 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-[#C5D3E6]/60"
            >
              <Search className="size-[17px]" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="flex size-8 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-[#C5D3E6]/60"
            >
              <Bell className="size-[17px]" strokeWidth={1.9} />
            </button>
            <GradientAvatar seed="maxim.durand" size={30} className="ml-1 cursor-pointer" />
          </div>
        </header>
      </div>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-6">
        {children}
      </main>
    </div>
  );
}

export { AppShell };
