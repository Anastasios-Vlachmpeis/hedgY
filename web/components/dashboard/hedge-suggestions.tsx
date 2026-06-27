import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { ActionButton } from "@/components/ui/action-button";
import type { HedgeSuggestion } from "@/lib/mockData";

// Qualitative chip — kept neutral/tinted so solid violet stays reserved for actions.
const STRENGTH_STYLES: Record<HedgeSuggestion["strength"], string> = {
  Strong: "bg-[#f3f1ff] text-[#9580ff]",
  Moderate: "bg-[#f5f5f5] text-[#666666]",
  Light: "bg-[#f5f5f5] text-[#a3a3a3]",
};

function SymbolChips({ symbols }: { symbols: string[] }) {
  return (
    <span className="flex shrink-0 gap-1">
      {symbols.map((s) => (
        <span
          key={s}
          className="rounded-[5px] bg-[#f0f0f0] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[#3f3f46]"
        >
          {s}
        </span>
      ))}
    </span>
  );
}

function SuggestionCard({ s }: { s: HedgeSuggestion }) {
  const yes = s.hedgeSide === "YES";
  return (
    <div className="flex items-center gap-4 rounded-[8px] bg-white p-3">
      {/* content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* title + strength */}
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-[#181925]">{s.equityLabel}</p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              STRENGTH_STYLES[s.strength],
            )}
          >
            {s.strength}
          </span>
        </div>

        {/* pairing: equity → hedge */}
        <div className="flex min-w-0 items-center gap-2 text-[12px]">
          <SymbolChips symbols={s.equitySymbols} />
          <ArrowRight className="size-4 shrink-0 text-[#9580ff]" />
          <span
            className={cn(
              "shrink-0 rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold",
              yes ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]",
            )}
          >
            {s.hedgeSide}
          </span>
          <span className="truncate text-[#3f3f46]">{s.hedgeMarket}</span>
          <span className="shrink-0 font-mono font-semibold text-[#181925]">
            @{Math.round(s.hedgePrice * 100)}%
          </span>
        </div>

        {/* rationale */}
        <p className="truncate text-[12px] text-[#666666]">{s.rationale}</p>
      </div>

      {/* action — same language as Buy / Yes / No */}
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
    <section className="flex h-full flex-col rounded-[12px] bg-[#f5f5f5] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-[#666666]">
          Hedge Suggestions
        </h2>
        <span className="rounded-full bg-[#f3f1ff] px-2 py-0.5 text-[10px] font-medium text-[#9580ff]">
          Curated
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2">
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} s={s} />
        ))}
      </div>
    </section>
  );
}

export { HedgeSuggestions };
