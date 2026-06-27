import { hedgeSuggestions } from "@/lib/mockData";
import {
  getMarketCategories,
  getFeaturedMarket,
  getMarketEvents,
  getTrendingStocks,
} from "@/lib/server/marketData";
import { FeaturedMarketCard } from "@/components/markets/featured-market";
import { PromoRail } from "@/components/markets/promo-rail";
import { MarketsFeed } from "@/components/markets/markets-feed";
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
      {/* Category tabs + filtered markets grid (client-side interactivity) */}
      <MarketsFeed
        categories={categories}
        events={events}
        hero={
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
            <FeaturedMarketCard market={featured} />
            <PromoRail stocks={stocks} />
          </div>
        }
      />

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
