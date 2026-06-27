import * as React from "react";

import type { SectorWeight } from "@/lib/mockData";

function BySector({ sectors }: { sectors: SectorWeight[] }) {
  return (
    <section className="flex h-full flex-col rounded-[12px] bg-[#f5f5f5] p-4">
      <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
        By Sector
      </h2>
      <ul className="flex flex-col gap-1.5">
        {sectors.map((s) => (
          <li
            key={s.sector}
            className="flex items-center gap-2 rounded-[8px] bg-white px-2.5 py-2 transition-colors hover:bg-[#fafafa]"
          >
            <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="shrink-0 truncate text-[12px] text-[#3f3f46]">
              {s.sector}
            </span>
            {/* thin proportion bar in the sector's colour */}
            <span className="mx-1 h-1 flex-1 overflow-hidden rounded-full bg-[#ececec]">
              <span
                className="block h-full rounded-full"
                style={{ width: `${s.pct}%`, background: s.color }}
              />
            </span>
            <span className="shrink-0 rounded-[6px] bg-[#f3f1ff] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#9580ff]">
              {s.pct}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { BySector };
