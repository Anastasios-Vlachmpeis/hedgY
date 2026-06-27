"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Bookmark, TrendingUp, Briefcase,
  List, History, BarChart2, Calendar,
  Filter, PieChart, Settings, CreditCard,
  Search, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientAvatar } from "@/components/ui/gradient-avatar";

const NAV = [
  {
    section: "OVERVIEW",
    items: [
      { href: "/trade", label: "Home",       icon: Home      },
      { href: "/trade", label: "Watchlist",  icon: Bookmark  },
    ],
  },
  {
    section: "TRADE",
    items: [
      { href: "/trade",      label: "Build position", icon: TrendingUp },
      { href: "/trade",      label: "Positions",      icon: Briefcase  },
      { href: "/trade",      label: "Orders",         icon: List       },
      { href: "/trade",      label: "History",        icon: History    },
    ],
  },
  {
    section: "ANALYZE",
    items: [
      { href: "/trade", label: "Markets",   icon: BarChart2 },
      { href: "/trade", label: "Events",    icon: Calendar  },
      { href: "/trade", label: "Screeners", icon: Filter    },
    ],
  },
  {
    section: "ACCOUNT",
    items: [
      { href: "/dashboard", label: "Portfolio", icon: PieChart  },
      { href: "/trade",     label: "Settings",  icon: Settings  },
      { href: "/trade",     label: "Billing",   icon: CreditCard},
    ],
  },
];

export function TradeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* ── Sidebar ── */}
      <aside className="flex w-[196px] shrink-0 flex-col border-r border-[#f0f0f0] bg-white">
        {/* Logo */}
        <div className="flex h-[52px] shrink-0 items-center border-b border-[#f0f0f0] px-4">
          <Link href="/trade" className="flex items-center gap-1.5">
            <span className="size-[6px] rounded-full bg-[#9580ff]" />
            <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
              hedgeflow
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-[#a3a3a3]">
                {section}
              </p>
              {items.map(({ href, label, icon: Icon }) => {
                const active =
                  (pathname === "/trade" && label === "Build position") ||
                  (pathname === href && label !== "Build position" && href !== "/trade");
                return (
                  <Link
                    key={label}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-[7px] px-2 py-[5px] text-[12.5px] font-medium transition-colors duration-[150ms]",
                      active
                        ? "bg-[#f4f4f5] text-[#0a0a0a]"
                        : "text-[#737373] hover:bg-[#f9f9f9] hover:text-[#404040]",
                    )}
                  >
                    <Icon className="size-[13px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main area ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex h-[52px] shrink-0 items-center gap-4 border-b border-[#f0f0f0] bg-white px-6">
          <div className="relative w-[300px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-[13px] -translate-y-1/2 text-[#a3a3a3]"
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Search stocks, ETFs, events..."
              className="h-8 w-full rounded-[8px] border border-[#ececec] bg-[#fafafa] pl-8 pr-10 text-[12px] text-[#0a0a0a] placeholder:text-[#a3a3a3] outline-none focus:border-[#d4d4d4]"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#a3a3a3]">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#a3a3a3]">Portfolio</span>
              <span className="text-[13px] font-semibold text-[#0a0a0a]">$128,430.00</span>
              <span className="text-[10px] text-[#a3a3a3]">▾</span>
            </div>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-[7px] text-[#a3a3a3] transition-colors hover:bg-[#f5f5f5] hover:text-[#0a0a0a]"
            >
              <Bell className="size-[14px]" strokeWidth={1.75} />
            </button>
            <GradientAvatar seed="maxim.durand" size={26} className="cursor-pointer" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#fafafa]">
          {children}
        </main>
      </div>
    </div>
  );
}
