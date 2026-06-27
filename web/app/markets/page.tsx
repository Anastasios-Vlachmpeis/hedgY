"use client";

import * as React from "react";

import {
  marketCategories,
  marketEvents,
  featuredMarket,
  trendingStocks,
  hedgeSuggestions,
} from "@/lib/mockData";
import { CategoryNav } from "@/components/markets/category-nav";
import { FeaturedMarketCard } from "@/components/markets/featured-market";
import { PromoRail } from "@/components/markets/promo-rail";
import { MarketCard } from "@/components/markets/market-card";
import { HedgeSuggestions } from "@/components/dashboard/hedge-suggestions";

/** Markets discovery home — Polymarket/Kalshi-style feed, tailored to us. */
export default function MarketsPage() {
  const [activeId, setActiveId] = React.useState(marketCategories[0]?.id);

  const activeCategory = marketCategories.find((c) => c.id === activeId);
  // "Trending" (the first tab) shows everything; otherwise filter by label.
  const visibleEvents =
    !activeCategory || activeId === marketCategories[0]?.id
      ? marketEvents
      : marketEvents.filter((e) => e.category === activeCategory.label);

  return (
    <div className="flex flex-col gap-5">
      <CategoryNav
        categories={marketCategories}
        activeId={activeId}
        onChange={setActiveId}
      />

      {/* Hero band: featured market + promo rail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <FeaturedMarketCard market={featuredMarket} />
        <PromoRail stocks={trendingStocks} />
      </div>

      {/* All markets grid */}
      <section>
        <h2 className="mb-3 text-[18px] font-semibold tracking-[-0.01em] text-[#181925]">
          {activeId === marketCategories[0]?.id
            ? "All markets"
            : activeCategory?.label}
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

      {/* Curated combined-position ideas */}
      <section>
        <h2 className="mb-3 text-[18px] font-semibold tracking-[-0.01em] text-[#181925]">
          Hedge ideas
        </h2>
        <HedgeSuggestions suggestions={hedgeSuggestions} />
      </section>
    </div>
  );
}
