import * as React from "react";

import { cn } from "@/lib/utils";

/** Labeled text input, matched to the violet/editorial design tokens. */
const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { label?: string }
>(({ className, label, id, ...props }, ref) => {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-medium text-[#3f3f46]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-[#e8e8e8] bg-white px-3.5 text-[14px] text-[#181925]",
          "placeholder:text-[#a3a3a3] transition-colors",
          "focus:border-[#9580ff] focus:outline-none focus:ring-2 focus:ring-[#9580ff]/25",
          className,
        )}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

export { Input };
