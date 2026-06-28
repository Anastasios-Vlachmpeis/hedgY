import { formatMoney, formatPercent } from "../lib/format";

export function PriceText({
  value,
  changePct,
  size = "md",
}: {
  value?: number;
  changePct?: number;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
    xl: "text-4xl font-semibold tracking-tight",
  };

  if (changePct !== undefined) {
    const positive = changePct >= 0;
    return (
      <span
        className={`font-medium tabular-nums ${sizes[size]} ${positive ? "text-up" : "text-down"}`}
      >
        {formatPercent(changePct)}
      </span>
    );
  }

  if (value !== undefined) {
    return (
      <span className={`tabular-nums ${sizes[size]}`}>{formatMoney(value)}</span>
    );
  }

  return null;
}
