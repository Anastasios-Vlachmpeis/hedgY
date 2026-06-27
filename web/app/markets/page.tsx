import { hedgeSuggestions } from "@/lib/mockData";
import {
  getMarketCategories,
  getFeaturedMarket,
  getMarketEvents,
  getTrendingStocks,
} from "@/lib/server/marketData";
import { CategoryNav } from "@/components/markets/category-nav";
import { FeaturedMarketCard } from "@/components/markets/featured-market";
import { PromoRail } from "@/components/markets/promo-rail";
import { MarketCard } from "@/components/markets/market-card";
import { HedgeSuggestions } from "@/components/dashboard/hedge-suggestions";

// Live cross-venue aggregator data (Kalshi + Polymarket) + Alpaca stocks, with
// mock fallback on any venue error. force-dynamic so each load is fresh.
export const dynamic = "force-dynamic";

/** Markets discovery home — Polymarket/Kalshi-style feed, tailored to us. */
export default async function MarketsPage() {
  const [categories, featured, events, stocks] = await Promise.all([
    getMarketCategories(),
    getFeaturedMarket(),
    getMarketEvents(),
    getTrendingStocks(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <CategoryNav categories={categories} />

      {/* Hero band: featured market + promo rail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <FeaturedMarketCard market={featured} />
        <PromoRail stocks={stocks} />
      </div>

      {/* All markets grid */}
      <section>
        <h2 className="mb-3 text-[18px] font-semibold tracking-[-0.01em] text-[#181925]">
          All markets
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <MarketCard key={event.id} event={event} />
          ))}
        </div>
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
