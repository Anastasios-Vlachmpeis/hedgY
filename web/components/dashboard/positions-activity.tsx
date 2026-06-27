"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { PositionsRows } from "@/components/dashboard/positions-table";
import { ActivityRows } from "@/components/dashboard/activity-feed";
import type { Activity, Position } from "@/lib/mockData";

function PositionsActivity({
  positions,
  activity,
}: {
  positions: Position[];
  activity: Activity[];
}) {
  const [tab, setTab] = React.useState<"positions" | "activity">("positions");

  return (
    <section className="rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-2 flex items-center gap-4 border-b border-[#f0f0f0]">
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
        <PositionsRows positions={positions} />
      ) : (
        <ActivityRows activity={activity} />
      )}
    </section>
  );
}

export { PositionsActivity };
