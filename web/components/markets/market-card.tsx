import * as React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { points, usdCompact } from "@/lib/format";
import { ActionButton } from "@/components/ui/action-button";
import { TradeButton } from "@/components/trade/trade-modal";
import { yesCents, noCents, type MarketEvent, type MarketOutcomeRow } from "@/lib/mockData";

function CardHeader({ event, trailing }: { event: MarketEvent; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#f5f5f5] text-[18px]">
        {event.icon}
      </span>
      <h3 className="line-clamp-2 flex-1 text-[14px] font-semibold leading-snug text-[#181925]">
        {event.title}
      </h3>
      <div className="flex shrink-0 items-center gap-2">
        {event.live ? (
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[#dc2626]" />
            <span className="text-[10px] font-semibold text-[#dc2626]">LIVE</span>
          </span>
        ) : null}
        {trailing}
      </div>
    </div>
  );
}

function CardFooter({ event }: { event: MarketEvent }) {
  const up = event.direction !== "down";
  return (
    <div className="mt-3 flex items-center justify-between border-t border-[#f0f0f0] pt-2 text-[11px]">
      <span className="truncate text-[#a3a3a3]">
        {event.category} · Vol {usdCompact(event.volume)}
        {event.cadence ? ` · ${event.cadence}` : ""}
      </span>
      <span
        className={cn(
          "shrink-0 font-medium tabular-nums",
          up ? "text-[#16a34a]" : "text-[#dc2626]",
        )}
      >
        {points(event.changePts)} 24h
      </span>
    </div>
  );
}

function OutcomeRow({ outcome, threshold }: { outcome: MarketOutcomeRow; threshold?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-2">
      {threshold ? (
        outcome.dir === "up" ? (
          <ArrowUp className="size-3.5 shrink-0 text-[#16a34a]" />
        ) : (
          <ArrowDown className="size-3.5 shrink-0 text-[#dc2626]" />
        )
      ) : null}
      <span className="min-w-0 flex-1 truncate text-[13px] text-[#181925]">
        {outcome.label}
      </span>
      <span className="shrink-0 text-[14px] font-semibold tabular-nums text-[#181925]">
        {Math.round(outcome.yes * 100)}%
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <ActionButton tone="yes" className="px-2.5">
          Yes
        </ActionButton>
        <ActionButton tone="no" className="px-2.5">
          No
        </ActionButton>
      </div>
    </div>
  );
}

function MarketCard({ event }: { event: MarketEvent }) {
  const cardClass =
    "cursor-pointer rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]";

  if (event.kind === "binary") {
    const p = event.yesProbability!;
    return (
      <div className={cardClass}>
        <CardHeader
          event={event}
          trailing={
            <span className="text-[17px] font-semibold leading-none tabular-nums text-[#181925]">
              {yesCents(p)}%
            </span>
          }
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <TradeButton
            kind="prediction"
            tone="yes"
            className="w-full"
            label={event.title}
            marketId={event.id}
            side="YES"
            price={p}
          >
            Yes <span className="tabular-nums opacity-80">{yesCents(p)}¢</span>
          </TradeButton>
          <TradeButton
            kind="prediction"
            tone="no"
            className="w-full"
            label={event.title}
            marketId={event.id}
            side="NO"
            price={1 - p}
          >
            No <span className="tabular-nums opacity-80">{noCents(p)}¢</span>
          </TradeButton>
        </div>
        <CardFooter event={event} />
      </div>
    );
  }

  const threshold = event.kind === "threshold";
  const outcomes = event.outcomes ?? [];
  const shown = outcomes.slice(0, 4);
  const extra = outcomes.length - shown.length;

  return (
    <div className={cardClass}>
      <CardHeader event={event} />
      <div className="mt-3 divide-y divide-[#f0f0f0]">
        {shown.map((o) => (
          <OutcomeRow key={o.label} outcome={o} threshold={threshold} />
        ))}
        {extra > 0 ? (
          <div className="py-2 text-[12px] text-[#a3a3a3]">+{extra} more</div>
        ) : null}
      </div>
      <CardFooter event={event} />
    </div>
  );
}

export { MarketCard };
