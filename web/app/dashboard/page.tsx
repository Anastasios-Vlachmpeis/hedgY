import { AccountHeader } from "@/components/dashboard/account-header";
import { PositionsActivity } from "@/components/dashboard/positions-activity";
import {
  getAccount,
  getPositions,
  getActivity,
  getAccountHistory,
  getPlatformBreakdown,
} from "@/lib/server/marketData";

// Live $1000 paper-trading account (deposit + real positions/activity + real P&L
// curve + platform breakdown from the backend ledger). force-dynamic so every
// load reflects the latest trades.
export const dynamic = "force-dynamic";

/** User account — Polymarket-style: summary + P&L, then positions/activity. */
export default async function DashboardPage() {
  const [portfolio, positions, activity, history, breakdown] = await Promise.all([
    getAccount(),
    getPositions(),
    getActivity(),
    getAccountHistory(),
    getPlatformBreakdown(),
  ]);

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#181925]">
          Good morning, Maxim
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        <AccountHeader portfolio={portfolio} history={history} breakdown={breakdown} />
        <PositionsActivity positions={positions} activity={activity} />
      </div>
    </div>
  );
}
