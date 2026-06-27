"use client";

import * as React from "react";
import { Search, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { PositionsRows } from "@/components/dashboard/positions-table";
import { ActivityRows } from "@/components/dashboard/activity-feed";
import type { Activity, Position } from "@/lib/mockData";

const TYPE_FILTERS = ["All", "Combined", "Equity", "Prediction"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];
type SortMode = "value-desc" | "value-asc";

function PositionsActivity({
  positions,
  activity,
}: {
  positions: Position[];
  activity: Activity[];
}) {
  const [tab, setTab] = React.useState<"positions" | "activity">("positions");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("All");
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortMode>("value-desc");

  const filtered = React.useMemo(() => {
    let result = positions;
    if (typeFilter !== "All") result = result.filter((p) => p.type === typeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.detail.toLowerCase().includes(q),
      );
    }
    result = [...result].sort((a, b) =>
      sort === "value-desc" ? b.value - a.value : a.value - b.value,
    );
    return result;
  }, [positions, typeFilter, search, sort]);

  return (
    <div>
      {/* Tab bar — plain text, no container card */}
      <div className="mb-3 flex items-center gap-4 border-b border-[#f0f0f0]">
        {(["positions", "activity"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 pb-2.5 text-[14px] font-semibold capitalize transition-colors",
              t === tab
                ? "border-[#9580ff] text-[#181925]"
                : "border-transparent text-[#a3a3a3] hover:text-[#666666]",
            )}
          >
            {t}
            <span className="ml-1.5 text-[12px] font-medium tabular-nums text-[#a3a3a3]">
              {t === "positions" ? positions.length : activity.length}
            </span>
          </button>
        ))}
      </div>

      {tab === "positions" ? (
        <>
          {/* Control toolbar */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex shrink-0 items-center rounded-[8px] border border-[#e8e8e8] bg-[#f5f5f5] p-0.5">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTypeFilter(f)}
                  className={cn(
                    "rounded-[6px] px-2.5 py-[5px] text-[12px] font-medium transition-colors",
                    f === typeFilter
                      ? "bg-white text-[#181925] shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
                      : "text-[#737373] hover:text-[#444444]",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#a3a3a3]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search positions"
                className="h-[30px] w-full rounded-[8px] border border-[#e8e8e8] bg-white pl-8 pr-3 text-[12px] text-[#181925] placeholder:text-[#a3a3a3] transition-colors focus:border-[#9580ff] focus:outline-none focus:ring-2 focus:ring-[#9580ff]/20"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setSort((s) => (s === "value-desc" ? "value-asc" : "value-desc"))
              }
              className="flex h-[30px] shrink-0 items-center gap-1.5 rounded-[8px] border border-[#e8e8e8] bg-white px-3 text-[12px] font-medium text-[#444444] transition-colors hover:border-[#c8c8c8] hover:text-[#181925]"
            >
              Value
              <ChevronDown
                className={cn(
                  "size-3 text-[#a3a3a3] transition-transform",
                  sort === "value-asc" && "rotate-180",
                )}
              />
            </button>
          </div>

          {/* Column header — px-3 + gap-3 matches pill card internal layout */}
          <div className="mb-2 flex items-center gap-3 border-b border-[#f0f0f0] px-3 pb-2">
            <span className="flex-1 text-[11px] font-medium uppercase tracking-[0.05em] text-[#737373]">
              Market
            </span>
            <span className="hidden w-24 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-[#737373] sm:block">
              Value
            </span>
            <span className="w-24 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-[#737373]">
              P&amp;L
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
              <span className="text-[13px] font-medium text-[#444444]">No positions found</span>
              <span className="text-[12px] text-[#a3a3a3]">Try adjusting your filter or search</span>
            </div>
          ) : (
            <PositionsRows
              positions={filtered}
              hideGroupHeaders={typeFilter !== "All"}
            />
          )}
        </>
      ) : (
        <ActivityRows activity={activity} />
      )}
    </div>
  );
}

export { PositionsActivity };
