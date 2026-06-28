"use client";

import { useEffect, useRef } from "react";

/**
 * Animated hedge-ratio readout that counts in sync with the dial's sweep
 * (the `.anim-dial-sweep` / `.anim-dial-draw` CSS loop). It mirrors that
 * 4.6s cycle: fill 0 → 0.67 over the first ~30%, hold, then ease back to 0.
 * Uses a ref + rAF (no per-frame React re-render) and respects reduced motion.
 */
const CYCLE_MS = 4600;
const TARGET = 0.67;

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export function DialValue({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = TARGET.toFixed(2);
      return;
    }

    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const p = ((now - start) % CYCLE_MS) / CYCLE_MS;
      let frac: number;
      if (p < 0.3) frac = easeInOut(p / 0.3);
      else if (p < 0.84) frac = 1;
      else frac = 1 - easeInOut((p - 0.84) / 0.16);
      el.textContent = (TARGET * frac).toFixed(2);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span ref={ref} className={className}>
      {TARGET.toFixed(2)}
    </span>
  );
}
