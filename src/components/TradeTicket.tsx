import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { api } from "../lib/api/client";
import { formatCents, formatMoney } from "../lib/format";
import { useUIStore } from "../store/ui";
import { Button } from "./Button";
import { Tag } from "./Tag";

export function TradeTicket() {
  const {
    open,
    kind,
    id,
    label,
    price,
    side,
    marketSide,
    hedgePair,
    closeTicket,
    setSide,
    setMarketSide,
  } = useUIStore();

  const [qty, setQty] = useState("1");
  const [toast, setToast] = useState<string | null>(null);

  const orderMutation = useMutation({
    mutationFn: () =>
      api.placeOrder({
        kind,
        id,
        side: side === "buy" ? "BUY" : "SELL",
        qty: parseFloat(qty) || 0,
      }),
    onSuccess: () => {
      setToast("Order placed (mock)");
      setTimeout(() => {
        setToast(null);
        closeTicket();
        setQty("1");
      }, 1500);
    },
  });

  if (!open) return null;

  const quantity = parseFloat(qty) || 0;
  const estimatedCost =
    kind === "stock"
      ? quantity * price
      : quantity * (marketSide === "YES" ? price : 1 - price);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={closeTicket}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Trade ticket"
        className="glass-strong fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {side === "buy" ? "Buy" : "Sell"} {label}
          </h2>
          <button
            type="button"
            onClick={closeTicket}
            className="rounded-full p-2 text-text-dim hover:bg-white/10 hover:text-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {hedgePair && (
          <div className="glass-inset mb-6 rounded-xl p-4 text-sm">
            <p className="mb-2 text-xs uppercase tracking-wide text-text-dim">
              Two-leg hedge pair
            </p>
            <p>
              Keep {hedgePair.stockSymbol} + buy {hedgePair.suggestion.side} on{" "}
              {hedgePair.suggestion.market.question.slice(0, 40)}…
            </p>
            <Tag
              variant={
                hedgePair.suggestion.direction === "hedge" ? "hedge" : "expression"
              }
            >
              {hedgePair.suggestion.direction}
            </Tag>
          </div>
        )}

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setSide("buy")}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${
              side === "buy" ? "bg-accent text-white" : "glass-inset text-text-dim"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide("sell")}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${
              side === "sell" ? "bg-down text-white" : "glass-inset text-text-dim"
            }`}
          >
            Sell
          </button>
        </div>

        {kind === "market" && (
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMarketSide("YES")}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                marketSide === "YES"
                  ? "border border-up/50 bg-up/15 text-up"
                  : "glass-inset text-text-dim"
              }`}
            >
              YES {formatCents(price)}
            </button>
            <button
              type="button"
              onClick={() => setMarketSide("NO")}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                marketSide === "NO"
                  ? "border border-down/50 bg-down/15 text-down"
                  : "glass-inset text-text-dim"
              }`}
            >
              NO {formatCents(1 - price)}
            </button>
          </div>
        )}

        <label className="mb-4 block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-text-dim">
            {kind === "stock" ? "Shares" : "Contracts"}
          </span>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="glass-inset w-full rounded-xl px-4 py-3 text-lg font-semibold tabular-nums focus:border-up/50 focus:outline-none"
          />
        </label>

        <div className="mb-6 flex justify-between text-sm">
          <span className="text-text-dim">Estimated cost</span>
          <span className="font-semibold tabular-nums">
            {formatMoney(estimatedCost)}
          </span>
        </div>

        <Button
          className="w-full"
          onClick={() => orderMutation.mutate()}
          disabled={orderMutation.isPending || quantity <= 0}
        >
          {orderMutation.isPending ? "Placing..." : "Confirm"}
        </Button>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,128,0.55)]">
          {toast}
        </div>
      )}
    </>
  );
}
