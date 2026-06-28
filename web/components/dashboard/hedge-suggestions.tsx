import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { ActionButton } from "@/components/ui/action-button";
import type { HedgeSuggestion } from "@/lib/mockData";

const STRENGTH_STYLES: Record<HedgeSuggestion["strength"], string> = {
  Strong: "text-[#9580ff]",
  Moderate: "text-[#666666]",
  Light: "text-[#a3a3a3]",
};

function SuggestionCard({ s }: { s: HedgeSuggestion }) {
  const yes = s.hedgeSide === "YES";
  return (
    <div className="flex items-center gap-4 py-3">
      {/* content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-[#181925]">{s.equityLabel}</p>
          <span className={cn("text-[11px] font-medium", STRENGTH_STYLES[s.strength])}>
            · {s.strength}
          </span>
        </div>

        {/* pairing: equity → hedge */}
        <div className="flex min-w-0 items-center gap-2 text-[12px]">
          <span className="shrink-0 tabular-nums text-[#3f3f46]">
            {s.equitySymbols.join(" · ")}
          </span>
          <ArrowRight className="size-4 shrink-0 text-[#9580ff]" />
          <span
            className={cn(
              "shrink-0 font-semibold",
              yes ? "text-[#16a34a]" : "text-[#dc2626]",
            )}
          >
            {s.hedgeSide}
          </span>
          <span className="truncate text-[#3f3f46]">{s.hedgeMarket}</span>
          <span className="shrink-0 font-semibold tabular-nums text-[#181925]">
            @{Math.round(s.hedgePrice * 100)}%
          </span>
        </div>

        <p className="truncate text-[12px] text-[#666666]">{s.rationale}</p>
        <p className="text-[11px] leading-relaxed text-[#a3a3a3]">{s.approachNote}</p>
      </div>

      <ActionButton asChild tone="buy" className="shrink-0">
        <Link href={`/structure?from=${s.id}`}>
          Build this <ArrowRight className="size-3.5" />
        </Link>
      </ActionButton>
    </div>
  );
}

function HedgeSuggestions({ suggestions }: { suggestions: HedgeSuggestion[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          Hedge Suggestions
        </h2>
        <span className="text-[10px] font-medium uppercase tracking-wide text-[#9580ff]">
          Curated
        </span>
      </div>
      <div className="flex flex-1 flex-col divide-y divide-[#f0f0f0]">
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} s={s} />
        ))}
      </div>
    </section>
  );
}

export { HedgeSuggestions };
