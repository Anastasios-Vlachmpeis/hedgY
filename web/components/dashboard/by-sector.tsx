"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import type { SectorWeight } from "@/lib/mockData";

function BySector({ sectors }: { sectors: SectorWeight[] }) {
  return (
    <section className="flex h-full flex-col rounded-[12px] bg-[#f5f5f5] p-4">
      <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#666666]">
        By Sector
      </h2>

      <div className="relative mx-auto aspect-square w-full max-w-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sectors}
              dataKey="pct"
              nameKey="sector"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {sectors.map((s) => (
                <Cell key={s.sector} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[18px] font-bold leading-none text-[#181925]">
            {sectors.length}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-[#a3a3a3]">
            sectors
          </span>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-1">
        {sectors.map((s) => (
          <li
            key={s.sector}
            className="flex items-center gap-2 rounded-[8px] bg-white px-2.5 py-1.5 transition-colors hover:bg-[#fafafa]"
          >
            <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="truncate text-[12px] text-[#3f3f46]">{s.sector}</span>
            <span className="ml-auto shrink-0 rounded-[6px] bg-[#f3f1ff] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#9580ff]">
              {s.pct}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { BySector };
