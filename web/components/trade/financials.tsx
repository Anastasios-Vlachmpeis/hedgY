"use client";

import * as React from "react";
import {
  Bar, BarChart, ComposedChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

const INCOME = [
  { q: "Q1'24", rev: 17.2, gross: 2.1, net: 1.5 },
  { q: "Q2'24", rev: 16.8, gross: 2.0, net: 1.4 },
  { q: "Q3'24", rev: 17.9, gross: 2.3, net: 1.7 },
  { q: "Q4'24", rev: 18.6, gross: 2.6, net: 2.0 },
  { q: "Q1'25", rev: 18.0, gross: 2.4, net: 1.8 },
];

const DEBT = [
  { y: "2021", debt: 11.2, fcf: 6.8, cash: 3.2 },
  { y: "2022", debt: 10.8, fcf: 7.1, cash: 2.9 },
  { y: "2023", debt: 10.3, fcf: 7.5, cash: 3.5 },
  { y: "2024", debt: 9.8,  fcf: 8.0, cash: 4.1 },
];

const PERF = [
  { y: "2021", rev: 67.0, margin: 11.2 },
  { y: "2022", rev: 65.9, margin: 11.8 },
  { y: "2023", rev: 67.6, margin: 12.4 },
  { y: "2024", rev: 71.0, margin: 13.1 },
  { y: "2025E", rev: 74.0, margin: 13.8 },
];

const TT = { contentStyle: { fontSize: 11, borderRadius: 8, border: "1px solid #ececec", background: "#fff" } };

function Toggle({ active, setActive }: { active: "A" | "Q"; setActive: (v: "A" | "Q") => void }) {
  return (
    <div className="flex gap-0.5">
      {(["A", "Q"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setActive(v)}
          className={cn(
            "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
            active === v ? "bg-[#C5D3E6] text-[#181925]" : "text-[#a3a3a3] hover:bg-[#f0f0f0]",
          )}
        >
          {v === "A" ? "Annual" : "Quarterly"}
        </button>
      ))}
    </div>
  );
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-[#666666]">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

const CARD = "rounded-[10px] border border-[#e0e0e0] bg-white p-3";

export function FinancialPanel() {
  const [t1, setT1] = React.useState<"A" | "Q">("Q");
  const [t2, setT2] = React.useState<"A" | "Q">("A");
  const [t3, setT3] = React.useState<"A" | "Q">("A");

  return (
    <div className="flex h-full flex-col gap-3 rounded-[14px] border border-[#181925] bg-[#fafafa] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#a3a3a3]">Financials · LMT</p>

      {/* Revenue to net income */}
      <div className={CARD}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-[#181925]">Revenue to net income</p>
          <Toggle active={t1} setActive={setT1} />
        </div>
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={INCOME} margin={{ top: 2, right: 2, bottom: 0, left: -16 }} barSize={9} barGap={1}>
              <XAxis dataKey="q" tick={{ fontSize: 9, fill: "#a3a3a3" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#a3a3a3" }} tickLine={false} axisLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="rev"   fill="#C5D3E6" radius={[2, 2, 0, 0]} name="Revenue ($B)" />
              <Bar dataKey="gross" fill="#9580ff" radius={[2, 2, 0, 0]} name="Gross profit ($B)" />
              <Bar dataKey="net"   fill="#181925" radius={[2, 2, 0, 0]} name="Net income ($B)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Legend items={[{ color: "#C5D3E6", label: "Revenue" }, { color: "#9580ff", label: "Gross profit" }, { color: "#181925", label: "Net income" }]} />
      </div>

      {/* Debt & FCF */}
      <div className={CARD}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-[#181925]">Debt &amp; free cash flow</p>
          <Toggle active={t2} setActive={setT2} />
        </div>
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEBT} margin={{ top: 2, right: 2, bottom: 0, left: -16 }} barSize={12} barGap={2}>
              <XAxis dataKey="y" tick={{ fontSize: 9, fill: "#a3a3a3" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#a3a3a3" }} tickLine={false} axisLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="debt" fill="#fca5a5" radius={[2, 2, 0, 0]} name="Long-term debt ($B)" />
              <Bar dataKey="fcf"  fill="#86efac" radius={[2, 2, 0, 0]} name="Free cash flow ($B)" />
              <Bar dataKey="cash" fill="#C5D3E6" radius={[2, 2, 0, 0]} name="Cash ($B)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Legend items={[{ color: "#fca5a5", label: "Debt" }, { color: "#86efac", label: "FCF" }, { color: "#C5D3E6", label: "Cash" }]} />
      </div>

      {/* Performance */}
      <div className={CARD}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-[#181925]">Performance</p>
          <Toggle active={t3} setActive={setT3} />
        </div>
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={PERF} margin={{ top: 2, right: 12, bottom: 0, left: -16 }}>
              <XAxis dataKey="y" tick={{ fontSize: 9, fill: "#a3a3a3" }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 9, fill: "#a3a3a3" }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9, fill: "#a3a3a3" }} tickLine={false} axisLine={false} />
              <Tooltip {...TT} />
              <Bar  yAxisId="l" dataKey="rev"    fill="#C5D3E6" radius={[2, 2, 0, 0]} barSize={14} name="Revenue ($B)" />
              <Line yAxisId="r" type="monotone" dataKey="margin" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 2 }} name="Net margin %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <Legend items={[{ color: "#C5D3E6", label: "Revenue ($B)" }, { color: "#f97316", label: "Net margin %" }]} />
      </div>
    </div>
  );
}
