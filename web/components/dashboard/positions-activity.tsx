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
    <section className="rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Tab bar */}
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
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {/* Type filter — segmented pill */}
            <div className="flex items-center rounded-[8px] bg-[#f5f5f5] p-0.5">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTypeFilter(f)}
                  className={cn(
                    "rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors",
                    f === typeFilter
                      ? "bg-white text-[#181925] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                      : "text-[#a3a3a3] hover:text-[#666666]",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex min-w-0 flex-1 items-center">
              <Search className="pointer-events-none absolute left-2.5 size-3.5 text-[#a3a3a3]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search positions"
                className="h-7 w-full rounded-[8px] border border-[#ececec] bg-white pl-8 pr-3 text-[12px] text-[#181925] placeholder:text-[#a3a3a3] focus:border-[#9580ff] focus:outline-none"
              />
            </div>

            {/* Sort */}
            <button
              type="button"
              onClick={() =>
                setSort((s) => (s === "value-desc" ? "value-asc" : "value-desc"))
              }
              className="flex h-7 items-center gap-1 rounded-[8px] border border-[#ececec] bg-white px-2.5 text-[12px] text-[#666666] hover:border-[#d4d4d4] hover:text-[#181925] transition-colors"
            >
              Sort: Value
              <ChevronDown
                className={cn(
                  "size-3 transition-transform",
                  sort === "value-asc" && "rotate-180",
                )}
              />
            </button>
          </div>

          {/* Table header */}
          <div className="mb-1 flex items-center justify-between px-0">
            <span className="text-[10px] font-medium uppercase tracking-wide text-[#a3a3a3]">
              Market
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-[#a3a3a3]">
              Value · P&L
            </span>
          </div>

          {/* Positions list or empty state */}
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-[13px] text-[#a3a3a3]">
              No positions found
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
    </section>
  );
}

export { PositionsActivity };
