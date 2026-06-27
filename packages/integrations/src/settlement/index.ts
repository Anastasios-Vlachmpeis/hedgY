import type { Break, Fill, LedgerEntry } from "../types.ts";

// ─────────────────────────────────────────────────────────────────────────────
// SETTLEMENT / RECONCILIATION
// After we route an order and a venue reports fills, we reconcile those fills
// against what our internal ledger expected. Mismatches ("breaks") are what an
// ops/risk team chases down. Business-critical, but NOT demo-critical — so this
// is a real, working reconciler with a deliberately small rule set.
// ─────────────────────────────────────────────────────────────────────────────

export interface ReconcileOptions {
  /** Allowed relative price deviation before flagging slippage (default 0.5%). */
  slippageTolerance?: number;
}

/** Compare expected ledger entries to actual fills and return any breaks. */
export function reconcile(ledger: LedgerEntry[], fills: Fill[], opts: ReconcileOptions = {}): Break[] {
  const tol = opts.slippageTolerance ?? 0.005;
  const breaks: Break[] = [];

  const fillsByOrder = new Map<string, Fill[]>();
  for (const f of fills) {
    const arr = fillsByOrder.get(f.orderId) ?? [];
    arr.push(f);
    fillsByOrder.set(f.orderId, arr);
  }

  for (const entry of ledger) {
    const matched = fillsByOrder.get(entry.orderId) ?? [];
    fillsByOrder.delete(entry.orderId);

    if (matched.length === 0) {
      breaks.push({ orderId: entry.orderId, kind: "missing_fill", detail: `expected ${entry.side} ${entry.qty} of ${entry.canonicalId}, no fill` });
      continue;
    }

    const filledQty = matched.reduce((s, f) => s + f.qty, 0);
    if (filledQty !== entry.qty) {
      breaks.push({ orderId: entry.orderId, kind: "qty_mismatch", detail: `expected ${entry.qty}, filled ${filledQty}` });
    }

    const vwap = matched.reduce((s, f) => s + f.price * f.qty, 0) / filledQty;
    if (entry.expectedPrice > 0 && Math.abs(vwap - entry.expectedPrice) / entry.expectedPrice > tol) {
      breaks.push({ orderId: entry.orderId, kind: "price_slippage", detail: `expected ~${entry.expectedPrice}, vwap ${vwap.toFixed(4)}` });
    }
  }

  // Any fills with no matching ledger entry are unexpected.
  for (const [orderId, leftover] of fillsByOrder) {
    breaks.push({ orderId, kind: "unexpected_fill", detail: `${leftover.length} fill(s) with no ledger entry` });
  }

  return breaks;
}
