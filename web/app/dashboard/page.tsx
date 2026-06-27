import {
  portfolio,
  portfolioSeries,
  exposure,
  regionExposure,
  sectorWeights,
  positions,
  activity,
  watchlist,
  openOrders,
} from "@/lib/mockData";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { ByRegion } from "@/components/dashboard/by-region";
import { BySector } from "@/components/dashboard/by-sector";
import { PositionsTable } from "@/components/dashboard/positions-table";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Watchlist } from "@/components/dashboard/watchlist";
import { OpenOrders } from "@/components/dashboard/open-orders";

/** User account — portfolio, exposure, positions, activity & orders. */
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
        {/* Row 1 — overview + personal exposure */}
        <div className="col-span-12 lg:col-span-8">
          <PortfolioOverview
            portfolio={portfolio}
            series={portfolioSeries}
            exposure={exposure}
          />
        </div>
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <ByRegion regions={regionExposure} />
          <BySector sectors={sectorWeights} />
        </div>

        {/* Row 2 — positions + activity */}
        <div className="col-span-12 lg:col-span-8">
          <PositionsTable positions={positions} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ActivityFeed activity={activity} />
        </div>

        {/* Row 3 — watchlist + open orders */}
        <div className="col-span-12 lg:col-span-6">
          <Watchlist items={watchlist} />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <OpenOrders orders={openOrders} />
        </div>
      </div>
    </div>
  );
}
