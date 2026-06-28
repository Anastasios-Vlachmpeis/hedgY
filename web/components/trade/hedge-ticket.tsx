"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type VenueQuote,
  QUICK,
  toProb,
  Segmented,
  LabeledInput,
} from "@/components/trade/order-ticket";

export type HedgeTicketData = {
  marketId: string;
  question: string;
  /** best implied YES probability (0..1 or cents) */
  yes: number;
  venues?: VenueQuote[];
  defaultSide?: "YES" | "NO";
  /** pre-fill the equity ticker being protected */
  equitySymbol?: string;
};

/**
 * "Apply hedge" modal. You first pick the prediction-market outcome that hedges
 * your view, then the equity leg you're protecting. Both fire together as ONE
 * combined position (shared group_id in the ledger).
 */
export function HedgeTicket({
  ticket,
  onClose,
  onPlaced,
}: {
  ticket: HedgeTicketData | null;
  onClose: () => void;
  onPlaced?: () => void;
}) {
  if (!ticket) return null;
  return <Body key={ticket.marketId} ticket={ticket} onClose={onClose} onPlaced={onPlaced} />;
}

function Body({ ticket, onClose, onPlaced }: { ticket: HedgeTicketData; onClose: () => void; onPlaced?: () => void }) {
  const router = useRouter();
  const venues: VenueQuote[] =
    ticket.venues && ticket.venues.length
      ? ticket.venues
      : [{ venue: "market", yes: toProb(ticket.yes), no: 1 - toProb(ticket.yes) }];
  const multiVenue = venues.length > 1;

  const [venue, setVenue] = React.useState<string>(venues[0]?.venue ?? "market");
  // null until the user explicitly picks an outcome — the prompt requires
  // selecting an outcome before the hedge can be applied.
  const [side, setSide] = React.useState<"YES" | "NO" | null>(ticket.defaultSide ?? null);
  const [hedgeAmount, setHedgeAmount] = React.useState(500);

  const [equitySymbol, setEquitySymbol] = React.useState(ticket.equitySymbol ?? "SPY");
  const [equityAmount, setEquityAmount] = React.useState(1000);

  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const ready = side !== null && equitySymbol.trim().length > 0 && hedgeAmount > 0 && equityAmount > 0;

  async function submit() {
    if (!side) return setError("Pick the outcome to hedge first");
    if (!equitySymbol.trim()) return setError("Enter the equity ticker to hedge");
    setLoading(true);
    setError(null);
    const body = {
      equity: {
        symbol: equitySymbol.trim().toUpperCase(),
        notionalUsd: equityAmount,
        action: "buy",
        order_type: "market",
      },
      hedge: {
        market_id: ticket.marketId,
        side,
        notionalUsd: hedgeAmount,
        venue: multiVenue ? venue : undefined,
      },
    };
    try {
      const res = await fetch("/api/orders/combined", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.detail === "string" ? data.detail : "Hedge failed");
        return;
      }
      setDone(true);
      onPlaced?.();
      window.dispatchEvent(new Event("verso:account-updated"));
      router.refresh();
      setTimeout(onClose, 850);
    } catch {
      setError("Network error — is the backend running on :8000?");
    } finally {
      setLoading(false);
    }
  }

  const overlay = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[420px] rounded-[18px] bg-white p-5 shadow-[0_12px_48px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          Apply hedge · combined position
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[16px] font-semibold leading-snug text-[#0a0a0a]">
          {ticket.question}
        </h3>

        {/* Step 1 — the hedge (prediction) leg */}
        <p className="mt-4 text-[12px] font-semibold text-[#0a0a0a]">1 · Outcome to hedge with</p>
        {multiVenue && (
          <Segmented
            value={venue}
            onChange={setVenue}
            options={venues.map((vq) => [vq.venue, vq.venue[0].toUpperCase() + vq.venue.slice(1)] as [string, string])}
            className="mt-2"
          />
        )}
        <div className={cn("grid grid-cols-2 gap-2", multiVenue ? "mt-2" : "mt-2")}>
          {(["YES", "NO"] as const).map((s) => {
            const vq = venues.find((v) => v.venue === venue) ?? venues[0];
            const cents = Math.round(toProb(s === "YES" ? vq?.yes ?? 0.5 : vq?.no ?? 0.5) * 100);
            const on = side === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={cn(
                  "rounded-[12px] border py-3 text-center transition-colors",
                  on
                    ? s === "YES"
                      ? "border-[#16a34a] bg-[#16a34a]/10"
                      : "border-[#dc2626] bg-[#dc2626]/10"
                    : "border-[#ececec] bg-white hover:bg-[#fafafa]",
                )}
              >
                <div className={cn("text-[13px] font-bold", s === "YES" ? "text-[#16a34a]" : "text-[#dc2626]")}>{s}</div>
                <div className="mt-0.5 text-[12px] font-semibold text-[#0a0a0a]">{cents}¢</div>
              </button>
            );
          })}
        </div>
        <LabeledInput label="Hedge size (USD)" prefix="$" value={hedgeAmount} onChange={setHedgeAmount} step={50} />
        <div className="mt-2 flex gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setHedgeAmount(q)}
              className={cn(
                "flex-1 rounded-full py-1.5 text-[12px] font-medium transition-colors",
                hedgeAmount === q ? "bg-[#050505] text-white" : "bg-[#f5f5f5] text-[#666] hover:bg-[#ececec]",
              )}
            >
              ${q >= 1000 ? `${q / 1000}k` : q}
            </button>
          ))}
        </div>

        {/* Step 2 — the equity leg being protected */}
        <p className="mt-5 text-[12px] font-semibold text-[#0a0a0a]">2 · Equity you&apos;re protecting</p>
        <label className="mt-2 block text-[12px] font-medium text-[#666]">Ticker</label>
        <div className="mt-1 flex items-center rounded-[10px] border border-[#e8e8e8] px-3 focus-within:border-[#0a0a0a]">
          <input
            type="text"
            value={equitySymbol}
            onChange={(e) => setEquitySymbol(e.target.value)}
            placeholder="e.g. SPY"
            className="w-full bg-transparent px-1 py-2.5 text-[16px] font-semibold uppercase tracking-wide text-[#0a0a0a] outline-none"
          />
        </div>
        <LabeledInput label="Equity size (USD)" prefix="$" value={equityAmount} onChange={setEquityAmount} step={50} />

        <p className="mt-4 flex items-center gap-1.5 rounded-[8px] bg-[#fafafa] px-3 py-2 text-[12px] text-[#666]">
          <span className="font-semibold tabular-nums text-[#0a0a0a]">${equityAmount.toLocaleString()}</span>{" "}
          {equitySymbol.trim().toUpperCase() || "—"}
          <Plus className="size-3 text-[#a3a3a3]" />
          <span className="font-semibold tabular-nums text-[#0a0a0a]">${hedgeAmount.toLocaleString()}</span>{" "}
          {side ?? "—"} — one position
        </p>

        {error && (
          <p className="mt-3 rounded-[8px] bg-[#fee2e2] px-3 py-2 text-[12px] font-medium text-[#dc2626]">{error}</p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-[#f5f5f5] py-2.5 text-[14px] font-medium text-[#0a0a0a] hover:bg-[#ececec]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading || done || !ready}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#050505] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#222] disabled:opacity-50"
          >
            {done ? (
              <>
                <Check className="size-4" /> Placed
              </>
            ) : loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Placing…
              </>
            ) : (
              "Apply hedge"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
}
