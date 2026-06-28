import { useNavigate } from "react-router-dom";
import type { AssetKind } from "../lib/api/types";
import { formatCents, formatMoney } from "../lib/format";
import { PriceText } from "./PriceText";
import { Sparkline } from "./Sparkline";
import { Tag } from "./Tag";

export function AssetRow({
  kind,
  id,
  label,
  price,
  changePct,
  qty,
  side,
  spark,
  subtitle,
}: {
  kind: AssetKind;
  id: string;
  label: string;
  price: number;
  changePct?: number;
  qty?: number;
  side?: "YES" | "NO";
  spark?: number[];
  subtitle?: string;
}) {
  const navigate = useNavigate();
  const value = qty ? qty * price : undefined;

  return (
    <button
      type="button"
      onClick={() => navigate(`/asset/${kind}/${id}`)}
      className="flex w-full items-center gap-3 border-b border-border py-4 text-left transition-colors hover:bg-surface/50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{label}</span>
          {kind === "market" && side && (
            <Tag variant={side === "YES" ? "yes" : "no"}>{side}</Tag>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-text-dim">{subtitle}</p>
        )}
        {qty !== undefined && qty > 0 && (
          <p className="mt-0.5 text-xs text-text-dim">
            {qty} {kind === "stock" ? "shares" : "contracts"}
          </p>
        )}
      </div>
      {spark && spark.length > 0 && (
        <Sparkline data={spark} positive={changePct !== undefined ? changePct >= 0 : undefined} />
      )}
      <div className="text-right">
        {kind === "market" && !qty ? (
          <span className="font-medium tabular-nums">{formatCents(price)}</span>
        ) : value !== undefined ? (
          <span className="font-medium tabular-nums">{formatMoney(value)}</span>
        ) : (
          <span className="font-medium tabular-nums">{formatMoney(price)}</span>
        )}
        {changePct !== undefined && (
          <div className="mt-0.5">
            <PriceText changePct={changePct} size="sm" />
          </div>
        )}
      </div>
    </button>
  );
}

export function AssetRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 border-b border-border py-4">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-surface-2" />
        <div className="h-3 w-20 rounded bg-surface-2" />
      </div>
      <div className="h-7 w-16 rounded bg-surface-2" />
      <div className="space-y-2 text-right">
        <div className="ml-auto h-4 w-16 rounded bg-surface-2" />
        <div className="ml-auto h-3 w-12 rounded bg-surface-2" />
      </div>
    </div>
  );
}
