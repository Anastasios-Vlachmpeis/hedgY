"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WORDMARK } from "@/lib/brand";

/**
 * Floating pill nav: fixed, top-5, centered. Sits as #f5f5f5 over the hero,
 * then turns white with a soft shadow once the page scrolls.
 */
function PillNav() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed inset-x-0 top-5 z-50 flex justify-center px-4">
      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-5 py-2.5 transition-all duration-300",
          scrolled
            ? "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            : "bg-[#f5f5f5]",
        )}
      >
        <Link href="/" className="flex items-center gap-2 pr-2">
          <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#181925]">
            {WORDMARK}
          </span>
          <span className="size-2 rounded-full bg-[#9580ff]" aria-hidden />
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
        </div>

        <div className="flex items-center gap-1.5 pl-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Login</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/dashboard">Get started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-full px-3 py-1.5 text-[14px] text-[#3f3f46] transition-colors hover:bg-white/60 hover:text-[#181925]"
    >
      {children}
    </a>
  );
}

export { PillNav };
