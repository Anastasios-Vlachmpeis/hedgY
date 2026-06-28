type TagVariant = "hedge" | "expression" | "yes" | "no" | "theme" | "default";

const VARIANTS: Record<TagVariant, string> = {
  hedge: "bg-accent text-white border border-white/15",
  expression: "bg-express/20 text-express border border-express/30",
  yes: "bg-up/20 text-up border border-up/30",
  no: "bg-down/20 text-down border border-down/30",
  theme: "bg-white/10 text-text-dim border border-white/10",
  default: "bg-white/10 text-text-dim border border-white/10",
};

export function Tag({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: TagVariant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide backdrop-blur-sm ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
