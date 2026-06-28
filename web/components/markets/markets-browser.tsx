"use client";

import * as React from "react";
import { Search, Radio, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MarketEvent } from "@/lib/mockData";
import { MarketCard } from "@/components/markets/market-card";

const ALL = "__all__";

interface Facet {
  id: string;
  label: string;
  count: number;
}

/**
 * The markets grid plus its command bar. Category facets are derived from the
 * events actually on screen, so every pill maps to real cards. Search, category
 * and a live-only toggle filter client-side over the same data — no refetch.
 */
function MarketsBrowser({ events }: { events: MarketEvent[] }) {
  const [query, setQuery] = React.useState("");
  const [cat, setCat] = React.useState<string>(ALL);
  const [liveOnly, setLiveOnly] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName ?? "";
      if (e.key === "/" && !/^(input|textarea)$/i.test(tag)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const facets = React.useMemo<Facet[]>(() => {
    const counts = new Map<string, number>();
    for (const e of events) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    return [
      { id: ALL, label: "All markets", count: events.length },
      ...[...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({ id: label.toLowerCase(), label, count })),
    ];
  }, [events]);

  const liveTotal = React.useMemo(() => events.filter((e) => e.live).length, [events]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (cat !== ALL && e.category.toLowerCase() !== cat) return false;
      if (liveOnly && !e.live) return false;
      if (q && !`${e.title} ${e.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [events, query, cat, liveOnly]);

  const filtersOn = cat !== ALL || liveOnly || query.trim().length > 0;

  return (
    <section>
      {/* command bar */}
      <div className="glass sticky top-[68px] z-30 flex flex-col gap-3 rounded-[16px] p-2.5 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-[300px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#a3a3a3]" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets…"
            className="h-10 w-full rounded-[11px] border border-transparent bg-white/60 pl-10 pr-9 text-[14px] text-[#181925] placeholder:text-[#a3a3a3] transition-colors focus:border-[#9580ff] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9580ff]/15"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-[#a3a3a3] hover:bg-[#ececec] hover:text-[#181925]"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="font-num pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[6px] border border-[#e4e4e7] bg-white/70 px-1.5 py-0.5 text-[11px] text-[#a3a3a3]">
              /
            </kbd>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {facets.map((f) => {
            const active = f.id === cat;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setCat(f.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                  active
                    ? "bg-[#181925] font-medium text-white"
                    : "text-[#666666] hover:bg-[#f5f5f5] hover:text-[#181925]",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "font-num text-[11px] tabular-nums",
                    active ? "text-white/60" : "text-[#a3a3a3]",
                  )}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setLiveOnly((v) => !v)}
          aria-pressed={liveOnly}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
            liveOnly
              ? "border-[#dc2626]/30 bg-[#fef2f2] text-[#dc2626]"
              : "border-[#ececec] text-[#666666] hover:border-[#dc2626]/30 hover:text-[#181925]",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              liveOnly ? "live-dot bg-[#dc2626]" : "bg-[#a3a3a3]",
            )}
          />
          Live
          <span className="font-num text-[11px] opacity-70">{liveTotal}</span>
        </button>
      </div>

      {/* result line */}
      <div className="mt-4 mb-3 flex items-baseline justify-between">
        <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#181925]">
          {cat === ALL ? "All markets" : facets.find((f) => f.id === cat)?.label}
        </h2>
        <span className="font-num text-[12px] tabular-nums text-[#a3a3a3]">
          {filtered.length} {filtered.length === 1 ? "market" : "markets"}
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event, i) => (
            <MarketCard key={event.id} event={event} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-[16px] border border-dashed border-[#e0e0e0] bg-white/60 py-14 text-center">
          <p className="text-[14px] font-medium text-[#181925]">No markets match your filters</p>
          {filtersOn && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCat(ALL);
                setLiveOnly(false);
              }}
              className="rounded-full bg-[#f5f5f5] px-4 py-2 text-[13px] font-medium text-[#181925] transition-colors hover:bg-[#ececec]"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export { MarketsBrowser };
