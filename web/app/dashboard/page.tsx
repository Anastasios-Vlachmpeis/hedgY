import {
  portfolio,
  portfolioSeries,
  exposure,
  trendingStocks,
  trendingMarkets,
} from "@/lib/mockData";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { TrendingStocks } from "@/components/dashboard/trending-stocks";
import { TrendingMarkets } from "@/components/dashboard/trending-markets";
import { StructuringPanel } from "@/components/dashboard/structuring-panel";

/** User home screen. Light dashboard with one dark Structuring hero column. */
export default function DashboardPage() {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#181925]">
          Good morning, Maxim
        </h1>
        <p className="text-[13px] text-[#a3a3a3]">Markets open · Mock data</p>
      </div>

      <div className="grid grid-cols-12 gap-3 lg:auto-rows-min lg:grid-rows-[auto_1fr]">
        {/* LEFT-TOP — Portfolio / Overview */}
        <div className="col-span-12 lg:col-span-8">
          <PortfolioOverview
            portfolio={portfolio}
            series={portfolioSeries}
            exposure={exposure}
          />
        </div>

        {/* RIGHT (full height) — Structuring hero (dark) */}
        <div className="col-span-12 lg:col-span-4 lg:row-span-2">
          <StructuringPanel />
        </div>

        {/* LEFT-BOTTOM — Trending Stocks | Trending Prediction Markets */}
        <div className="col-span-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8">
          <TrendingStocks stocks={trendingStocks} />
          <TrendingMarkets markets={trendingMarkets} />
        </div>
      </div>
    </div>
  );
}
