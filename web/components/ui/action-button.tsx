import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type Tone = "buy" | "yes" | "no";

const TONE_STYLES: Record<Tone, string> = {
  // violet = primary action (our accent)
  buy: "bg-[#f3f1ff] text-[#9580ff] hover:bg-[#9580ff] hover:text-white",
  // green = positive outcome
  yes: "bg-[#dcfce7] text-[#16a34a] hover:bg-[#16a34a] hover:text-white",
  // red = negative outcome
  no: "bg-[#fee2e2] text-[#dc2626] hover:bg-[#dc2626] hover:text-white",
};

/**
 * Compact data-row action button shared across stocks (Buy) and prediction
 * markets (Yes/No). Soft tint that fills on hover — one consistent language.
 * Mock only: no real order is placed.
 */
function ActionButton({
  tone,
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { tone: Tone; asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="action-button"
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-[7px] px-3 py-1.5 text-[12px] font-semibold transition-colors active:translate-y-px",
        TONE_STYLES[tone],
        className,
      )}
      {...(asChild ? {} : { type: "button" })}
      {...props}
    />
  );
}

export { ActionButton };
