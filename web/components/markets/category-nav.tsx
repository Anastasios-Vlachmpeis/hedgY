"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { MarketCategory } from "@/lib/mockData";

function CategoryNav({ categories }: { categories: MarketCategory[] }) {
  const [activeId, setActiveId] = React.useState(categories[0]?.id);

  return (
    <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((c) => {
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveId(c.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
              active
                ? "bg-[#181925] font-medium text-white"
                : "text-[#666666] hover:bg-[#f5f5f5] hover:text-[#181925]",
            )}
          >
            {c.label}
            <span
              className={cn(
                "text-[11px] tabular-nums opacity-60",
                active ? "text-white" : "text-[#a3a3a3]",
              )}
            >
              {c.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { CategoryNav };
