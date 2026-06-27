import { positions, activity } from "@/lib/mockData";
import { getPortfolio } from "@/lib/server/marketData";
import { AccountHeader } from "@/components/dashboard/account-header";
import { PositionsActivity } from "@/components/dashboard/positions-activity";

// Live portfolio (Alpaca paper account) per the data layer; falls back to mock.
export const dynamic = "force-dynamic";

/** User account — Polymarket-style: summary + P&L, then positions/activity. */
export default async function DashboardPage() {
  const portfolio = await getPortfolio();

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#181925]">
          Good morning, Maxim
        </h1>
        <p className="text-[13px] text-[#a3a3a3]">Markets open</p>
      </div>

      <div className="flex flex-col gap-4">
        <AccountHeader portfolio={portfolio} />
        <PositionsActivity positions={positions} activity={activity} />
      </div>
    </div>
  );
}
