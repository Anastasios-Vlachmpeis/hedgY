import { Diamond, LineChart, TrendingUp, Wallet } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";

/** Inline placeholder used inside skeleton regions (replaced next session). */
function Placeholder({ note }: { note: string }) {
  return (
    <div className="flex h-full min-h-24 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
      {note}
    </div>
  );
}

/**
 * Dashboard / user home — LAYOUT SHELL ONLY.
 * 12-col grid. Real components drop into each labeled region next session.
 */
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-4 lg:auto-rows-min lg:grid-rows-[auto_1fr]">
      {/* LEFT-TOP — Portfolio / Overview */}
      <Card className="col-span-12 lg:col-span-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-3.5" />
            Portfolio · Overview
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">Placeholder</span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Net Liquidity" value="$0.00" delta="+0.00%" direction="up" />
            <StatTile label="Day P/L" value="$0.00" delta="0.00%" direction="flat" />
            <StatTile label="Buying Power" value="$0.00" />
            <StatTile label="Positions" value="0" />
          </div>
          <Placeholder note="Equity curve / allocation chart →" />
        </CardContent>
      </Card>

      {/* RIGHT (full height) — Specialized / Structuring hero */}
      <Card className="col-span-12 border-structuring/40 ring-1 ring-structuring/10 lg:col-span-4 lg:row-span-2">
        <CardHeader className="border-structuring/30">
          <CardTitle className="flex items-center gap-2 text-structuring">
            <Diamond className="size-3.5 fill-structuring" />
            Structuring
          </CardTitle>
          <span className="rounded border border-structuring/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-structuring">
            Specialized
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Basket Builder
            </h3>
            <Placeholder note="Add legs, set weights & sides →" />
          </section>
          <div className="border-t border-border" />
          <section className="flex flex-1 flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Position Preview
            </h3>
            <Placeholder note="Notional · cost · max loss/gain →" />
          </section>
        </CardContent>
      </Card>

      {/* LEFT-BOTTOM split — Trending Stocks | Trending Prediction Markets */}
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-3.5" />
              Trending Stocks
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">Placeholder</span>
          </CardHeader>
          <CardContent>
            <Placeholder note="Ranked movers list →" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="size-3.5" />
              Trending Prediction Markets
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">Placeholder</span>
          </CardHeader>
          <CardContent>
            <Placeholder note="Top markets by volume / move →" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
