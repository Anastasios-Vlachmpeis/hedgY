// Deterministic gradient avatar: every account gets a unique, consistent
// clean two-tone gradient blob (derived from their email/name) — the default
// profile picture, Polymarket-style (no initials).

const GRADIENTS: [string, string][] = [
  ["#3b82f6", "#ec4899"], ["#f59e0b", "#8b5cf6"], ["#06b6d4", "#d946ef"], ["#14b8a6", "#6366f1"],
  ["#facc15", "#ef4444"], ["#22c55e", "#3b82f6"], ["#fb923c", "#ec4899"], ["#a855f7", "#84cc16"],
  ["#ec4899", "#7c3aed"], ["#fbbf24", "#fb7185"], ["#8b5cf6", "#06b6d4"], ["#f97316", "#22c55e"],
  ["#d946ef", "#fbbf24"], ["#ef4444", "#8b5cf6"], ["#22c55e", "#eab308"], ["#3b82f6", "#fb923c"],
  ["#ec4899", "#3b82f6"], ["#14b8a6", "#ec4899"], ["#fb7185", "#6366f1"], ["#7c3aed", "#f97316"],
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function GradientAvatar({
  seed,
  size = 28,
  className = "",
}: {
  seed: string;
  size?: number;
  className?: string;
}) {
  const [a, b] = GRADIENTS[hashCode(seed || "user") % GRADIENTS.length];
  return (
    <div
      className={`shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${a}, transparent 72%), linear-gradient(140deg, ${a}, ${b})`,
      }}
      aria-hidden
    />
  );
}
