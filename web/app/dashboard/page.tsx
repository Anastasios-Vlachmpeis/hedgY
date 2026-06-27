import { portfolio, positions, activity } from "@/lib/mockData";
import { AccountHeader } from "@/components/dashboard/account-header";
import { PositionsActivity } from "@/components/dashboard/positions-activity";
/** UI/design dashboard — Polymarket-style account view, mock data only.
 *  (The team's live backend-test dashboard lives separately.) */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#181925]">
          Good morning, Maxim
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        <AccountHeader portfolio={portfolio} />
        <PositionsActivity positions={positions} activity={activity} />
      </div>
    </div>
  );
}
