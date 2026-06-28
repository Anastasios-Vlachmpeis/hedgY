"use client";

import * as React from "react";

import { CategoryNav } from "@/components/markets/category-nav";
import { MarketCard } from "@/components/markets/market-card";
import type { MarketCategory, MarketEvent } from "@/lib/mockData";

/**
 * Client wrapper for the markets discovery feed: owns the active-category tab
 * state and filters the grid. Data is fetched server-side and passed in as
 * props; the `hero` slot (featured market + promo rail) is rendered as-is.
 */
function MarketsFeed({
  categories,
  events,
  hero,
}: {
  categories: MarketCategory[];
  events: MarketEvent[];
  hero?: React.ReactNode;
}) {
  const [activeId, setActiveId] = React.useState(categories[0]?.id);

  const activeCategory = categories.find((c) => c.id === activeId);
  // "Trending" (the first tab) shows everything; otherwise filter by label.
  const visibleEvents =
    !activeCategory || activeId === categories[0]?.id
      ? events
      : events.filter((e) => e.category === activeCategory.label);

  return (
    <div className="flex flex-col gap-5">
      <CategoryNav
        categories={categories}
        activeId={activeId}
        onChange={setActiveId}
      />

      {hero}

      <section>
        <h2 className="mb-3 text-[18px] font-semibold tracking-[-0.01em] text-[#181925]">
          {activeId === categories[0]?.id ? "All markets" : activeCategory?.label}
        </h2>
        {visibleEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => (
              <MarketCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-[#666666]">
            No markets in this category yet.
          </p>
        )}
      </section>
    </div>
  );
}

export { MarketsFeed };
