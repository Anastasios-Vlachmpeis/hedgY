"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { usd, signedUsd, pct } from "@/lib/format";
import type { Position } from "@/lib/mockData";

/**
 * In-app confirmation for closing (liquidating) a position — mirrors the order
 * ticket's portal + overlay styling so the whole app feels consistent (no
 * native window.confirm / window.alert dialogs).
 */
export function ClosePositionModal({
  position,
  loading,
  done,
  error,
  onConfirm,
  onCancel,
}: {
  position: Position | null;
  loading: boolean;
  done: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!position) return null;
  if (typeof document === "undefined") return null;

  const up = position.pnl >= 0;
  const pnlColor = up ? "text-[#16a34a]" : "text-[#dc2626]";
  const busy = loading || done;

  const overlay = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4"
      onClick={busy ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[400px] rounded-[18px] bg-white p-5 shadow-[0_12px_48px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
          Close position
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[16px] font-semibold leading-snug text-[#0a0a0a]">
          {position.title}
        </h3>

        <div className="mt-4 rounded-[12px] border border-[#ececec] bg-[#fafafa] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#737373]">Market value</span>
            <span className="text-[13px] font-semibold tabular-nums text-[#0a0a0a]">
              {usd(position.value, 2)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[12px] text-[#737373]">Unrealized P&amp;L</span>
            <span className={cn("text-[13px] font-semibold tabular-nums", pnlColor)}>
              {signedUsd(position.pnl, 2)} ({pct(position.pnlPct)})
            </span>
          </div>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-[#737373]">
          This sells the {position.type === "Combined" ? "entire hedge (both legs)" : "full position"} at
          the current market price and realizes the P&amp;L into your cash balance.
        </p>

        {error && (
          <p className="mt-3 rounded-[8px] bg-[#fee2e2] px-3 py-2 text-[12px] font-medium text-[#dc2626]">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-full bg-[#f5f5f5] py-2.5 text-[14px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#ececec] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#dc2626] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-70"
          >
            {done ? (
              <>
                <Check className="size-4" /> Closed
              </>
            ) : loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Closing…
              </>
            ) : (
              "Close position"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
