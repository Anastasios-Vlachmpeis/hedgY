import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "flat";

interface StatTileProps extends React.ComponentProps<"div"> {
  /** Short uppercase label, e.g. "Net Liquidity". */
  label: string;
  /** Primary figure. Rendered with tabular/mono numerals. */
  value: React.ReactNode;
  /** Optional secondary figure, e.g. "+2.4%" or "+$1,204". */
  delta?: React.ReactNode;
  /** Drives delta color + arrow. */
  direction?: Direction;
}

/**
 * Compact KPI tile. ALL numerals use tabular mono figures so columns of
 * stats stay vertically aligned (terminal aesthetic).
 */
function StatTile({
  label,
  value,
  delta,
  direction = "flat",
  className,
  ...props
}: StatTileProps) {
  const Arrow = direction === "down" ? ArrowDownRight : ArrowUpRight;
  return (
    <div
      data-slot="stat-tile"
      className={cn(
        "flex flex-col gap-1 rounded-md border border-border bg-surface px-3 py-2.5",
        className,
      )}
      {...props}
    >
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="nums font-mono text-xl font-semibold leading-none text-foreground">
        {value}
      </span>
      {delta != null && (
        <span
          className={cn(
            "nums inline-flex items-center gap-0.5 font-mono text-xs",
            direction === "up" && "text-up",
            direction === "down" && "text-down",
            direction === "flat" && "text-muted-foreground",
          )}
        >
          {direction !== "flat" && <Arrow className="size-3" />}
          {delta}
        </span>
      )}
    </div>
  );
}

export { StatTile };
export type { StatTileProps };
