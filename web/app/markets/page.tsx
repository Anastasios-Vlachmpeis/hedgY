import { hedgeSuggestions } from "@/lib/mockData";
import {
  getMarketCategories,
  getFeaturedMarket,
  getMarketEvents,
  getTrendingStocks,
} from "@/lib/server/marketData";
import { MarketPulse } from "@/components/markets/market-pulse";
import { FeaturedMarketCard } from "@/components/markets/featured-market";
import { PromoRail } from "@/components/markets/promo-rail";
import { MarketsBrowser } from "@/components/markets/markets-browser";
import { HedgeSuggestions } from "@/components/dashboard/hedge-suggestions";

// Live cross-venue aggregator data (Kalshi + Polymarket) + Alpaca stocks, with
// mock fallback on any venue error. force-dynamic so each load is fresh.
export const dynamic = "force-dynamic";

/** Markets terminal — two markets (equities + events), one position. */
export default async function MarketsPage() {
  const [categories, featured, events, stocks] = await Promise.all([
    getMarketCategories(),
    getFeaturedMarket(),
    getMarketEvents(),
    getTrendingStocks(),
  ]);

  const marketCount = categories[0]?.count ?? events.length;

  return (
    <div className="flex flex-col gap-7">
      {/* Signature: the two markets, alive and in motion */}
      <MarketPulse stocks={stocks} events={events} marketCount={marketCount} />

      {/* Featured market + the equities rail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px] lg:items-start">
        <FeaturedMarketCard market={featured} />
        <PromoRail stocks={stocks} />
      </div>

      {/* Browse all markets — search, category, live filters */}
      <MarketsBrowser events={events} />

      {/* Curated combined-position ideas */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[#181925]">
            Hedge ideas
          </h2>
          <span className="text-[11px] font-medium uppercase tracking-wide text-[#9580ff]">
            Curated
          </span>
        </div>
        <HedgeSuggestions suggestions={hedgeSuggestions} />
      </section>
    </div>
  );
}
