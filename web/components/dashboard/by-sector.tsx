import * as React from "react";
import { ChevronRight } from "lucide-react";

import type { SectorWeight } from "@/lib/mockData";

function BySector({ sectors }: { sectors: SectorWeight[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#ececec] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">
        By Sector
      </h2>
      <ul className="divide-y divide-[#f0f0f0]">
        {sectors.map((s) => (
          <li key={s.sector} className="flex items-center gap-2 py-2.5">
            <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="truncate text-[13px] text-[#181925]">{s.sector}</span>
            <span className="ml-auto shrink-0 text-[13px] font-semibold tabular-nums text-[#181925]">
              {s.pct}%
            </span>
            <ChevronRight className="size-4 shrink-0 text-[#d4d4d4]" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export { BySector };
