import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Rounded violet-tint tile holding a light-violet lucide icon. */
function IconTile({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-12 items-center justify-center rounded-[16px] bg-[#f7f5ff]",
        className,
      )}
    >
      <Icon className="size-5 text-[#0F172A]" strokeWidth={1.9} />
    </span>
  );
}

export { IconTile };
