"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { financials } from "@/lib/terminalMock";

type Cadence = "Annual" | "Quarterly";

const AXIS = { fontSize: 10, fill: "#6b624f" } as const;
const GRID = "rgba(255,255,255,0.05)";
const TOOLTIP = {
  contentStyle: {
    background: "#15110b",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    fontSize: 11,
  },
  labelStyle: { color: "#a99e85" },
  itemStyle: { color: "#f3ecdd" },
} as const;
const CURSOR = { fill: "rgba(255,255,255,0.05)" } as const;

function Block({
  title,
  cadence,
  onCadence,
  children,
}: {
  title: string;
  cadence: Cadence;
  onCadence: (c: Cadence) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h4 className="text-[12px] font-semibold text-[#f3ecdd]">{title}</h4>
        <div className="inline-flex gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-0.5">
          {(["Annual", "Quarterly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCadence(c)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                cadence === c
                  ? "bg-white/10 text-[#f3ecdd]"
                  : "text-[#6b624f] hover:text-[#f3ecdd]",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[120px] w-full">{children}</div>
    </div>
  );
}

/** Three compact company-financials charts with a shared Annual/Quarterly toggle. */
function Financials() {
  const [cadence, setCadence] = React.useState<Cadence>("Annual");
  const data = financials[cadence];

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
      <Block title="Revenue to profit conversion" cadence={cadence} onCadence={setCadence}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.revenue} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" tick={AXIS} interval={0} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={34} />
            <Tooltip {...TOOLTIP} cursor={CURSOR} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {data.revenue.map((d) => (
                <Cell
                  key={d.label}
                  fill={(d.value as number) >= 0 ? "#c9aa6c" : "#cf8a6e"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Block>

      <Block title="Debt level and coverage" cadence={cadence} onCadence={setCadence}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.debt} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" tick={AXIS} interval={0} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={34} />
            <Tooltip {...TOOLTIP} cursor={CURSOR} />
            <Bar dataKey="debt" fill="#cf8a6e" radius={[3, 3, 0, 0]} />
            <Bar dataKey="cash" fill="#c9aa6c" radius={[3, 3, 0, 0]} />
            <Bar dataKey="equiv" fill="#5b6e8c" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Block>

      <Block title="Performance" cadence={cadence} onCadence={setCadence}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.performance} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" tick={AXIS} interval={0} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={34} />
            <Tooltip {...TOOLTIP} cursor={CURSOR} />
            <Bar dataKey="revenue" fill="#5b6e8c" radius={[3, 3, 0, 0]} />
            <Bar dataKey="net" fill="#c9aa6c" radius={[3, 3, 0, 0]} />
            <Line
              type="monotone"
              dataKey="margin"
              stroke="#9bb37e"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Block>
    </div>
  );
}

export { Financials };
