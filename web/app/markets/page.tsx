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
  return (
    <div className="flex flex-col gap-5">
      <CategoryNav categories={marketCategories} />

      {/* Hero band: featured market + promo rail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <FeaturedMarketCard market={featuredMarket} />
        <PromoRail stocks={trendingStocks} />
      </div>

      {/* All markets grid */}
      <section>
        <h2 className="mb-3 text-[18px] font-semibold tracking-[-0.01em] text-[#181925]">
          All markets
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketEvents.map((event) => (
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
