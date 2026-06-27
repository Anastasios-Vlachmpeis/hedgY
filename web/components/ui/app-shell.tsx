"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { WORDMARK } from "@/lib/brand";
import { GradientAvatar } from "@/components/ui/gradient-avatar";

const NAV_LINKS = [
  { href: "/trade",     label: "Trade" },
  { href: "/dashboard", label: "Portfolio" },
  { href: "/structure", label: "Structure" },
] as const;

function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  return (
    <div className={cn("flex min-h-full flex-col bg-[#fafafa]", className)}>
      {/* Flat sticky nav */}
      <header className="sticky top-0 z-40 border-b border-[#ececec] bg-[#fafafa]">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-6 px-10">
          {/* Logo */}
          <Link href="/trade" className="flex shrink-0 items-center gap-2">
            <span className="size-[7px] rounded-full bg-[#9580ff]" aria-hidden />
            {WORDMARK && (
              <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#111111]">
                {WORDMARK}
              </span>
            )}
          </Link>

          {/* Nav */}
          <nav className="flex items-center">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "relative flex h-14 items-center px-4 text-[13px] font-medium transition-colors duration-[180ms] ease-out",
                    active
                      ? "text-[#111111]"
                      : "text-[#6B7280] hover:text-[#111111]",
                  )}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-[#111111]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              className="flex size-8 items-center justify-center rounded-[8px] text-[#9ca3af] transition-colors duration-[180ms] hover:bg-[#f0f0f0] hover:text-[#111111]"
            >
              <Search className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="flex size-8 items-center justify-center rounded-[8px] text-[#9ca3af] transition-colors duration-[180ms] hover:bg-[#f0f0f0] hover:text-[#111111]"
            >
              <Bell className="size-4" strokeWidth={1.75} />
            </button>
            <div className="ml-2">
              <GradientAvatar seed="maxim.durand" size={28} className="cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-10 py-8">
        {children}
      </main>
    </div>
  );
}

export { AppShell };
