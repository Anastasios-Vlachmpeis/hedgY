export function formatMoney(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(value) >= 10_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, signed = true): string {
  const pct = (value * 100).toFixed(2);
  if (signed && value > 0) return `+${pct}%`;
  if (signed && value < 0) return `${pct}%`;
  return `${pct}%`;
}

export function formatCents(price: number): string {
  return `${Math.round(price * 100)}¢`;
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${(value / 1_000).toFixed(0)}K`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatQty(qty: number, kind: "stock" | "market"): string {
  if (kind === "market") return `${qty} contracts`;
  return `${qty} shares`;
}

export function formatBps(bps: number): string {
  return `${bps.toFixed(0)} bps`;
}
