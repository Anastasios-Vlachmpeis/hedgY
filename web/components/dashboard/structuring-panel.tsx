"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

import {
  combinedPosition,
  computePayoff,
  computePreview,
  summarize,
} from "@/lib/mockData";
import { BasketBuilder } from "@/components/dashboard/basket-builder";
import { PositionPreview } from "@/components/dashboard/position-preview";

/**
 * The hero feature. Dark surface against the white page. Owns the hedge-ratio
 * state so the slider in the Basket Builder live-updates BOTH the Position
 * Preview stats and the payoff/scenario chart.
 */
function StructuringPanel() {
  const position = combinedPosition;
  const [hedgeRatio, setHedgeRatio] = React.useState(position.defaultHedgeRatio);
  const [toast, setToast] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Single source of truth → everything below recomputes from hedgeRatio.
  const preview = React.useMemo(
    () => computePreview(position, hedgeRatio),
    [position, hedgeRatio],
  );
  const payoff = React.useMemo(
    () => computePayoff(position, hedgeRatio),
    [position, hedgeRatio],
  );
  const summary = React.useMemo(
    () => summarize(position, hedgeRatio),
    [position, hedgeRatio],
  );

  const execute = React.useCallback(() => {
    setToast(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(false), 2800);
  }, []);

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <section className="flex h-full flex-col rounded-[16px] bg-[#181925] p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#9580ff]" />
          <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-white">
            Structuring
          </h2>
        </div>
        <span className="rounded-full bg-[#9580ff]/20 px-2.5 py-0.5 text-[11px] font-medium text-[#b3a6ff]">
          Basket Builder
        </span>
      </div>
      <p className="mt-0.5 text-[12px] text-[#a3a3a3]">
        Express a view and hedge it in one position.
      </p>

      {/* Basket Builder */}
      <div className="mt-3">
        <BasketBuilder
          position={position}
          hedgeRatio={hedgeRatio}
          hedgeSize={preview.hedgeSize}
          onHedgeRatioChange={setHedgeRatio}
        />
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-white/[0.08]" />

      {/* Position Preview */}
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        Position Preview
      </p>
      <PositionPreview
        preview={preview}
        payoff={payoff}
        summary={summary}
        onExecute={execute}
      />

      {/* Mock success toast */}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#181925] px-4 py-3 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10 transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <CheckCircle2 className="size-5 text-[#3fb950]" />
        <div className="leading-tight">
          <p className="text-[14px] font-semibold">Combined position executed</p>
          <p className="text-[12px] text-[#a3a3a3]">
            Routed across Alpaca · Kalshi — mock fill
          </p>
        </div>
      </div>
    </section>
  );
}

export { StructuringPanel };
