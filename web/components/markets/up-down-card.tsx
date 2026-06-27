import { Bookmark } from "lucide-react";

import { TradeButton } from "@/components/trade/trade-modal";
import { yesCents, noCents, type MarketEvent } from "@/lib/mockData";

/** Small semicircular gauge showing the YES probability. */
function Gauge({ pct }: { pct: number }) {
  const r = 26;
  const c = Math.PI * r; // semicircle arc length
  const filled = (pct / 100) * c;
  return (
    <div className="relative flex h-[42px] w-[58px] items-end justify-center">
      <svg viewBox="0 0 64 36" className="h-full w-full">
        <path
          d="M6 32 A26 26 0 0 1 58 32"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <path
          d="M6 32 A26 26 0 0 1 58 32"
          fill="none"
          stroke="#9bb37e"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="text-[14px] font-semibold tabular-nums text-[#f3ecdd]">
          {pct}%
        </span>
        <span className="eyebrow block text-[8px] text-[#9bb37e]">Up</span>
      </div>
    </div>
  );
}

/**
 * "Up or Down" prediction card. Up = buy YES, Down = buy NO — both open the
 * shared trade modal which posts to /api/orders, so the real prediction-market
 * trading flow is preserved. Payout chips are illustrative.
 */
function UpDownCard({ event }: { event: MarketEvent }) {
  const p = event.yesProbability ?? 0.5;
  const upPayout = (1 / p - 1).toFixed(2);
  const downPayout = (1 / (1 - p) - 1).toFixed(2);

  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.04]">
      <div className="flex items-start gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#c9aa6c]/10 text-[18px]">
          {event.icon}
        </span>
        <h3 className="line-clamp-2 flex-1 text-[13px] font-semibold leading-snug text-[#f3ecdd]">
          {event.title}
        </h3>
        <Gauge pct={yesCents(p)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <TradeButton
          kind="prediction"
          tone="yes"
          className="w-full justify-between py-2.5"
          label={event.title}
          marketId={event.id}
          side="YES"
          price={p}
        >
          <span>Up</span>
          <span className="tabular-nums opacity-80">+${upPayout}</span>
        </TradeButton>
        <TradeButton
          kind="prediction"
          tone="no"
          className="w-full justify-between py-2.5"
          label={event.title}
          marketId={event.id}
          side="NO"
          price={1 - p}
        >
          <span>Down</span>
          <span className="tabular-nums opacity-80">+${downPayout}</span>
        </TradeButton>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[11px]">
        <span className="eyebrow flex items-center gap-1.5 text-[10px] text-[#cf8a6e]">
          <span className="size-1.5 animate-pulse rounded-full bg-[#cf8a6e]" />
          Live
          <span className="ml-1 font-normal normal-case tracking-normal text-[#6b624f]">
            · {event.category}
          </span>
        </span>
        <Bookmark className="size-3.5 text-[#2a241b]" />
      </div>
    </div>
  );
}

export { UpDownCard };
