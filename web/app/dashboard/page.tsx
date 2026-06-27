import {
  portfolio,
  portfolioSeries,
  exposure,
  trendingStocks,
  trendingMarkets,
  regionExposure,
  sectorWeights,
  hedgeSuggestions,
} from "@/lib/mockData";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { TrendingStocks } from "@/components/dashboard/trending-stocks";
import { TrendingMarkets } from "@/components/dashboard/trending-markets";
import { ByRegion } from "@/components/dashboard/by-region";
import { BySector } from "@/components/dashboard/by-sector";
import { HedgeSuggestions } from "@/components/dashboard/hedge-suggestions";

/** User home screen — fully light, two row-bands on a 12-col grid. */
export default function DashboardPage() {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#181925]">
          Good morning, Maxim
        </h1>
        <p className="text-[13px] text-[#a3a3a3]">Markets open · Mock data</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* TOP BAND: Portfolio (1–6) · By Region (7–9) · By Sector (10–12) */}
        <div className="col-span-12 lg:col-span-6">
          <PortfolioOverview
            portfolio={portfolio}
            series={portfolioSeries}
            exposure={exposure}
          />
        </div>
        <div className="col-span-6 lg:col-span-3">
          <ByRegion regions={regionExposure} />
        </div>
        <div className="col-span-6 lg:col-span-3">
          <BySector sectors={sectorWeights} />
        </div>

        {/* BOTTOM BAND: Trending Stocks (1–3) · Trending Predictions (4–6) · Hedge Suggestions (7–12) */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <TrendingStocks stocks={trendingStocks} />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <TrendingMarkets markets={trendingMarkets} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <HedgeSuggestions suggestions={hedgeSuggestions} />
        </div>
      </div>
    </div>
  );
}
