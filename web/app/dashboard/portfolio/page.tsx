"use client";

import * as React from "react";
import { AccountHeader } from "@/components/dashboard/account-header";
import { PositionsActivity } from "@/components/dashboard/positions-activity";
import { portfolio, portfolioSeries, platformBreakdown, positions, activity } from "@/lib/mockData";

export default function PortfolioPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-8 py-6">
      <AccountHeader portfolio={portfolio} />
      <PositionsActivity positions={positions} activity={activity} />
    </div>
  );
}
