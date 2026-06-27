import * as React from "react";

import { cn } from "@/lib/utils";

/** Small violet eyebrow chip that opens each section. */
function Eyebrow({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#f3f1ff] px-3 py-1 text-[12px] font-medium text-[#9580ff]",
        className,
      )}
      {...props}
    />
  );
}

export { Eyebrow };
