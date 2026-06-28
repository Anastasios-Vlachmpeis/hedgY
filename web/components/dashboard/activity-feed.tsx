import * as React from "react";

import { cn } from "@/lib/utils";
import { signedUsd } from "@/lib/format";
import type { Activity } from "@/lib/mockData";

function kindLabel(kind: Activity["kind"]): string {
  if (kind === "Bought") return "Buy";
  if (kind === "Sold") return "Sell";
  if (kind === "Hedged") return "Hedge";
  if (kind === "Deposit") return "Deposit";
  return "Settled";
}

function InitialAvatar({ title }: { title: string }) {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-[12px] font-semibold text-[#666666]">
      {title.charAt(0).toUpperCase()}
    </div>
  );
}

/** Bare list — Polymarket Activity style: TYPE | MARKET | AMOUNT columns. */
function ActivityRows({ activity }: { activity: Activity[] }) {
  return (
    <div>
      {/* Table header */}
      <div className="flex items-center border-b border-[#f0f0f0] pb-2">
        <span className="w-[72px] shrink-0 text-[11px] font-medium uppercase tracking-[0.05em] text-[#737373]">
          Type
        </span>
        <span className="flex-1 text-[11px] font-medium uppercase tracking-[0.05em] text-[#737373]">
          Market
        </span>
        <span className="ml-4 shrink-0 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-[#737373]">
          Amount
        </span>
      </div>

      {/* Rows */}
      <ul className="divide-y divide-[#f0f0f0]">
        {activity.map((a) => {
          const up = a.amount >= 0;
          return (
            <li key={a.id} className="flex items-center py-3">
              {/* TYPE */}
              <span className="w-[72px] shrink-0 text-[13px] text-[#555555]">
                {kindLabel(a.kind)}
              </span>

              {/* MARKET */}
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <InitialAvatar title={a.title} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#0a0a0a]">
                    {a.title}
                  </p>
                  <p className="truncate text-[11px] text-[#a3a3a3]">{a.detail}</p>
                </div>
              </div>

              {/* AMOUNT */}
              <div className="ml-4 shrink-0 text-right">
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
    </div>
  );
}

/** Standalone card (kept for reuse). */
function ActivityFeed({ activity }: { activity: Activity[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        Activity
      </h2>
      <ActivityRows activity={activity} />
    </section>
  );
}

export { ActivityFeed, ActivityRows };
