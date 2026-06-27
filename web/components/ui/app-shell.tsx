import * as React from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";

import { WORDMARK } from "@/lib/brand";

const NAV_LINKS = [
  { href: "/dashboard", label: "Markets" },
  { href: "/dashboard", label: "Portfolio" },
] as const;

/**
 * App shell — sticky top nav on the white base, matching the landing
 * wordmark + violet dot. Denser than marketing chrome (it's an app).
 */
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-[#ececec] bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#181925]">
              {WORDMARK}
            </span>
            <span className="size-2 rounded-full bg-[#9580ff]" aria-hidden />
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }, i) => (
              <Link
                key={label}
                href={href}
                className={
                  i === 0
                    ? "rounded-full bg-[#f5f5f5] px-3.5 py-1.5 text-[14px] font-medium text-[#181925]"
                    : "rounded-full px-3.5 py-1.5 text-[14px] text-[#666666] transition-colors hover:bg-[#f5f5f5] hover:text-[#181925]"
                }
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Search"
              className="flex size-9 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-[#f5f5f5]"
            >
              <Search className="size-[18px]" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="flex size-9 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-[#f5f5f5]"
            >
              <Bell className="size-[18px]" strokeWidth={1.9} />
            </button>
            <span
              className="ml-1 flex size-8 items-center justify-center rounded-full bg-[#181925] text-[12px] font-semibold text-white"
              aria-label="Account"
            >
              MD
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-6">
        {children}
      </main>
    </div>
  );
}

export { AppShell };
