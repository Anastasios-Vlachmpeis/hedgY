"use client";

import * as React from "react";
import { AccountHeader } from "@/components/dashboard/account-header";
import { PositionsActivity } from "@/components/dashboard/positions-activity";
import {
  portfolio as mockPortfolio,
  positions as mockPositions,
  activity,
  type Portfolio,
  type Position,
} from "@/lib/mockData";

// Backend /positions item (stocks via Alpaca, predictions via Kalshi+Polymarket).
interface BackendPosition {
  id: number | string;
  kind: "stock" | "prediction";
  symbol?: string | null;
  market_id?: string | null;
  side?: string | null;
  qty: number;
  avg_entry: number;
  label?: string | null;
  market_value: number;
  cost: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
}

function mapPosition(p: BackendPosition): Position {
  const isStock = p.kind === "stock";
  return {
    id: String(p.id),
    title: isStock ? (p.symbol ?? "—") : (p.label ?? p.market_id ?? "Prediction"),
    type: isStock ? "Equity" : "Prediction",
    detail: isStock
      ? `${p.qty} sh · avg $${Number(p.avg_entry).toFixed(2)}`
      : `${p.side ?? ""} · entry ${Math.round(Number(p.avg_entry) * 100)}%`,
    value: p.market_value,
    cost: p.cost,
    pnl: p.unrealized_pnl,
    pnlPct: p.unrealized_pnl_pct,
  };
}

export default function PortfolioPage() {
  // Start on mock; swap to the live backend account once it answers.
  const [portfolio, setPortfolio] = React.useState<Portfolio>(mockPortfolio);
  const [positions, setPositions] = React.useState<Position[]>(mockPositions);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [accRes, posRes] = await Promise.all([fetch("/api/account"), fetch("/api/positions")]);
        if (!accRes.ok || !posRes.ok) return; // backend down → keep mock
        const acc = await accRes.json();
        const pos: BackendPosition[] = await posRes.json();
        if (!alive) return;
        setPortfolio({
          totalValue: acc.equity,
          dayChange: acc.pnl,
          dayChangePct: acc.pnl_pct,
          buyingPower: acc.buying_power,
          positionsCount: acc.positions_count,
          currency: acc.currency ?? "USD",
        });
        setPositions(Array.isArray(pos) ? pos.map(mapPosition) : []);
      } catch {
        /* keep mock fallback */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-8 py-6">
      <AccountHeader portfolio={portfolio} />
      <PositionsActivity positions={positions} activity={activity} />
    </div>
  );
}
