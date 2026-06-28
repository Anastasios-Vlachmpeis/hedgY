import { useMemo } from "react";

export function Sparkline({
  data,
  width = 64,
  height = 28,
  positive,
}: {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data, width, height]);

  const isUp =
    positive ?? (data.length > 1 ? data[data.length - 1] >= data[0] : true);
  const color = isUp ? "var(--up)" : "var(--down)";

  return (
    <svg width={width} height={height} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}
