import * as React from "react";
import { ChevronRight } from "lucide-react";

import type { RegionExposure } from "@/lib/mockData";

function ByRegion({ regions }: { regions: RegionExposure[] }) {
  return (
    <section className="flex h-full flex-col rounded-[12px] bg-[#f5f5f5] p-4">
      <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
        By Region
      </h2>
      <ul className="flex flex-col gap-1.5">
        {regions.map((r) => (
          <li
            key={r.region}
            className="flex items-center gap-2 rounded-[8px] bg-white px-2.5 py-2 transition-colors hover:bg-[#fafafa]"
          >
            <span className="shrink-0 truncate text-[12px] text-[#3f3f46]">
              {r.region}
            </span>
            {/* thin proportion bar */}
            <span className="mx-1 h-1 flex-1 overflow-hidden rounded-full bg-[#ececec]">
              <span
                className="block h-full rounded-full bg-[#9580ff]"
                style={{ width: `${r.pct}%` }}
              />
            </span>
            <span className="shrink-0 rounded-[6px] bg-[#f3f1ff] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#9580ff]">
              {r.pct}%
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-[#a3a3a3]" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export { ByRegion };
