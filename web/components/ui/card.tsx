import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Flat surface card — depth comes from the background step, not borders or
 * shadows. Default is the editorial grey (#f5f5f5) on a white canvas.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col rounded-[24px] bg-[#f5f5f5] text-[#181925]",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex items-center justify-between gap-2 px-6 pt-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-[12px] font-medium uppercase tracking-wider text-[#666666]",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("flex-1 p-6", className)} {...props} />
  );
}

export { Card, CardHeader, CardTitle, CardContent };
