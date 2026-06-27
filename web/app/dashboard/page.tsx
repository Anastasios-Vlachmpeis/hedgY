import { AccountHeader } from "@/components/dashboard/account-header";
import { PositionsActivity } from "@/components/dashboard/positions-activity";
import { getAccount, getPositions, getActivity } from "@/lib/server/marketData";

// Live $1000 paper-trading account (deposit + real positions/activity from the
// backend ledger). force-dynamic so every load reflects the latest trades.
export const dynamic = "force-dynamic";

/** User account — Polymarket-style: summary + P&L, then positions/activity. */
export default async function DashboardPage() {
  const [portfolio, positions, activity] = await Promise.all([
    getAccount(),
    getPositions(),
    getActivity(),
  ]);

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
