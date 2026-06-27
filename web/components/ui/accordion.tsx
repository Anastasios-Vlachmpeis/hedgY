"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AccordionItem {
  q: string;
  a: string;
}

/** FAQ accordion. Rows are flat #f6f6f7; body animates via max-height+opacity. */
function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="overflow-hidden rounded-xl bg-[#f6f6f7]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[15px] font-medium text-[#181925]">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-[#9580ff] transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
                strokeWidth={2}
              />
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-[14px] leading-[1.6] text-[#666666]">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { Accordion };
