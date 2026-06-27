import {
  portfolio,
  portfolioSeries,
  exposure,
  regionExposure,
  sectorWeights,
  positions,
} from "@/lib/mockData";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { ByRegion } from "@/components/dashboard/by-region";
import { BySector } from "@/components/dashboard/by-sector";
import { PositionsTable } from "@/components/dashboard/positions-table";

/** User account — portfolio, exposure, and open positions. Stats only. */
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
        {/* Portfolio overview (main) + personal exposure (right) */}
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

        {/* Open positions */}
        <div className="col-span-12">
          <PositionsTable positions={positions} />
        </div>
      </div>
    </div>
  );
}
