/** Shared number formatters. All output is meant to render with tabular-nums. */

export function usd(n: number, fractionDigits = 2): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** Compact currency, e.g. $2.1M, $12.4M. */
export function usdCompact(n: number): string {
  return (
    "$" +
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n)
  );
}

/** Signed percent, e.g. +1.2%, -0.6%. `n` is already a percentage. */
export function pct(n: number, digits = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

/** Signed currency, e.g. +$1,284.20, -$320.00. */
export function signedUsd(n: number, fractionDigits = 2): string {
  return `${n >= 0 ? "+" : "-"}${usd(Math.abs(n), fractionDigits)}`;
}

/** Signed points, e.g. +4pts, -1pt. */
export function points(n: number): string {
  const unit = Math.abs(n) === 1 ? "pt" : "pts";
  return `${n >= 0 ? "+" : ""}${n}${unit}`;
}
