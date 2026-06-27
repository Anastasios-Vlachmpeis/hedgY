import { portfolio, positions, activity } from "@/lib/mockData";
import { AccountHeader } from "@/components/dashboard/account-header";
import { PositionsActivity } from "@/components/dashboard/positions-activity";

/** User account — Polymarket-style: summary + P&L, then positions/activity. */
export default function DashboardPage() {
import { exposure, regionExposure, sectorWeights, hedgeSuggestions } from "@/lib/mockData";
import {
  getTrendingStocks,
  getTrendingMarkets,
  getPortfolio,
  getPortfolioSeries,
} from "@/lib/server/marketData";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { TrendingStocks } from "@/components/dashboard/trending-stocks";
import { TrendingMarkets } from "@/components/dashboard/trending-markets";
import { ByRegion } from "@/components/dashboard/by-region";
import { BySector } from "@/components/dashboard/by-sector";
import { HedgeSuggestions } from "@/components/dashboard/hedge-suggestions";

// Live venue data (Alpaca stocks + paper portfolio, aggregator markets) per request.
export const dynamic = "force-dynamic";

/** User home screen — fully light, two row-bands on a 12-col grid. */
export default async function DashboardPage() {
  const [trendingStocks, trendingMarkets, portfolio, portfolioSeries] =
    await Promise.all([
      getTrendingStocks(),
      getTrendingMarkets(),
      getPortfolio(),
      getPortfolioSeries(),
    ]);

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#181925]">
          Good morning, Maxim
        </h1>
        <p className="text-[13px] text-[#a3a3a3]">Markets open · Mock data</p>
      </div>

      <div className="flex flex-col gap-4">
        <AccountHeader portfolio={portfolio} />
        <PositionsActivity positions={positions} activity={activity} />
      </div>
    </div>
  );
}
