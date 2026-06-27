import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all active:translate-y-px disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // violet primary
        primary:
          "bg-[#9580ff] text-white hover:bg-[#a99bff] hover:-translate-y-px",
        // flat grey secondary
        secondary:
          "bg-[#f5f5f5] text-[#181925] hover:bg-[#ececec] hover:-translate-y-px",
        ghost: "text-[#3f3f46] hover:bg-[#f5f5f5]",
        outline:
          "border border-[#e8e8e8] bg-white text-[#181925] hover:bg-[#f5f5f5]",
      },
      size: {
        sm: "h-8 px-4 text-[13px]",
        default: "h-10 px-5 text-[14px]",
        // marketing CTA
        cta: "px-7 py-3 text-[15px]",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
