"use client";

import * as React from "react";
import { AccountHeader, type EquityPoint } from "@/components/dashboard/account-header";
import { PositionsActivity } from "@/components/dashboard/positions-activity";
import { ClosePositionModal } from "@/components/dashboard/close-position-modal";
import { type Activity, type PlatformBreakdown, type Portfolio, type Position } from "@/lib/mockData";

// Real value/P&L breakdown grouped by position type, plus remaining cash.
function buildBreakdown(positions: Position[], cash: number): PlatformBreakdown[] {
  const groups: { key: Position["type"]; platform: string; kind: string; color: string }[] = [
    { key: "Combined", platform: "Combined hedges", kind: "Equity + prediction", color: "#9580ff" },
    { key: "Equity", platform: "Equities", kind: "Stocks · Alpaca", color: "#4F8DFF" },
    { key: "Prediction", platform: "Prediction markets", kind: "Kalshi · Polymarket", color: "#16a34a" },
  ];
  const rows = groups
    .map((g) => {
      const items = positions.filter((p) => p.type === g.key);
      const value = items.reduce((s, p) => s + p.value, 0);
      const cost = items.reduce((s, p) => s + p.cost, 0);
      const pnl = items.reduce((s, p) => s + p.pnl, 0);
      return {
        platform: g.platform,
        kind: g.kind,
        value,
        pnl,
        pnlPct: cost > 0 ? (pnl / cost) * 100 : 0,
        color: g.color,
      };
    })
    .filter((g) => g.value !== 0 || g.pnl !== 0);

  if (cash > 0) {
    rows.push({
      platform: "Cash",
      kind: "Available balance",
      value: cash,
      pnl: 0,
      pnlPct: 0,
      color: "#a3a3a3",
    });
  }

  return rows;
}

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
  group_id?: string | null;
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

function mapSingle(p: BackendPosition): Position {
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

// Legs sharing a group_id are a combo (equity + hedge) — render them as one
// "Combined" product. Everything without a group maps 1:1.
function mapPositions(rows: BackendPosition[]): Position[] {
  const groups = new Map<string, BackendPosition[]>();
  const singles: BackendPosition[] = [];
  for (const p of rows) {
    if (p.group_id) {
      const arr = groups.get(p.group_id);
      if (arr) arr.push(p);
      else groups.set(p.group_id, [p]);
    } else {
      singles.push(p);
    }
  }

  const out: Position[] = [];
  for (const [gid, legs] of groups) {
    const stock = legs.find((l) => l.kind === "stock");
    const pred = legs.find((l) => l.kind === "prediction");
    if (stock && pred) {
      const value = legs.reduce((s, l) => s + l.market_value, 0);
      const cost = legs.reduce((s, l) => s + l.cost, 0);
      const pnl = legs.reduce((s, l) => s + l.unrealized_pnl, 0);
      const hedgeLabel = pred.label ?? `${pred.side ?? ""} prediction`;
      out.push({
        id: `grp-${gid}`,
        title: `${stock.symbol} combo`,
        type: "Combined",
        detail: `${stock.symbol} + ${hedgeLabel}`,
        value,
        cost,
        pnl,
        pnlPct: cost > 0 ? (pnl / cost) * 100 : 0,
        equityLeg: { label: stock.symbol ?? "Equity", value: stock.market_value },
        hedgeLeg: { label: hedgeLabel, value: pred.market_value },
      });
    } else {
      // Degenerate group (one leg sold off) — render the survivors singly.
      legs.forEach((l) => out.push(mapSingle(l)));
    }
  }
  singles.forEach((p) => out.push(mapSingle(p)));
  return out;
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
  | { status: "ready"; portfolio: Portfolio; positions: Position[]; activity: Activity[]; series: EquityPoint[] };

async function loadPortfolio(): Promise<Extract<State, { status: "ready" }>> {
  const [accRes, posRes, trdRes, histRes] = await Promise.all([
    fetch("/api/account"),
    fetch("/api/positions"),
    fetch("/api/trades"),
    fetch("/api/account/history"),
  ]);
  if (!accRes.ok || !posRes.ok) throw new Error("backend unreachable");
  const acc = await accRes.json();
  const pos: BackendPosition[] = await posRes.json();
  const trd: BackendTrade[] = trdRes.ok ? await trdRes.json() : [];
  const hist: { t: number; value: number }[] = histRes.ok ? await histRes.json() : [];
  return {
    status: "ready",
    portfolio: {
      totalValue: acc.equity,
      dayChange: acc.pnl,
      dayChangePct: acc.pnl_pct,
      buyingPower: acc.buying_power,
      cash: acc.cash ?? 0,
      positionsCount: acc.positions_count,
      currency: acc.currency ?? "USD",
    },
    positions: Array.isArray(pos) ? mapPositions(pos) : [],
    activity: Array.isArray(trd) ? trd.map(mapTrade) : [],
    series: Array.isArray(hist) ? hist.map((h) => ({ value: h.value })) : [],
  };
}

export default function PortfolioPage() {
  const [state, setState] = React.useState<State>({ status: "loading" });
  // Confirmation-modal flow for closing a position.
  const [pendingClose, setPendingClose] = React.useState<Position | null>(null);
  const [closeLoading, setCloseLoading] = React.useState(false);
  const [closeDone, setCloseDone] = React.useState(false);
  const [closeError, setCloseError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setState(await loadPortfolio());
    } catch {
      setState({ status: "error" });
    }
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const next = await loadPortfolio();
        if (alive) setState(next);
      } catch {
        if (alive) setState({ status: "error" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Keep values live: re-mark positions every 10s (crypto ticks 24/7; equities
  // refresh while the market is open). Skip while a close is mid-flight so the
  // confirmation modal's own refresh isn't clobbered.
  React.useEffect(() => {
    const id = setInterval(() => {
      if (!closeLoading) void refresh();
    }, 10_000);
    return () => clearInterval(id);
  }, [refresh, closeLoading]);

  const requestClose = React.useCallback((p: Position) => {
    setCloseError(null);
    setCloseDone(false);
    setPendingClose(p);
  }, []);

  const cancelClose = React.useCallback(() => {
    setPendingClose(null);
    setCloseError(null);
    setCloseDone(false);
  }, []);

  // A combined card has id `grp-<gid>`; singles carry the numeric ledger id.
  const confirmClose = React.useCallback(async () => {
    const p = pendingClose;
    if (!p) return;
    const body = p.id.startsWith("grp-")
      ? { group_id: p.id.slice(4) }
      : { id: Number(p.id) };
    setCloseLoading(true);
    setCloseError(null);
    try {
      const res = await fetch("/api/positions/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCloseError(
          typeof data?.detail === "string" ? data.detail : "Couldn't close this position.",
        );
        return;
      }
      setCloseDone(true);
      window.dispatchEvent(new Event("verso:account-updated"));
      await refresh();
      setTimeout(() => {
        setPendingClose(null);
        setCloseDone(false);
      }, 750);
    } catch {
      setCloseError("Network error — is the trading backend running on :8000?");
    } finally {
      setCloseLoading(false);
    }
  }, [pendingClose, refresh]);

  if (state.status === "loading") return <PortfolioSkeleton />;
  if (state.status === "error") return <PortfolioError />;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-8 py-6">
      <AccountHeader
        portfolio={state.portfolio}
        series={state.series}
        breakdown={buildBreakdown(state.positions, state.portfolio.cash)}
      />
      <PositionsActivity
        positions={state.positions}
        activity={state.activity}
        onClose={requestClose}
        closingId={closeLoading && pendingClose ? pendingClose.id : null}
      />
      <ClosePositionModal
        position={pendingClose}
        loading={closeLoading}
        done={closeDone}
        error={closeError}
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
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
