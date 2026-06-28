"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ActionButton } from "@/components/ui/action-button";

export type VenueQuote = { venue: string; yes: number; no: number };

export type OrderTicketData =
  | { kind: "stock"; symbol: string; price: number }
  | {
      kind: "prediction";
      marketId: string;
      question: string;
      /** best implied YES probability (0..1 or cents) — used when venues are absent */
      yes: number;
      /** per-venue quotes; when present with 2+ entries a venue picker is shown */
      venues?: VenueQuote[];
      defaultSide?: "YES" | "NO";
      sizeUsd?: number;
    };

export const QUICK = [250, 500, 1000, 2500];

/** Normalize a displayed odds value to a 0..1 probability (accepts cents 0..100). */
export const toProb = (p: number) => (p > 1 ? p / 100 : p);

/** Effective per-venue quotes for a prediction ticket — synthesizes a single
 * "best price" quote from `yes` when no venue breakdown is available. */
export function predictionVenues(
  ticket: Extract<OrderTicketData, { kind: "prediction" }>,
): VenueQuote[] {
  if (ticket.venues && ticket.venues.length) return ticket.venues;
  const yes = toProb(ticket.yes);
  return [{ venue: "market", yes, no: 1 - yes }];
}

export function OrderTicket({ ticket, onClose }: { ticket: OrderTicketData | null; onClose: () => void }) {
  if (!ticket) return null;
  const sig = ticket.kind === "stock" ? `s:${ticket.symbol}` : `p:${ticket.marketId}`;
  return <Body key={sig} ticket={ticket} onClose={onClose} />;
}

function Body({ ticket, onClose }: { ticket: OrderTicketData; onClose: () => void }) {
  const router = useRouter();
  const venues = ticket.kind === "prediction" ? predictionVenues(ticket) : [];
  const multiVenue = venues.length > 1;
  const [amount, setAmount] = React.useState(ticket.kind === "prediction" ? ticket.sizeUsd ?? 500 : 1000);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // stock state
  const [action, setAction] = React.useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = React.useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = React.useState(ticket.kind === "stock" ? Number(ticket.price.toFixed(2)) : 0);

  // prediction state
  const [venue, setVenue] = React.useState<string>(venues[0]?.venue ?? "market");
  const [side, setSide] = React.useState<"YES" | "NO">(
    ticket.kind === "prediction" ? ticket.defaultSide ?? "YES" : "YES",
  );

  // ── derived ────────────────────────────────────────────────────────────────
  let unitPrice = 1; // $ per unit
  if (ticket.kind === "stock") unitPrice = orderType === "limit" ? limitPrice : ticket.price;
  else {
    const vq = venues.find((v) => v.venue === venue) ?? venues[0];
    unitPrice = toProb(side === "YES" ? vq?.yes ?? 0.5 : vq?.no ?? 0.5);
  }
  const units = unitPrice > 0 ? amount / unitPrice : 0;
  const unitWord = ticket.kind === "stock" ? "shares" : "contracts";

  async function submit() {
    if (amount <= 0) return setError("Enter an amount greater than $0");
    if (ticket.kind === "stock" && orderType === "limit" && limitPrice <= 0)
      return setError("Enter a limit price");
    setLoading(true);
    setError(null);
    const body =
      ticket.kind === "stock"
        ? { kind: "stock", action, notionalUsd: amount, symbol: ticket.symbol, order_type: orderType, limit_price: orderType === "limit" ? limitPrice : null }
        : { kind: "prediction", action: "buy", notionalUsd: amount, market_id: ticket.marketId, side, venue: multiVenue ? venue : undefined };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.detail === "string" ? data.detail : "Order failed");
        return;
      }
      setDone(true);
      window.dispatchEvent(new Event("verso:account-updated"));
      router.refresh();
      setTimeout(onClose, 850);
    } catch {
      setError("Network error — is the backend running on :8000?");
    } finally {
      setLoading(false);
    }
  }

  const title =
    ticket.kind === "stock"
      ? `${action === "buy" ? "Buy" : "Sell"} ${ticket.symbol}`
      : ticket.question;

  const overlay = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-[400px] rounded-[18px] bg-white p-5 shadow-[0_12px_48px_rgba(0,0,0,0.2)]" onClick={(e) => e.stopPropagation()}>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          {ticket.kind === "stock" ? "Stock order · Alpaca paper" : "Place bet · prediction market"}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[16px] font-semibold leading-snug text-[#0a0a0a]">{title}</h3>

        {ticket.kind === "stock" ? (
          <>
            <Segmented value={action} onChange={(v) => setAction(v as "buy" | "sell")} options={[["buy", "Buy"], ["sell", "Sell"]]} className="mt-4" />
            <Segmented value={orderType} onChange={(v) => setOrderType(v as "market" | "limit")} options={[["market", "Market"], ["limit", "Limit"]]} className="mt-2" />
            {orderType === "limit" && (
              <LabeledInput label="Limit price" prefix="$" value={limitPrice} onChange={setLimitPrice} step={0.01} />
            )}
          </>
        ) : (
          <>
            {multiVenue && (
              <Segmented
                value={venue}
                onChange={(v) => setVenue(v)}
                options={venues.map((vq) => [vq.venue, vq.venue[0].toUpperCase() + vq.venue.slice(1)] as [string, string])}
                className="mt-4"
              />
            )}
            <div className={cn("grid grid-cols-2 gap-2", multiVenue ? "mt-2" : "mt-4")}>
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
                        ? s === "YES" ? "border-[#16a34a] bg-[#16a34a]/10" : "border-[#dc2626] bg-[#dc2626]/10"
                        : "border-[#ececec] bg-white hover:bg-[#fafafa]",
                    )}
                  >
                    <div className={cn("text-[13px] font-bold", s === "YES" ? "text-[#16a34a]" : "text-[#dc2626]")}>{s}</div>
                    <div className="mt-0.5 text-[12px] font-semibold text-[#0a0a0a]">{cents}¢</div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <LabeledInput label="Amount (USD)" prefix="$" value={amount} onChange={setAmount} step={50} />
        <div className="mt-2 flex gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q)}
              className={cn("flex-1 rounded-full py-1.5 text-[12px] font-medium transition-colors", amount === q ? "bg-[#050505] text-white" : "bg-[#f5f5f5] text-[#666] hover:bg-[#ececec]")}
            >
              ${q >= 1000 ? `${q / 1000}k` : q}
            </button>
          ))}
        </div>

        <p className="mt-3 rounded-[8px] bg-[#fafafa] px-3 py-2 text-[12px] text-[#666]">
          ≈ <span className="font-semibold tabular-nums text-[#0a0a0a]">{units.toLocaleString(undefined, { maximumFractionDigits: ticket.kind === "stock" ? 4 : 0 })}</span> {unitWord}
        </p>

        {error && <p className="mt-3 rounded-[8px] bg-[#fee2e2] px-3 py-2 text-[12px] font-medium text-[#dc2626]">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full bg-[#f5f5f5] py-2.5 text-[14px] font-medium text-[#0a0a0a] hover:bg-[#ececec]">Cancel</button>
          <button type="button" onClick={submit} disabled={loading || done} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#050505] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#222] disabled:opacity-70">
            {done ? <><Check className="size-4" /> Placed</> : loading ? <><Loader2 className="size-4 animate-spin" /> Placing…</> : ticket.kind === "stock" ? `Place ${action} order` : "Place bet"}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
}

/** Button that opens an OrderTicket pre-filled with `ticket`. Self-contained so
 * it can be dropped into server-rendered lists (stock rows, market cards). */
export function OrderTicketButton({
  ticket,
  tone = "buy",
  className,
  children,
}: {
  ticket: OrderTicketData;
  tone?: "buy" | "yes" | "no";
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <ActionButton
        tone={tone}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {children}
      </ActionButton>
      <OrderTicket ticket={open ? ticket : null} onClose={() => setOpen(false)} />
    </>
  );
}

export function Segmented({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: [string, string][]; className?: string }) {
  return (
    <div className={cn("flex gap-1 rounded-[12px] bg-[#f5f5f5] p-1", className)}>
      {options.map(([v, label]) => (
        <button key={v} type="button" onClick={() => onChange(v)} className={cn("flex-1 rounded-[9px] py-2 text-[13px] font-semibold transition-colors", value === v ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#737373]")}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function LabeledInput({ label, prefix, value, onChange, step }: { label: string; prefix?: string; value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <>
      <label className="mt-4 block text-[12px] font-medium text-[#666]">{label}</label>
      <div className="mt-1 flex items-center rounded-[10px] border border-[#e8e8e8] px-3 focus-within:border-[#0a0a0a]">
        {prefix && <span className="text-[16px] text-[#a3a3a3]">{prefix}</span>}
        <input type="number" min={0} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full bg-transparent px-2 py-2.5 text-[16px] font-semibold tabular-nums text-[#0a0a0a] outline-none" />
      </div>
    </>
  );
}
