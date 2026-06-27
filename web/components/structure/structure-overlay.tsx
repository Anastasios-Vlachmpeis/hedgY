"use client";

import * as React from "react";
import { X } from "lucide-react";

import type { CombinedPosition } from "@/lib/mockData";
import { combinedPosition } from "@/lib/mockData";
import { StructuringPanel } from "@/components/structure/structuring-panel";

type StructureOverlayContextValue = {
  open: (position?: CombinedPosition) => void;
  close: () => void;
};

const StructureOverlayContext = React.createContext<StructureOverlayContextValue | null>(
  null,
);

function useStructureOverlay() {
  const ctx = React.useContext(StructureOverlayContext);
  if (!ctx) {
    throw new Error("useStructureOverlay must be used within StructureOverlayProvider");
  }
  return ctx;
}

function StructureOverlayProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<CombinedPosition>(combinedPosition);
  const panelKey = React.useRef(0);

  const openOverlay = React.useCallback((next?: CombinedPosition) => {
    setPosition(next ?? combinedPosition);
    panelKey.current += 1;
    setOpen(true);
  }, []);

  const closeOverlay = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlay();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeOverlay]);

  return (
    <StructureOverlayContext.Provider
      value={{ open: openOverlay, close: closeOverlay }}
    >
      {children}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <button
            type="button"
            aria-label="Close structure overlay"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeOverlay}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="structure-overlay-title"
            className="relative z-10 my-auto w-full max-w-xl"
          >
            <div className="mb-3 flex items-start justify-between gap-4 px-1">
              <div>
                <h2
                  id="structure-overlay-title"
                  className="text-[22px] font-semibold tracking-[-0.02em] text-white"
                >
                  Structure a position
                </h2>
                <p className="mt-0.5 text-[13px] text-[#a99e85]">
                  Pair an equity view with a prediction-market hedge. Drag the hedge
                  ratio to reshape the payoff.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeOverlay}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[#f3ecdd] transition-colors hover:bg-white/[0.1]"
              >
                <X className="size-5" strokeWidth={1.8} />
              </button>
            </div>

            <StructuringPanel key={panelKey.current} position={position} />
          </div>
        </div>
      ) : null}
    </StructureOverlayContext.Provider>
  );
}

export { StructureOverlayProvider, useStructureOverlay };
