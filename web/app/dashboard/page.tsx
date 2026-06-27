import { positions, activity } from "@/lib/mockData";
import { AccountHeader } from "@/components/dashboard/account-header";
import { PositionsActivity } from "@/components/dashboard/positions-activity";
import { getPortfolio } from "@/lib/server/marketData";

// Live Alpaca paper account (balance/equity/buying-power); positions & activity
// are the styled UI fixtures for now. force-dynamic so each load is fresh.
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
        <p className="text-[13px] text-[#a3a3a3]">Markets open · Live account</p>
      </div>

      <div className="flex flex-col gap-4">
        <AccountHeader portfolio={portfolio} />
        <PositionsActivity positions={positions} activity={activity} />
      </div>
    </div>
  );
}
