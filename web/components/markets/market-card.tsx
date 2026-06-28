"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { points, usdCompact } from "@/lib/format";
import { ActionButton } from "@/components/ui/action-button";
import { TradeButton } from "@/components/trade/trade-modal";
import { MarketDetailModal, venueMeta } from "@/components/markets/market-detail-modal";
import { yesCents, noCents, type MarketEvent, type MarketOutcomeRow } from "@/lib/mockData";

function LiveBadge() {
  return (
    <span className="flex items-center gap-1">
      <span className="live-dot size-1.5 rounded-full bg-[#dc2626]" />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#dc2626]">Live</span>
    </span>
  );
}

function CardHeader({ event, trailing }: { event: MarketEvent; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-[#f3f1ff] text-[18px] ring-1 ring-inset ring-[#dad9fc]/50">
        {event.icon}
      </span>
      <h3 className="line-clamp-2 flex-1 text-[14px] font-semibold leading-snug text-[#181925]">
        {event.title}
      </h3>
      <div className="flex shrink-0 items-center gap-2">
        {event.live ? <LiveBadge /> : null}
        {trailing}
      </div>
    </div>
  );
}

/** Implied-probability bar — violet = the YES share of the market. */
function ProbBar({ p }: { p: number }) {
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#9580ff] to-[#7c3aed]"
        style={{ width: `${Math.min(100, Math.max(0, p * 100)).toFixed(1)}%` }}
      />
    </div>
  );
}

/** Cross-venue affordance: stacked venue dots + a "Compare" cue. */
function VenueCompare({ event }: { event: MarketEvent }) {
  const members = event.members ?? [];
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#9580ff]">
      <span className="flex -space-x-1">
        {members.slice(0, 3).map((m) => (
          <span
            key={m.venue}
            className="size-2.5 rounded-full ring-2 ring-white"
            style={{ background: venueMeta(m.venue).color }}
          />
        ))}
      </span>
      Compare
      <ChevronRight className="size-3.5" strokeWidth={2.25} />
    </span>
  );
}

function CardFooter({ event, crossVenue }: { event: MarketEvent; crossVenue: boolean }) {
  const up = event.direction !== "down";
  const flat = event.direction === "flat" || event.changePts === 0;
  return (
    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#f0f0f0] pt-2.5 text-[11px]">
      <span className="truncate text-[#a3a3a3]">
        {event.category} · Vol <span className="font-num text-[#737373]">{usdCompact(event.volume)}</span>
      </span>
      {crossVenue ? (
        <VenueCompare event={event} />
      ) : !flat ? (
        <span
          className={cn(
            "font-num shrink-0 font-medium tabular-nums",
            up ? "text-[#16a34a]" : "text-[#dc2626]",
          )}
        >
          {points(event.changePts)} 24h
        </span>
      ) : null}
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
      <span className="min-w-0 flex-1 truncate text-[13px] text-[#181925]">{outcome.label}</span>
      <span className="font-num shrink-0 text-[14px] font-semibold tabular-nums text-[#181925]">
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

function MarketCard({ event, index = 0 }: { event: MarketEvent; index?: number }) {
  const [detail, setDetail] = React.useState(false);
  const crossVenue = (event.members?.length ?? 0) > 1;

  const cardClass =
    "group rounded-[16px] border border-[#ececec] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#dad9fc] hover:shadow-[0_14px_34px_-16px_rgba(149,128,255,0.35)]";
  const style = { animationDelay: `${Math.min(index, 8) * 45}ms` } as React.CSSProperties;

  if (event.kind === "binary") {
    const p = event.yesProbability!;
    return (
      <>
        <div
          className={cn(cardClass, "card-in cursor-pointer")}
          style={style}
          onClick={() => setDetail(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setDetail(true);
            }
          }}
        >
          <CardHeader
            event={event}
            trailing={
              <div className="flex flex-col items-end leading-none">
                <span className="font-num text-[18px] font-semibold tabular-nums text-[#181925]">
                  {yesCents(p)}%
                </span>
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#a3a3a3]">
                  Yes
                </span>
              </div>
            }
          />
          <ProbBar p={p} />
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
              Yes <span className="font-num tabular-nums opacity-80">{yesCents(p)}¢</span>
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
              No <span className="font-num tabular-nums opacity-80">{noCents(p)}¢</span>
            </TradeButton>
          </div>
          <CardFooter event={event} crossVenue={crossVenue} />
        </div>
        <MarketDetailModal event={detail ? event : null} onClose={() => setDetail(false)} />
      </>
    );
  }

  const threshold = event.kind === "threshold";
  const outcomes = event.outcomes ?? [];
  const shown = outcomes.slice(0, 4);
  const extra = outcomes.length - shown.length;

  return (
    <div className={cn(cardClass, "card-in")} style={style}>
      <CardHeader event={event} />
      <div className="mt-3 divide-y divide-[#f0f0f0]">
        {shown.map((o) => (
          <OutcomeRow key={o.label} outcome={o} threshold={threshold} />
        ))}
        {extra > 0 ? (
          <div className="py-2 text-[12px] text-[#a3a3a3]">+{extra} more</div>
        ) : null}
      </div>
      <CardFooter event={event} crossVenue={false} />
    </div>
  );
}

export { MarketCard };
