import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  const variants: Record<Variant, string> = {
    primary:
      "bg-accent text-white shadow-[0_6px_20px_rgba(0,0,128,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-125 backdrop-blur-sm",
    secondary:
      "glass-inset text-text hover:bg-white/10",
    ghost: "text-text-dim hover:text-text",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
