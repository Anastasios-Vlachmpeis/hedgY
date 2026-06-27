import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { HedgeSuggestion } from "@/lib/mockData";

const STRENGTH_STYLES: Record<HedgeSuggestion["strength"], string> = {
  Strong: "bg-[#9580ff] text-white",
  Moderate: "bg-[#f3f1ff] text-[#9580ff]",
  Light: "bg-white text-[#666666]",
};

function SymbolChips({ symbols }: { symbols: string[] }) {
  return (
    <span className="flex flex-wrap gap-1">
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
    <div className="rounded-[8px] bg-white p-3.5">
      <div className="flex items-center gap-3">
        {/* equity leg */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#181925]">{s.equityLabel}</p>
          <div className="mt-1">
            <SymbolChips symbols={s.equitySymbols} />
          </div>
        </div>

        {/* connector */}
        <div className="flex shrink-0 flex-col items-center text-[#a3a3a3]">
          <ArrowRight className="size-4 text-[#9580ff]" />
          <span className="mt-0.5 text-[10px] uppercase tracking-wide">hedge</span>
        </div>

        {/* hedge leg */}
        <div className="min-w-0 flex-1 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <span
              className={cn(
                "rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold",
                yes ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]",
              )}
            >
              {s.hedgeSide}
            </span>
            <span className="font-mono text-[12px] font-semibold text-[#181925]">
              @{Math.round(s.hedgePrice * 100)}%
            </span>
          </div>
          <p className="mt-1 truncate text-[12px] text-[#3f3f46]">{s.hedgeMarket}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#f0f0f0] pt-2.5">
        <p className="min-w-0 truncate text-[12px] text-[#666666]">{s.rationale}</p>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              STRENGTH_STYLES[s.strength],
            )}
          >
            {s.strength}
          </span>
          <Link
            href={`/structure?from=${s.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-[#9580ff] px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-[#a99bff] active:translate-y-px"
          >
            Build this <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
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
      <div className="flex flex-1 flex-col justify-between gap-2.5">
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} s={s} />
        ))}
      </div>
    </section>
  );
}

export { HedgeSuggestions };
