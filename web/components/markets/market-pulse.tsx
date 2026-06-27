import * as React from "react";

import { usdCompact, pct } from "@/lib/format";
import { yesCents, type MarketEvent, type Stock } from "@/lib/mockData";

/**
 * Signature hero for the markets terminal: the two markets this product fuses,
 * shown alive and in motion. Equities stream left-to-right in graphite above the
 * thesis; prediction-market odds stream the other way in violet below it — the
 * headline sits in the seam where the two worlds meet. Pure CSS marquees (no
 * client JS), real data, reduced-motion safe.
 */

const DARK_UP = "#3fb950";
const DARK_DOWN = "#f85149";

function StockTick({ s }: { s: Stock }) {
  const down = s.direction === "down";
  return (
    <span className="flex shrink-0 items-center gap-2 border-r border-white/10 px-5">
      <span className="text-[12px] font-semibold tracking-wide text-white/90">{s.symbol}</span>
      <span className="font-num text-[12px] text-white/55">${s.price.toFixed(2)}</span>
      <span
        className="font-num text-[11px] font-medium"
        style={{ color: down ? DARK_DOWN : DARK_UP }}
      >
        {pct(s.changePct)}
      </span>
    </span>
  );
}

function MarketTick({ e }: { e: MarketEvent }) {
  const yes = e.yesProbability != null ? yesCents(e.yesProbability) : null;
  const q = e.title.length > 38 ? `${e.title.slice(0, 37)}…` : e.title;
  return (
    <span className="flex shrink-0 items-center gap-2.5 border-r border-white/10 px-5">
      <span className="size-1.5 rounded-full bg-[#b3a6ff]" aria-hidden />
      <span className="text-[12px] text-white/75">{q}</span>
      {yes != null && (
        <span className="font-num text-[12px] font-semibold text-[#cabfff]">{yes}¢</span>
      )}
    </span>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-white/40">{label}</span>
      <span className="font-num text-[12.5px] font-semibold" style={{ color: accent ?? "#ffffff" }}>
        {value}
      </span>
    </div>
  );
}

function MarketPulse({
  stocks,
  events,
  marketCount,
}: {
  stocks: Stock[];
  events: MarketEvent[];
  marketCount: number;
}) {
  const liveCount = events.filter((e) => e.live).length;
  const totalVol = events.reduce((sum, e) => sum + (e.volume ?? 0), 0);
  const topMover = stocks.reduce<Stock | null>(
    (best, s) => (!best || Math.abs(s.changePct) > Math.abs(best.changePct) ? s : best),
    null,
  );

  // duplicate each track so the marquee loops seamlessly
  const stockTrack = [...stocks, ...stocks];
  const marketTrack = [...events, ...events];

  return (
    <section className="market-hero rounded-[22px] shadow-[0_24px_60px_-28px_rgba(20,21,31,0.55)]">
      {/* top tape — EQUITIES, drifting right→left */}
      <div className="relative flex items-center border-b border-white/[0.07] py-2.5">
        <div className="tape-mask min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee-slow">
            {stockTrack.map((s, i) => (
              <StockTick key={`${s.symbol}-${i}`} s={s} />
            ))}
          </div>
        </div>
        <span
          className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-5 pr-12 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45"
          style={{ background: "linear-gradient(90deg,#15161f 74%,rgba(21,22,31,0))" }}
        >
          Equities
        </span>
      </div>

      {/* thesis */}
      <div className="relative px-6 py-8 text-center sm:py-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#b3a6ff]">
          The cross-venue terminal
        </p>
        <h1 className="mx-auto mt-3 max-w-[18ch] text-[clamp(2rem,1.1rem+3.4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
          Two markets.<br className="hidden sm:block" /> One position.
        </h1>
        <p className="mx-auto mt-4 max-w-[46ch] text-[14px] leading-relaxed text-white/55">
          Equities and event markets, priced live across Kalshi, Polymarket and
          Alpaca — take either side in a click.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5">
            <span className="live-dot size-1.5 rounded-full bg-[#3fb950]" aria-hidden />
            <span className="font-num text-[12.5px] font-semibold text-white">{liveCount}</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-white/40">live</span>
          </div>
          <StatChip label="Markets" value={String(marketCount)} />
          <StatChip label="24h vol" value={usdCompact(totalVol)} />
          {topMover && (
            <StatChip
              label={topMover.symbol}
              value={pct(topMover.changePct)}
              accent={topMover.direction === "down" ? DARK_DOWN : DARK_UP}
            />
          )}
        </div>
      </div>

      {/* bottom tape — PREDICTION MARKETS, drifting left→right */}
      <div className="relative flex items-center border-t border-white/[0.07] py-2.5">
        <div className="tape-mask min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee-rev">
            {marketTrack.map((e, i) => (
              <MarketTick key={`${e.id}-${i}`} e={e} />
            ))}
          </div>
        </div>
        <span
          className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-5 pr-12 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#cabfff]"
          style={{ background: "linear-gradient(90deg,#15161f 74%,rgba(21,22,31,0))" }}
        >
          Predictions
        </span>
      </div>
    </section>
  );
}

export { MarketPulse };
