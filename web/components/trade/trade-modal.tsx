"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { ActionButton } from "@/components/ui/action-button";

type Kind = "stock" | "prediction";
type Tone = "buy" | "yes" | "no";

interface TradeButtonProps {
  kind: Kind;
  tone: Tone;
  /** symbol (stock) or question (prediction) — shown in the modal title */
  label: string;
  /** live unit price: dollars for a stock, implied prob 0..1 for a prediction */
  price: number;
  symbol?: string;
  marketId?: string;
  side?: "YES" | "NO";
  className?: string;
  children: React.ReactNode;
}

const QUICK = [50, 100, 250, 500];

/**
 * Buy button that opens a small trade modal (pick a $ amount) and places a real
 * order against the $1000 account via /api/orders, then refreshes the page so
 * the account + positions update. Stocks hit Alpaca paper; predictions fill in
 * the in-app ledger at live odds.
 */
export function TradeButton({
  kind,
  tone,
  label,
  price,
  symbol,
  marketId,
  side,
  className,
  children,
}: TradeButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(100);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const units = price > 0 ? amount / price : 0;
  const unitWord = kind === "stock" ? "shares" : "contracts";
  const priceLabel = kind === "stock" ? `$${price.toFixed(2)}` : `${Math.round(price * 100)}¢`;
  const title =
    kind === "stock" ? `Buy ${symbol ?? label}` : `Buy ${side} · ${label}`;

  function close() {
    setOpen(false);
    setError(null);
    setDone(false);
  }

  async function submit() {
    if (amount <= 0) {
      setError("Enter an amount greater than $0");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          action: "buy",
          notionalUsd: amount,
          symbol,
          market_id: marketId,
          side,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.detail === "string" ? data.detail : "Order failed");
        return;
      }
      setDone(true);
      router.refresh();
      setTimeout(close, 850);
    } catch {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  }

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

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-[16px] bg-white p-5 shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
              {kind === "stock" ? "Stock order" : "Prediction order"}
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-[16px] font-semibold leading-snug text-[#181925]">
              {title}
            </h3>
            <p className="mt-1 text-[12px] text-[#a3a3a3]">
              Live price <span className="font-semibold text-[#181925]">{priceLabel}</span>
            </p>

            <label className="mt-4 block text-[12px] font-medium text-[#666666]">
              Amount (USD)
            </label>
            <div className="mt-1 flex items-center rounded-[10px] border border-[#e8e8e8] px-3 focus-within:border-[#9580ff] focus-within:ring-2 focus-within:ring-[#9580ff]/20">
              <span className="text-[16px] text-[#a3a3a3]">$</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-transparent px-2 py-2.5 text-[16px] font-semibold tabular-nums text-[#181925] outline-none"
              />
            </div>

            <div className="mt-2 flex gap-1.5">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={cn(
                    "flex-1 rounded-full py-1.5 text-[12px] font-medium transition-colors",
                    amount === q
                      ? "bg-[#181925] text-white"
                      : "bg-[#f5f5f5] text-[#666666] hover:bg-[#ececec]",
                  )}
                >
                  ${q}
                </button>
              ))}
            </div>

            <p className="mt-3 rounded-[8px] bg-[#fafafa] px-3 py-2 text-[12px] text-[#666666]">
              ≈ <span className="font-semibold tabular-nums text-[#181925]">
                {units.toLocaleString(undefined, { maximumFractionDigits: kind === "stock" ? 4 : 0 })}
              </span>{" "}
              {unitWord} at {priceLabel}
            </p>

            {error && (
              <p className="mt-3 rounded-[8px] bg-[#fee2e2] px-3 py-2 text-[12px] font-medium text-[#dc2626]">
                {error}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-full bg-[#f5f5f5] py-2.5 text-[14px] font-medium text-[#181925] hover:bg-[#ececec]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={loading || done}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#9580ff] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#a99bff] disabled:opacity-70"
              >
                {done ? (
                  <>
                    <Check className="size-4" /> Done
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Placing…
                  </>
                ) : (
                  `Buy $${amount}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
