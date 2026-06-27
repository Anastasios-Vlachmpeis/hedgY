"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, ArrowUpRight, Layers } from "lucide-react";

import { cn } from "@/lib/utils";
import { usdCompact } from "@/lib/format";
import { TradeButton } from "@/components/trade/trade-modal";
import { yesCents, noCents, type MarketEvent, type VenueQuote } from "@/lib/mockData";

const VENUE: Record<string, { name: string; color: string }> = {
  kalshi: { name: "Kalshi", color: "#12b886" },
  polymarket: { name: "Polymarket", color: "#3b6cf6" },
};

export function venueMeta(v: string) {
  return VENUE[v.toLowerCase()] ?? { name: v.charAt(0).toUpperCase() + v.slice(1), color: "#9580ff" };
}

const cents = (p: number) => `${Math.round(p * 100)}¢`;

function VenueRow({
  m,
  bestYesVenue,
  bestNoVenue,
}: {
  m: VenueQuote;
  bestYesVenue?: string;
  bestNoVenue?: string;
}) {
  const meta = venueMeta(m.venue);
  const isBestYes = bestYesVenue?.toLowerCase() === m.venue.toLowerCase();
  const isBestNo = bestNoVenue?.toLowerCase() === m.venue.toLowerCase();
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-[#efeff2] bg-white/70 px-3.5 py-2.5">
      <span className="size-2.5 shrink-0 rounded-full" style={{ background: meta.color }} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#181925]">{meta.name}</p>
        <p className="font-num text-[11px] text-[#a3a3a3]">Vol {usdCompact(m.volume)}</p>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "rounded-[8px] px-2.5 py-1 text-center",
            isBestYes ? "bg-[#dcfce7] ring-1 ring-[#16a34a]/30" : "bg-[#f6f6f7]",
          )}
        >
          <p className="text-[9px] font-semibold uppercase tracking-wide text-[#16a34a]">Yes</p>
          <p className="font-num text-[13px] font-semibold tabular-nums text-[#181925]">{cents(m.yes)}</p>
        </div>
        <div
          className={cn(
            "rounded-[8px] px-2.5 py-1 text-center",
            isBestNo ? "bg-[#fee2e2] ring-1 ring-[#dc2626]/30" : "bg-[#f6f6f7]",
          )}
        >
          <p className="text-[9px] font-semibold uppercase tracking-wide text-[#dc2626]">No</p>
          <p className="font-num text-[13px] font-semibold tabular-nums text-[#181925]">{cents(m.no)}</p>
        </div>
      </div>

      {m.link ? (
        <a
          href={m.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open on ${meta.name}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#a3a3a3] transition-colors hover:bg-[#f0f0f0] hover:text-[#181925]"
        >
          <ArrowUpRight className="size-4" />
        </a>
      ) : (
        <span className="size-7 shrink-0" />
      )}
    </div>
  );
}

function DetailBody({ event, onClose }: { event: MarketEvent; onClose: () => void }) {
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const members = event.members ?? [];
  const yes = event.yesProbability ?? 0;
  const no = event.noProbability ?? 1 - yes;

  // cross-venue edge: spread between the best and worst YES across venues
  const yesPrices = members.map((m) => m.yes).filter((v) => v > 0);
  const edge = yesPrices.length > 1 ? (Math.max(...yesPrices) - Math.min(...yesPrices)) * 100 : 0;

  const overlay = (
    <div
      className="scrim-in fixed inset-0 z-[100] flex items-end justify-center bg-[#14151f]/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-in glass-strong w-full max-w-lg rounded-t-[24px] p-6 sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[#f3f1ff] text-[20px] ring-1 ring-inset ring-[#dad9fc]/60">
            {event.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9580ff]">
                {event.category}
              </span>
              {event.live && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#dc2626]">
                  <span className="live-dot size-1.5 rounded-full bg-[#dc2626]" /> Live
                </span>
              )}
            </div>
            <h2 className="mt-1 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-[#181925]">
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/60 text-[#737373] transition-colors hover:bg-white hover:text-[#181925]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* implied probability */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">Implied YES</p>
            <p className="font-num text-[30px] font-semibold leading-none tabular-nums text-[#181925]">
              {yesCents(yes)}%
            </p>
          </div>
          {edge > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-[#f3f1ff] px-3 py-1.5">
              <Layers className="size-3.5 text-[#9580ff]" />
              <span className="font-num text-[12px] font-semibold text-[#7c3aed]">
                {edge.toFixed(1)}¢ edge
              </span>
            </div>
          )}
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#ececef]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#9580ff] to-[#7c3aed]"
            style={{ width: `${Math.min(100, Math.max(0, yes * 100)).toFixed(1)}%` }}
          />
        </div>

        {/* cross-venue table */}
        <p className="mt-5 mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#737373]">
          Cross-venue pricing
          <span className="font-num font-medium text-[#a3a3a3]">· {members.length} venue{members.length === 1 ? "" : "s"}</span>
        </p>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <VenueRow
              key={m.venue}
              m={m}
              bestYesVenue={event.bestYesVenue}
              bestNoVenue={event.bestNoVenue}
            />
          ))}
        </div>

        {/* trade */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <TradeButton
            kind="prediction"
            tone="yes"
            className="w-full py-2.5 text-[13px]"
            label={event.title}
            marketId={event.id}
            side="YES"
            price={yes}
          >
            Buy Yes <span className="font-num tabular-nums opacity-80">{yesCents(yes)}¢</span>
          </TradeButton>
          <TradeButton
            kind="prediction"
            tone="no"
            className="w-full py-2.5 text-[13px]"
            label={event.title}
            marketId={event.id}
            side="NO"
            price={no}
          >
            Buy No <span className="font-num tabular-nums opacity-80">{noCents(yes)}¢</span>
          </TradeButton>
        </div>
        <p className="mt-3 text-center text-[11px] text-[#a3a3a3]">
          Fills at the best available price across venues.
        </p>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
}

export function MarketDetailModal({
  event,
  onClose,
}: {
  event: MarketEvent | null;
  onClose: () => void;
}) {
  if (!event) return null;
  return <DetailBody event={event} onClose={onClose} />;
}
