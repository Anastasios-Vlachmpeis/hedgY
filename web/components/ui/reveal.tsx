"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper. Fades + lifts its children into place once, the
 * first time it crosses into view (IntersectionObserver, threshold 0.08).
 * Respects prefers-reduced-motion via CSS.
 */
function Reveal({
  className,
  delay = 0,
  as: Tag = "div",
  ...props
}: React.ComponentProps<"div"> & {
  delay?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Component = Tag as React.ElementType;
  return (
    <Component
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...props}
    />
  );
}

export { Reveal };
