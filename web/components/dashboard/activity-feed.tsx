import * as React from "react";

import { cn } from "@/lib/utils";
import { signedUsd } from "@/lib/format";
import type { Activity } from "@/lib/mockData";

const KIND_CHIP: Record<Activity["kind"], string> = {
  Bought: "bg-[#f3f1ff] text-[#9580ff]",
  Hedged: "bg-[#f3f1ff] text-[#9580ff]",
  Sold: "bg-[#f5f5f5] text-[#666666]",
  Deposit: "bg-[#dcfce7] text-[#16a34a]",
  Settled: "bg-[#f5f5f5] text-[#666666]",
};

function ActivityFeed({ activity }: { activity: Activity[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        Activity
      </h2>
      <ul className="divide-y divide-[#f0f0f0]">
        {activity.map((a) => {
          const up = a.amount >= 0;
          return (
            <li key={a.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "shrink-0 rounded-[5px] px-1.5 py-0.5 text-[10px] font-medium",
                      KIND_CHIP[a.kind],
                    )}
                  >
                    {a.kind}
                  </span>
                  <span className="truncate text-[13px] font-semibold text-[#181925]">
                    {a.title}
                  </span>
                </div>
                <p className="truncate text-[11px] text-[#a3a3a3]">{a.detail}</p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={cn(
                    "text-[13px] font-semibold tabular-nums",
                    up ? "text-[#16a34a]" : "text-[#dc2626]",
                  )}
                >
                  {signedUsd(a.amount, 0)}
                </p>
                <p className="text-[11px] tabular-nums text-[#a3a3a3]">{a.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { ActivityFeed };
