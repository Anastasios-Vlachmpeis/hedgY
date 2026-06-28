"use client";

import * as React from "react";
import { AccountHeader } from "@/components/dashboard/account-header";
import { PositionsActivity } from "@/components/dashboard/positions-activity";
import { type Activity, type Portfolio, type Position } from "@/lib/mockData";

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

interface BackendTrade {
  id: number | string;
  kind: "stock" | "prediction";
  action: "buy" | "sell";
  symbol?: string | null;
  side?: string | null;
  qty: number;
  price: number;
  notional: number;
  label?: string | null;
  ts: number;
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

function relTime(tsSeconds: number): string {
  const diff = Date.now() / 1000 - tsSeconds;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)}d ago`;
}

function mapTrade(t: BackendTrade): Activity {
  const isStock = t.kind === "stock";
  return {
    id: String(t.id),
    kind: t.action === "sell" ? "Sold" : "Bought",
    title: isStock ? (t.symbol ?? "—") : (t.label ?? "Prediction"),
    detail: isStock
      ? `${Number(t.qty).toFixed(2)} sh @ $${Number(t.price).toFixed(2)}`
      : `${t.side ?? ""} · ${Math.round(t.qty)} @ ${Math.round(Number(t.price) * 100)}¢`,
    amount: t.action === "sell" ? t.notional : -t.notional,
    time: relTime(t.ts),
  };
}

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; portfolio: Portfolio; positions: Position[]; activity: Activity[] };

export default function PortfolioPage() {
  const [state, setState] = React.useState<State>({ status: "loading" });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [accRes, posRes, trdRes] = await Promise.all([
          fetch("/api/account"),
          fetch("/api/positions"),
          fetch("/api/trades"),
        ]);
        if (!accRes.ok || !posRes.ok) throw new Error("backend unreachable");
        const acc = await accRes.json();
        const pos: BackendPosition[] = await posRes.json();
        const trd: BackendTrade[] = trdRes.ok ? await trdRes.json() : [];
        if (!alive) return;
        setState({
          status: "ready",
          portfolio: {
            totalValue: acc.equity,
            dayChange: acc.pnl,
            dayChangePct: acc.pnl_pct,
            buyingPower: acc.buying_power,
            positionsCount: acc.positions_count,
            currency: acc.currency ?? "USD",
          },
          positions: Array.isArray(pos) ? pos.map(mapPosition) : [],
          activity: Array.isArray(trd) ? trd.map(mapTrade) : [],
        });
      } catch {
        if (alive) setState({ status: "error" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (state.status === "loading") return <PortfolioSkeleton />;
  if (state.status === "error") return <PortfolioError />;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-8 py-6">
      <AccountHeader portfolio={state.portfolio} />
      <PositionsActivity positions={state.positions} activity={state.activity} />
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-8 py-6" aria-busy="true" aria-label="Loading portfolio">
      <div className="h-28 animate-pulse rounded-2xl bg-[#f0f0f0]" />
      <div className="flex gap-4">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-[#f0f0f0]" />
        <div className="h-8 w-24 animate-pulse rounded-lg bg-[#f0f0f0]" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-[#f0f0f0]" />
        ))}
      </div>
    </div>
  );
}

function PortfolioError() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-center gap-2 px-8 py-24 text-center">
      <p className="text-[15px] font-semibold text-[#0a0a0a]">Couldn&apos;t load your portfolio</p>
      <p className="max-w-[360px] text-[13px] text-[#737373]">
        The trading backend isn&apos;t reachable. Make sure it&apos;s running on :8000, then refresh.
      </p>
    </div>
  );
}
