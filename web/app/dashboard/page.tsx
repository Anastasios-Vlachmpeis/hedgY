"use client";

import * as React from "react";
import Link from "next/link";
import {
  Anchor,
  Apple,
  ArrowRight,
  Building2,
  CheckCircle2,
  Cpu,
  ExternalLink,
  FileText,
  Gauge,
  Landmark,
  Plus,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STOCKS_DB } from "@/lib/stocks";

type ChartPoint = {
  t: string;
  price: number;
};

type Asset = {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  price: number;
  accent: string;
  chart: ChartPoint[];
  metrics: {
    marketCap: string;
    pe: string;
    range52w: string;
    dividendYield: string;
    beta: string;
  };
  position: {
    shares: number;
    notional: number;
    portfolioPct: string;
    avgPrice: number;
    pnl: number;
    pnlPct: string;
    volatility: string;
  };
  recommendedMarketId: string;
};

type RiskMarket = {
  id: string;
  title: string;
  category: string;
  assetSymbols: string[];
  icon: "landmark" | "shield" | "anchor" | "cpu" | "building" | "macro" | "file";
  probability: number;
  yes: number;
  no: number;
  volume: string;
  venue: string;
  bestYesVenue: string;
  bestNoVenue: string;
  correlation: number;
  hedgeSide: "YES" | "NO";
  hedgeRatio: number;
  protectionPct: number;
  outcomeUp: number;
  outcomeUpPct: string;
  outcomeDown: number;
  outcomeDownPct: string;
  quoteRows: Array<{ venue: "Kalshi" | "Polymarket"; yes: number; no: number; volume: string }>;
  sparkUp: Array<{ t: string; v: number }>;
  sparkDown: Array<{ t: string; v: number }>;
};

const monthLabels = [
  "Jul",
  "",
  "",
  "Aug",
  "",
  "",
  "Sep",
  "",
  "",
  "Oct",
  "",
  "",
  "Nov",
  "",
  "",
  "Dec",
  "",
  "",
  "2025",
  "",
  "",
  "Feb",
  "",
  "",
  "Mar",
  "",
  "",
  "Apr",
  "",
  "",
  "May",
  "",
  "",
  "Jun",
];

function chart(values: number[]): ChartPoint[] {
  return values.map((price, index) => ({
    t: monthLabels[index] ?? "",
    price,
  }));
}

function spark(values: number[]) {
  return values.map((v, i) => ({ t: `${i + 1}`, v }));
}

const assets: Asset[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    sector: "Consumer Technology",
    price: 195.64,
    accent: "#111827",
    chart: chart([
      184, 181, 183, 179, 185, 188, 192, 189, 193, 197, 202, 199, 204, 208, 210, 207, 214,
      219, 221, 216, 211, 214, 209, 206, 202, 198, 191, 188, 192, 189, 194, 197, 196, 195.64,
    ]),
    metrics: {
      marketCap: "$3.02T",
      pe: "29.8x",
      range52w: "164.08 - 237.49",
      dividendYield: "0.51%",
      beta: "1.11",
    },
    position: {
      shares: 120,
      notional: 23476.8,
      portfolioPct: "4.62%",
      avgPrice: 190.34,
      pnl: 636,
      pnlPct: "+2.78%",
      volatility: "28.4%",
    },
    recommendedMarketId: "eu-dma-apple-fine",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    exchange: "NASDAQ",
    sector: "Semiconductors",
    price: 144.22,
    accent: "#76B900",
    chart: chart([
      98, 102, 106, 101, 108, 114, 118, 116, 121, 129, 132, 127, 135, 141, 139, 146, 152, 158,
      154, 163, 171, 168, 176, 181, 174, 166, 158, 149, 142, 137, 141, 146, 143, 144.22,
    ]),
    metrics: {
      marketCap: "$3.51T",
      pe: "40.2x",
      range52w: "86.62 - 195.95",
      dividendYield: "0.03%",
      beta: "1.72",
    },
    position: {
      shares: 180,
      notional: 25959.6,
      portfolioPct: "5.12%",
      avgPrice: 137.88,
      pnl: 1141.2,
      pnlPct: "+4.60%",
      volatility: "52.1%",
    },
    recommendedMarketId: "ai-chip-export-controls",
  },
  {
    symbol: "LMT",
    name: "Lockheed Martin",
    exchange: "NYSE",
    sector: "Defense & Aerospace",
    price: 507.4,
    accent: "#7C5CFF",
    chart: chart([
      452, 438, 444, 426, 432, 449, 471, 463, 488, 515, 543, 575, 548, 558, 537, 582, 564,
      596, 576, 612, 588, 571, 552, 561, 536, 449, 468, 472, 486, 439, 461, 481, 471, 507.4,
    ]),
    metrics: {
      marketCap: "$118.4B",
      pe: "17.6x",
      range52w: "418.88 - 618.95",
      dividendYield: "2.54%",
      beta: "0.78",
    },
    position: {
      shares: 100,
      notional: 50740,
      portfolioPct: "10.00%",
      avgPrice: 507.4,
      pnl: 238,
      pnlPct: "+0.47%",
      volatility: "23.8%",
    },
    recommendedMarketId: "fed-rate-cut-july",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    exchange: "NASDAQ",
    sector: "Software & Cloud",
    price: 492.16,
    accent: "#4F8DFF",
    chart: chart([
      421, 426, 419, 432, 439, 451, 448, 463, 471, 466, 482, 489, 494, 486, 501, 508, 512,
      505, 517, 526, 531, 522, 514, 509, 498, 486, 475, 481, 493, 501, 497, 506, 499, 492.16,
    ]),
    metrics: {
      marketCap: "$3.66T",
      pe: "34.5x",
      range52w: "344.79 - 543.84",
      dividendYield: "0.66%",
      beta: "0.93",
    },
    position: {
      shares: 80,
      notional: 39372.8,
      portfolioPct: "7.76%",
      avgPrice: 474.8,
      pnl: 1388.8,
      pnlPct: "+3.66%",
      volatility: "25.6%",
    },
    recommendedMarketId: "ai-antitrust-cloud",
  },
  {
    symbol: "AMD",
    name: "AMD Inc.",
    exchange: "NASDAQ",
    sector: "Semiconductors",
    price: 153.77,
    accent: "#050505",
    chart: chart([
      117, 121, 119, 126, 131, 129, 136, 142, 138, 151, 158, 153, 162, 171, 166, 179, 185,
      177, 169, 162, 158, 151, 146, 139, 132, 127, 134, 141, 149, 144, 152, 158, 151, 153.77,
    ]),
    metrics: {
      marketCap: "$249.1B",
      pe: "35.1x",
      range52w: "93.12 - 227.30",
      dividendYield: "0.00%",
      beta: "1.88",
    },
    position: {
      shares: 150,
      notional: 23065.5,
      portfolioPct: "4.55%",
      avgPrice: 148.12,
      pnl: 847.5,
      pnlPct: "+3.82%",
      volatility: "58.3%",
    },
    recommendedMarketId: "ai-chip-export-controls",
  },
];

const riskMarkets: RiskMarket[] = [
  {
    id: "fed-rate-cut-july",
    title: "Fed rate cut in July",
    category: "Macro",
    assetSymbols: ["LMT", "MSFT", "AAPL"],
    icon: "macro",
    probability: 38,
    yes: 38,
    no: 62,
    volume: "$2.1M",
    venue: "Kalshi / Polymarket",
    bestYesVenue: "Kalshi",
    bestNoVenue: "Polymarket",
    correlation: -0.41,
    hedgeSide: "NO",
    hedgeRatio: 0.58,
    protectionPct: 62,
    outcomeUp: 4320,
    outcomeUpPct: "+8.5%",
    outcomeDown: -1230,
    outcomeDownPct: "-2.4%",
    quoteRows: [
      { venue: "Kalshi", yes: 39, no: 61, volume: "$1.3M" },
      { venue: "Polymarket", yes: 38, no: 62, volume: "$820K" },
    ],
    sparkUp: spark([7, 10, 12, 11, 16, 18, 17, 21, 24, 27, 25, 29, 31, 35, 34, 33, 36, 40]),
    sparkDown: spark([39, 37, 35, 36, 31, 30, 27, 29, 24, 22, 20, 18, 17, 18, 15, 13, 12, 9]),
  },
  {
    id: "defense-budget-900",
    title: "US defense budget exceeds $900B",
    category: "Defense policy",
    assetSymbols: ["LMT"],
    icon: "landmark",
    probability: 55,
    yes: 55,
    no: 45,
    volume: "$1.1M",
    venue: "Kalshi",
    bestYesVenue: "Kalshi",
    bestNoVenue: "Polymarket",
    correlation: 0.63,
    hedgeSide: "NO",
    hedgeRatio: 0.46,
    protectionPct: 54,
    outcomeUp: 3120,
    outcomeUpPct: "+6.1%",
    outcomeDown: -1680,
    outcomeDownPct: "-3.3%",
    quoteRows: [
      { venue: "Kalshi", yes: 55, no: 45, volume: "$740K" },
      { venue: "Polymarket", yes: 54, no: 46, volume: "$360K" },
    ],
    sparkUp: spark([5, 8, 9, 13, 12, 15, 18, 17, 21, 23, 25, 24, 27, 31, 30, 33, 35, 38]),
    sparkDown: spark([33, 31, 29, 27, 26, 24, 22, 23, 20, 19, 18, 16, 15, 13, 12, 10, 9, 8]),
  },
  {
    id: "republicans-2026",
    title: "Republicans win 2026 midterms",
    category: "Politics",
    assetSymbols: ["LMT"],
    icon: "shield",
    probability: 43,
    yes: 43,
    no: 57,
    volume: "$12.4M",
    venue: "Polymarket",
    bestYesVenue: "Polymarket",
    bestNoVenue: "Kalshi",
    correlation: 0.38,
    hedgeSide: "NO",
    hedgeRatio: 0.52,
    protectionPct: 58,
    outcomeUp: 2840,
    outcomeUpPct: "+5.6%",
    outcomeDown: -1120,
    outcomeDownPct: "-2.2%",
    quoteRows: [
      { venue: "Polymarket", yes: 43, no: 57, volume: "$9.7M" },
      { venue: "Kalshi", yes: 44, no: 56, volume: "$2.7M" },
    ],
    sparkUp: spark([9, 11, 10, 14, 16, 15, 18, 19, 17, 21, 22, 23, 25, 24, 27, 29, 31, 32]),
    sparkDown: spark([31, 30, 29, 27, 26, 25, 27, 23, 21, 22, 19, 18, 16, 15, 14, 13, 12, 10]),
  },
  {
    id: "hormuz-blockade-2026",
    title: "Strait of Hormuz blockade 2026",
    category: "Geopolitics",
    assetSymbols: ["LMT"],
    icon: "anchor",
    probability: 17,
    yes: 17,
    no: 83,
    volume: "$900K",
    venue: "Kalshi",
    bestYesVenue: "Kalshi",
    bestNoVenue: "Polymarket",
    correlation: 0.44,
    hedgeSide: "NO",
    hedgeRatio: 0.34,
    protectionPct: 49,
    outcomeUp: 2210,
    outcomeUpPct: "+4.4%",
    outcomeDown: -2060,
    outcomeDownPct: "-4.1%",
    quoteRows: [
      { venue: "Kalshi", yes: 17, no: 83, volume: "$610K" },
      { venue: "Polymarket", yes: 18, no: 82, volume: "$290K" },
    ],
    sparkUp: spark([4, 4, 6, 5, 7, 8, 10, 9, 11, 12, 11, 14, 15, 14, 17, 19, 18, 22]),
    sparkDown: spark([26, 25, 23, 22, 21, 19, 18, 17, 16, 14, 15, 13, 12, 11, 10, 8, 7, 6]),
  },
  {
    id: "iphone-shipments-240m",
    title: "Apple ships more than 240M iPhones in 2026",
    category: "Consumer demand",
    assetSymbols: ["AAPL"],
    icon: "building",
    probability: 48,
    yes: 48,
    no: 52,
    volume: "$680K",
    venue: "Kalshi",
    bestYesVenue: "Kalshi",
    bestNoVenue: "Polymarket",
    correlation: 0.52,
    hedgeSide: "NO",
    hedgeRatio: 0.42,
    protectionPct: 51,
    outcomeUp: 1910,
    outcomeUpPct: "+8.1%",
    outcomeDown: -690,
    outcomeDownPct: "-2.9%",
    quoteRows: [
      { venue: "Kalshi", yes: 48, no: 52, volume: "$410K" },
      { venue: "Polymarket", yes: 47, no: 53, volume: "$270K" },
    ],
    sparkUp: spark([5, 7, 6, 10, 12, 13, 12, 15, 17, 16, 20, 22, 21, 24, 26, 25, 28, 30]),
    sparkDown: spark([24, 23, 21, 20, 18, 17, 16, 15, 13, 15, 12, 11, 9, 8, 7, 8, 6, 5]),
  },
  {
    id: "eu-dma-apple-fine",
    title: "EU levies major DMA fine against Apple",
    category: "Regulatory",
    assetSymbols: ["AAPL"],
    icon: "file",
    probability: 22,
    yes: 22,
    no: 78,
    volume: "$1.8M",
    venue: "Polymarket",
    bestYesVenue: "Polymarket",
    bestNoVenue: "Kalshi",
    correlation: -0.47,
    hedgeSide: "YES",
    hedgeRatio: 0.39,
    protectionPct: 55,
    outcomeUp: 1680,
    outcomeUpPct: "+7.2%",
    outcomeDown: -540,
    outcomeDownPct: "-2.3%",
    quoteRows: [
      { venue: "Polymarket", yes: 22, no: 78, volume: "$1.1M" },
      { venue: "Kalshi", yes: 21, no: 79, volume: "$720K" },
    ],
    sparkUp: spark([3, 5, 8, 9, 11, 10, 14, 15, 17, 19, 18, 20, 23, 22, 25, 27, 29, 31]),
    sparkDown: spark([21, 20, 18, 17, 16, 14, 13, 15, 12, 10, 9, 11, 8, 7, 6, 5, 4, 3]),
  },
  {
    id: "ai-chip-export-controls",
    title: "US expands AI chip export controls",
    category: "Semiconductor policy",
    assetSymbols: ["NVDA", "AMD"],
    icon: "cpu",
    probability: 31,
    yes: 31,
    no: 69,
    volume: "$3.6M",
    venue: "Polymarket",
    bestYesVenue: "Polymarket",
    bestNoVenue: "Kalshi",
    correlation: -0.62,
    hedgeSide: "YES",
    hedgeRatio: 0.61,
    protectionPct: 64,
    outcomeUp: 2870,
    outcomeUpPct: "+11.1%",
    outcomeDown: -920,
    outcomeDownPct: "-3.5%",
    quoteRows: [
      { venue: "Polymarket", yes: 31, no: 69, volume: "$2.3M" },
      { venue: "Kalshi", yes: 30, no: 70, volume: "$1.3M" },
    ],
    sparkUp: spark([6, 8, 7, 11, 13, 15, 14, 18, 22, 21, 25, 28, 30, 29, 34, 36, 37, 41]),
    sparkDown: spark([42, 39, 38, 34, 32, 30, 28, 26, 27, 23, 21, 20, 18, 16, 15, 12, 10, 8]),
  },
  {
    id: "blackwell-supply-delay",
    title: "Blackwell supply constraints persist through Q4",
    category: "Supply chain",
    assetSymbols: ["NVDA"],
    icon: "cpu",
    probability: 36,
    yes: 36,
    no: 64,
    volume: "$2.4M",
    venue: "Kalshi",
    bestYesVenue: "Kalshi",
    bestNoVenue: "Polymarket",
    correlation: -0.54,
    hedgeSide: "YES",
    hedgeRatio: 0.48,
    protectionPct: 57,
    outcomeUp: 3010,
    outcomeUpPct: "+11.6%",
    outcomeDown: -1240,
    outcomeDownPct: "-4.8%",
    quoteRows: [
      { venue: "Kalshi", yes: 36, no: 64, volume: "$1.5M" },
      { venue: "Polymarket", yes: 37, no: 63, volume: "$900K" },
    ],
    sparkUp: spark([7, 8, 10, 9, 12, 15, 17, 16, 21, 23, 24, 26, 27, 30, 32, 31, 35, 37]),
    sparkDown: spark([40, 38, 36, 35, 32, 30, 29, 26, 24, 22, 21, 19, 18, 16, 14, 13, 11, 9]),
  },
  {
    id: "ai-antitrust-cloud",
    title: "US opens cloud AI antitrust case",
    category: "Regulatory",
    assetSymbols: ["MSFT"],
    icon: "file",
    probability: 27,
    yes: 27,
    no: 73,
    volume: "$1.4M",
    venue: "Kalshi",
    bestYesVenue: "Kalshi",
    bestNoVenue: "Polymarket",
    correlation: -0.43,
    hedgeSide: "YES",
    hedgeRatio: 0.44,
    protectionPct: 53,
    outcomeUp: 2270,
    outcomeUpPct: "+5.8%",
    outcomeDown: -980,
    outcomeDownPct: "-2.5%",
    quoteRows: [
      { venue: "Kalshi", yes: 27, no: 73, volume: "$830K" },
      { venue: "Polymarket", yes: 28, no: 72, volume: "$570K" },
    ],
    sparkUp: spark([4, 6, 7, 9, 8, 11, 14, 13, 15, 17, 19, 18, 21, 24, 23, 25, 27, 29]),
    sparkDown: spark([26, 24, 22, 21, 19, 18, 16, 15, 16, 13, 12, 10, 9, 8, 7, 6, 5, 4]),
  },
  {
    id: "datacenter-power-constraint",
    title: "AI datacenter power constraints worsen in 2026",
    category: "Infrastructure",
    assetSymbols: ["MSFT", "NVDA", "AMD"],
    icon: "building",
    probability: 34,
    yes: 34,
    no: 66,
    volume: "$2.8M",
    venue: "Kalshi / Polymarket",
    bestYesVenue: "Kalshi",
    bestNoVenue: "Polymarket",
    correlation: -0.39,
    hedgeSide: "YES",
    hedgeRatio: 0.41,
    protectionPct: 50,
    outcomeUp: 2140,
    outcomeUpPct: "+6.4%",
    outcomeDown: -880,
    outcomeDownPct: "-2.6%",
    quoteRows: [
      { venue: "Kalshi", yes: 34, no: 66, volume: "$1.6M" },
      { venue: "Polymarket", yes: 35, no: 65, volume: "$1.2M" },
    ],
    sparkUp: spark([5, 6, 8, 8, 11, 13, 12, 16, 18, 19, 22, 23, 25, 27, 29, 30, 31, 34]),
    sparkDown: spark([32, 31, 29, 28, 27, 24, 22, 20, 21, 18, 16, 15, 14, 12, 10, 9, 8, 7]),
  },
  {
    id: "cloud-growth-below-15",
    title: "US cloud spending growth below 15% in 2026",
    category: "Enterprise software",
    assetSymbols: ["MSFT"],
    icon: "macro",
    probability: 29,
    yes: 29,
    no: 71,
    volume: "$960K",
    venue: "Polymarket",
    bestYesVenue: "Polymarket",
    bestNoVenue: "Kalshi",
    correlation: -0.46,
    hedgeSide: "YES",
    hedgeRatio: 0.36,
    protectionPct: 47,
    outcomeUp: 1840,
    outcomeUpPct: "+4.7%",
    outcomeDown: -760,
    outcomeDownPct: "-1.9%",
    quoteRows: [
      { venue: "Polymarket", yes: 29, no: 71, volume: "$610K" },
      { venue: "Kalshi", yes: 28, no: 72, volume: "$350K" },
    ],
    sparkUp: spark([4, 5, 6, 8, 9, 10, 12, 11, 14, 16, 17, 19, 20, 22, 23, 25, 27, 29]),
    sparkDown: spark([24, 23, 22, 19, 18, 17, 16, 15, 13, 14, 11, 10, 9, 8, 7, 6, 5, 4]),
  },
  {
    id: "advanced-packaging-shortage",
    title: "Advanced packaging shortage persists through 2026",
    category: "Semiconductor supply",
    assetSymbols: ["AMD", "NVDA"],
    icon: "cpu",
    probability: 41,
    yes: 41,
    no: 59,
    volume: "$1.7M",
    venue: "Kalshi",
    bestYesVenue: "Kalshi",
    bestNoVenue: "Polymarket",
    correlation: -0.51,
    hedgeSide: "YES",
    hedgeRatio: 0.45,
    protectionPct: 56,
    outcomeUp: 2360,
    outcomeUpPct: "+10.2%",
    outcomeDown: -840,
    outcomeDownPct: "-3.6%",
    quoteRows: [
      { venue: "Kalshi", yes: 41, no: 59, volume: "$1.0M" },
      { venue: "Polymarket", yes: 40, no: 60, volume: "$700K" },
    ],
    sparkUp: spark([5, 7, 8, 11, 10, 13, 15, 17, 18, 20, 23, 25, 24, 28, 31, 33, 36, 39]),
    sparkDown: spark([35, 33, 30, 28, 27, 25, 24, 22, 19, 18, 17, 14, 13, 11, 10, 8, 7, 6]),
  },
];

const timeframes = ["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "5Y", "All"];


const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatSignedCurrency = (value: number) =>
  `${value >= 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;

function defaultCompareIds(symbol: string, recommendedMarketId?: string) {
  return riskMarkets
    .filter(
      (market) =>
        market.assetSymbols.includes(symbol) &&
        (!recommendedMarketId || market.id !== recommendedMarketId),
    )
    .slice(0, 2)
    .map((market) => market.id);
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border border-[var(--border-soft)] bg-white px-2.5 text-[12px] font-semibold text-[var(--text-secondary)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function AssetLogo({ symbol, selected = false }: { symbol: string; selected?: boolean }) {
  if (symbol === "AAPL") {
    return (
      <span className="flex size-9 items-center justify-center rounded-full bg-[#050505] text-white">
        <Apple className="size-[19px]" fill="currentColor" strokeWidth={1.5} />
      </span>
    );
  }
  if (symbol === "NVDA") {
    return (
      <span className="flex size-9 items-center justify-center rounded-full bg-[#050505]">
        <Cpu className="size-[18px] text-[#76B900]" strokeWidth={2.1} />
      </span>
    );
  }
  if (symbol === "LMT") {
    return (
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full",
          selected ? "bg-[#E9EEFF]" : "bg-[#EEF2FF]",
        )}
      >
        <ShieldCheck className="size-[18px] text-[#2F5FAC]" strokeWidth={2} />
      </span>
    );
  }
  if (symbol === "MSFT") {
    return (
      <span className="grid size-9 grid-cols-2 gap-[3px] rounded-[8px] bg-white p-1.5 shadow-[inset_0_0_0_1px_#E7EAF0]">
        <span className="bg-[#F25022]" />
        <span className="bg-[#7FBA00]" />
        <span className="bg-[#00A4EF]" />
        <span className="bg-[#FFB900]" />
      </span>
    );
  }
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-[#050505] text-[10px] font-bold text-white">
      AMD
    </span>
  );
}

function RiskIcon({ icon, bare = false }: { icon: RiskMarket["icon"]; bare?: boolean }) {
  const icons = {
    landmark: Landmark,
    shield: ShieldCheck,
    anchor: Anchor,
    cpu: Cpu,
    building: Building2,
    macro: Gauge,
    file: FileText,
  };
  const Icon = icons[icon];
  if (bare) return <Icon className="size-[17px] text-[#64748B]" strokeWidth={1.9} />;
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-[var(--muted-surface)] text-[#64748B]">
      <Icon className="size-[17px]" strokeWidth={1.9} />
    </span>
  );
}

function AssetSwitcher({
  selectedSymbol,
  onSelect,
  assetList,
}: {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  assetList: Asset[];
}) {
  const currentIndex = assetList.findIndex((a) => a.symbol === selectedSymbol);
  return (
    <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {currentIndex > 0 && (
        <button
          type="button"
          aria-label="Previous asset"
          onClick={() => onSelect(assetList[currentIndex - 1].symbol)}
          className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border-soft)] bg-white text-[#64748B] transition-colors hover:border-[#D8DDF0] hover:text-[var(--text-primary)]"
        >
          <ArrowRight className="size-4 rotate-180" strokeWidth={1.9} />
        </button>
      )}
      {assetList.map((asset) => {
        const selected = asset.symbol === selectedSymbol;
        return (
          <button
            key={asset.symbol}
            type="button"
            onClick={() => onSelect(asset.symbol)}
            className={cn(
              "flex h-[66px] min-w-[190px] items-center gap-3 rounded-[15px] border bg-white px-5 text-left transition-all duration-150",
              selected
                ? "border-[var(--purple)] bg-[#FBFAFF] shadow-[0_0_0_4px_rgba(124,92,255,0.08)]"
                : "border-[var(--border-soft)] hover:-translate-y-0.5 hover:border-[#D6D8FF]",
            )}
          >
            <AssetLogo symbol={asset.symbol} selected={selected} />
            <span>
              <span className="block text-[14px] font-bold text-[var(--text-primary)]">
                {asset.symbol}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-[12px] font-medium",
                  selected ? "text-[var(--purple)]" : "text-[var(--text-secondary)]",
                )}
              >
                {asset.name}
              </span>
            </span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("verso:focus-search"))}
        className="flex h-[58px] min-w-[150px] items-center justify-center gap-2 rounded-[13px] border border-[var(--border-soft)] bg-white px-4 text-[13px] font-semibold text-[var(--text-primary)] transition-colors hover:border-[#D6D8FF] hover:bg-[#FBFAFF]"
      >
        <Plus className="size-4" strokeWidth={2} />
        Add asset
      </button>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number | string; payload?: { t: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const dateLabel = payload[0]?.payload?.t || label || "";
  return (
    <div className="rounded-[10px] border border-[#ececec] bg-white px-3 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      {dateLabel && (
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">{dateLabel}</div>
      )}
      <div className="text-[13px] font-bold text-[#0a0a0a]">
        {formatCurrency(Number(payload[0].value))}
      </div>
    </div>
  );
}

function AssetChartCard({ asset }: { asset: Asset }) {
  const [activeFrame, setActiveFrame] = React.useState("1Y");
  const [watched, setWatched] = React.useState(false);

  return (
    <Card className="overflow-hidden rounded-[20px] border border-[var(--border-soft)] bg-white shadow-none">
      <CardHeader className="border-b border-[var(--border-soft)] px-5 py-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
              {asset.name.replace(" Inc.", "")}
            </h2>
            <span className="text-[12px] font-semibold text-[#66718A]">
              {asset.symbol} · {asset.exchange}
            </span>
          </div>
          <div className="mt-2 text-[13px] font-medium text-[var(--text-secondary)]">
            {asset.sector}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-[11px] border-[var(--border-soft)] bg-white px-3 text-[12px] font-semibold hover:bg-[var(--muted-surface)]"
          >
            View asset
            <ExternalLink className="size-3.5" strokeWidth={1.9} />
          </Button>
          <button
            type="button"
            aria-label="Watch asset"
            onClick={() => setWatched((value) => !value)}
            className={cn(
              "flex size-9 items-center justify-center rounded-[11px] border border-[#ececec] transition-colors",
              watched ? "bg-[#f0f0f0] text-[#0a0a0a]" : "bg-white text-[#a3a3a3] hover:bg-[#f5f5f5]",
            )}
          >
            <Star className="size-4" fill={watched ? "currentColor" : "none"} strokeWidth={1.9} />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-1.5">
          {timeframes.map((frame) => (
            <button
              key={frame}
              type="button"
              onClick={() => setActiveFrame(frame)}
              className={cn(
                "h-7 rounded-full px-3 text-[12px] font-semibold transition-colors duration-150",
                activeFrame === frame
                  ? "bg-[#f0f0f0] text-[#0a0a0a]"
                  : "text-[#a3a3a3] hover:text-[#0a0a0a]",
              )}
            >
              {frame}
            </button>
          ))}
        </div>

        <div className="relative h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={asset.chart} margin={{ top: 12, right: 44, left: 4, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="0" />
              <XAxis
                dataKey="t"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fill: "#a3a3a3", fontSize: 10, fontWeight: 500 }}
                padding={{ left: 8, right: 8 }}
              />
              <YAxis
                orientation="right"
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 20", "dataMax + 20"]}
                tick={{ fill: "#737373", fontSize: 10, fontWeight: 500 }}
                width={42}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "#0a0a0a", strokeWidth: 1, strokeDasharray: "4 2" }}
              />
              <ReferenceLine
                y={asset.price}
                stroke="#d1d5db"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#0a0a0a"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 2, fill: "#0a0a0a" }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
          <div className="absolute right-[46px] top-[48%] rounded-[6px] border border-[#ececec] bg-white px-2 py-0.5 text-[11px] font-bold text-[#0a0a0a]">
            {asset.price.toFixed(2)}
          </div>
        </div>

        <div className="mt-5 border-t border-[#f0f0f0] pt-4">
          <div className="grid grid-cols-5 gap-x-3 gap-y-1">
            {[
              ["Market cap", asset.metrics.marketCap],
              ["P/E ratio", asset.metrics.pe],
              ["52W range", asset.metrics.range52w],
              ["Div. yield", asset.metrics.dividendYield],
              ["Beta (1Y)", asset.metrics.beta],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[10px] text-[#a3a3a3]">{label}</div>
                <div className="mt-0.5 text-[12px] font-semibold text-[#0a0a0a]">{value}</div>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

/* ── Arc probability gauge with embedded label ── */
function ArcGauge({ pct, bearish }: { pct: number; bearish?: boolean }) {
  const r = 18, cx = 22, cy = 22;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <svg viewBox="0 0 44 27" className="w-[52px]">
      <path d={arc} fill="none" stroke="#f0f0f0" strokeWidth="3.5" strokeLinecap="round" pathLength={100} />
      <path
        d={arc} fill="none"
        stroke={bearish ? "#ef4444" : "#22c55e"}
        strokeWidth="3.5" strokeLinecap="round"
        pathLength={100} strokeDasharray={`${pct} 100`}
      />
      <text x="22" y="16" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#0a0a0a" fontFamily="inherit">{pct}%</text>
      <text x="22" y="24" textAnchor="middle" fontSize="6" fill="#a3a3a3" fontFamily="inherit">chance</text>
    </svg>
  );
}

function MarketCard({
  market,
  recommended,
  onHedge,
}: {
  market: RiskMarket;
  recommended: boolean;
  onHedge: () => void;
}) {
  const bearish = market.correlation < 0;
  return (
    <div className="rounded-[10px] bg-[#f8f8f8] p-3">
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[7px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <RiskIcon icon={market.icon} bare />
        </span>
        <p className="flex-1 text-[12px] font-semibold leading-snug text-[#0a0a0a]">
          {market.title}
        </p>
        <ArcGauge pct={market.probability} bearish={bearish} />
      </div>
      <div className="mt-2 flex gap-1.5">
        <button
          type="button"
          className="flex-1 rounded-[6px] bg-[#dcfce7] py-1.5 text-[11px] font-semibold text-[#16a34a] transition-colors hover:bg-[#bbf7d0]"
        >
          Yes {market.yes}¢
        </button>
        <button
          type="button"
          className="flex-1 rounded-[6px] bg-[#fee2e2] py-1.5 text-[11px] font-semibold text-[#dc2626] transition-colors hover:bg-[#fecaca]"
        >
          No {market.no}¢
        </button>
      </div>
      <button
        type="button"
        onClick={onHedge}
        className="mt-2 flex h-8 w-full items-center justify-center rounded-[7px] bg-white border border-[#ececec] text-[11px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
      >
        Hedge →
      </button>
    </div>
  );
}

function RiskMarketsCard({
  assetSymbol,
  markets,
  activeMarketId,
  onSelectHedge,
  onBrowse,
}: {
  assetSymbol: string;
  markets: RiskMarket[];
  activeMarketId: string;
  onSelectHedge: (id: string) => void;
  onBrowse: () => void;
}) {
  return (
    <div className="flex h-full flex-col rounded-[18px] border border-[#ececec] bg-white p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7B849A]">
        Correlated prediction markets · {assetSymbol}
      </p>
      <div className="flex flex-1 flex-col gap-2">
        {markets.map((market, i) => (
          <MarketCard
            key={market.id}
            market={market}
            recommended={i === 0}
            onHedge={() => onSelectHedge(market.id)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-3 flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-[10px] border border-[#ececec] text-[13px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#fafafa]"
      >
        Browse all risk markets
        <ArrowRight className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

function PositionCard({ asset }: { asset: Asset }) {
  return (
    <div className="rounded-[18px] border border-[#ececec] bg-white p-5">
      <p className="text-[13px] font-semibold text-[#0a0a0a]">Your position</p>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-[22px] font-bold tracking-[-0.02em] text-[#0a0a0a]">{asset.symbol}</span>
        <span className="text-[18px] font-bold tracking-[-0.02em] text-[#0a0a0a]">{formatCurrency(asset.position.notional)}</span>
      </div>
      <p className="mt-1 text-[12px] text-[#a3a3a3]">{asset.position.shares} shares · {asset.position.portfolioPct} of portfolio</p>
      <div className="my-4 border-t border-[#f0f0f0]" />
      <div className="space-y-3">
        {[
          ["Avg. price", formatCurrency(asset.position.avgPrice), "neutral"],
          ["Unrealized P&L", `${formatSignedCurrency(asset.position.pnl)} (${asset.position.pnlPct})`, asset.position.pnl >= 0 ? "green" : "red"],
          ["Volatility (1Y)", asset.position.volatility, "neutral"],
        ].map(([label, value, color]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[12px] text-[#737373]">{label}</span>
            <span className={cn("text-[13px] font-semibold", color === "green" ? "text-[#16a34a]" : color === "red" ? "text-[#dc2626]" : "text-[#0a0a0a]")}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendedHedgeCard({
  market,
  applied,
  onApply,
}: {
  market: RiskMarket;
  applied: boolean;
  onApply: () => void;
}) {
  const protectedProbability = market.hedgeSide === "NO" ? market.no : market.yes;

  return (
    <div className="rounded-[18px] border border-[#ececec] bg-white p-5">
      <p className="text-[13px] font-semibold text-[#0a0a0a]">Recommended hedge</p>
      <div className="mt-4 space-y-3">
        {[
          ["Hedge ratio", market.hedgeRatio.toFixed(2), "neutral"],
          ["Hedge side", market.hedgeSide, "neutral"],
          ["Protection", `~${market.protectionPct}%`, "green"],
          ["Probability", `${protectedProbability}%`, "neutral"],
          ["Market", market.title, "neutral"],
        ].map(([label, value, color]) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <span className="text-[12px] text-[#737373]">{label}</span>
            <span className={cn("text-right text-[13px] font-semibold leading-snug", color === "green" ? "text-[#16a34a]" : "text-[#0a0a0a]")}>{value}</span>
          </div>
        ))}
      </div>
      <div className="my-4 border-t border-[#f0f0f0]" />
      <button
        type="button"
        onClick={onApply}
        className={cn(
          "flex h-9 w-full items-center justify-center gap-2 rounded-[9px] text-[12px] font-semibold transition-opacity hover:opacity-80",
          applied ? "bg-[#e5e5e5] text-[#737373]" : "bg-[#f0f0f0] text-[#0a0a0a] hover:bg-[#e5e5e5]",
        )}
      >
        {applied ? <CheckCircle2 className="size-3.5" /> : <Zap className="size-3.5" fill="currentColor" />}
        {applied ? "Hedge applied" : "Apply hedge"}
      </button>
    </div>
  );
}

function ProjectedOutcomesCard({ market }: { market: RiskMarket }) {
  return (
    <div className="rounded-[18px] border border-[#ececec] bg-white p-5">
      <p className="text-[13px] font-semibold text-[#0a0a0a]">Projected outcomes</p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#737373]">Event happens</span>
          <span className="text-[13px] font-semibold text-[#16a34a]">
            {formatSignedCurrency(market.outcomeUp).replace(".00", "")}
            <span className="ml-1.5 text-[12px]">{market.outcomeUpPct}</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#737373]">Event doesn&apos;t happen</span>
          <span className="text-[13px] font-semibold text-[#dc2626]">
            {formatSignedCurrency(market.outcomeDown).replace(".00", "")}
            <span className="ml-1.5 text-[12px]">{market.outcomeDownPct}</span>
          </span>
        </div>
        <div className="my-1 border-t border-[#f0f0f0]" />
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#737373]">Hedge side</span>
          <span className="text-[13px] font-semibold text-[#0a0a0a]">{market.hedgeSide}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#737373]">Correlation</span>
          <span className="text-[13px] font-semibold text-[#0a0a0a]">{market.correlation > 0 ? "+" : ""}{market.correlation.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#737373]">Protection</span>
          <span className="text-[13px] font-semibold text-[#16a34a]">~{market.protectionPct}%</span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  market,
  asset,
  onOpenAnalysis,
}: {
  market: RiskMarket;
  asset: Asset;
  onOpenAnalysis: () => void;
}) {
  const hedgeNotional = asset.position.notional * market.hedgeRatio;
  const netCost = asset.position.notional + hedgeNotional * (market.hedgeSide === "NO" ? market.no : market.yes) / 100;
  const potentialReturn = (Math.max(market.outcomeUp, 0) / netCost) * 100 + 5.7;

  return (
    <div className="rounded-[18px] border border-[#ececec] bg-white p-5">
      <p className="text-[13px] font-semibold text-[#0a0a0a]">Summary</p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#737373]">Net cost</span>
          <span className="text-[13px] font-semibold text-[#0a0a0a]">
            {asset.symbol === "LMT" && market.id === "fed-rate-cut-july" ? "$29,380" : formatCurrency(netCost)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#737373]">Potential return</span>
          <span className="text-[13px] font-semibold text-[#16a34a]">
            {asset.symbol === "LMT" && market.id === "fed-rate-cut-july" ? "+14.2%" : `+${potentialReturn.toFixed(1)}%`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#737373]">Hedge ratio</span>
          <span className="text-[13px] font-semibold text-[#0a0a0a]">{market.hedgeRatio.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#737373]">Volume</span>
          <span className="text-[13px] font-semibold text-[#0a0a0a]">{market.volume}</span>
        </div>
      </div>
      <div className="my-4 border-t border-[#f0f0f0]" />
      <button
        type="button"
        onClick={onOpenAnalysis}
        className="flex h-9 w-full items-center justify-center gap-1.5 rounded-[9px] border border-[#ececec] bg-white text-[12px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
      >
        View full analysis
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}


function MarketBrowserModal({
  open,
  markets,
  activeMarketId,
  onClose,
  onSelect,
  onToggleCompare,
  compareIds,
}: {
  open: boolean;
  markets: RiskMarket[];
  activeMarketId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
  onToggleCompare: (id: string) => void;
  compareIds: string[];
}) {
  const [query, setQuery] = React.useState("");
  const [venue, setVenue] = React.useState("All");

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return markets.filter((market) => {
      const matchesQuery = `${market.title} ${market.category} ${market.venue}`
        .toLowerCase()
        .includes(q);
      const matchesVenue = venue === "All" || market.venue.toLowerCase().includes(venue.toLowerCase());
      return matchesQuery && matchesVenue;
    });
  }, [markets, query, venue]);

  const active = markets.find((market) => market.id === activeMarketId) ?? markets[0];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F172A]/18 p-6 backdrop-blur-[2px]">
      <div className="ml-[220px] flex h-full items-center justify-center">
        <div className="grid max-h-[86vh] w-full max-w-[1120px] grid-cols-[1fr_360px] overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
          <div className="min-w-0 border-r border-[var(--border-soft)]">
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-5 py-4">
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                  Browse all risk markets
                </h2>
                <p className="mt-1 text-[12px] font-medium text-[var(--text-secondary)]">
                  Compare Kalshi and Polymarket quotes before applying a hedge.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-full border border-[var(--border-soft)] text-[#64748B] hover:bg-[var(--muted-surface)]"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-[var(--border-soft)] px-5 py-3">
              <div className="relative flex-1">
                <SearchCheck className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search prediction markets..."
                  className="h-10 w-full rounded-[12px] border border-[var(--border-soft)] bg-[var(--muted-surface)]/70 pl-10 pr-3 text-[13px] font-medium outline-none focus:border-[#D8D2FF] focus:bg-white focus:ring-4 focus:ring-[#7C5CFF]/10"
                />
              </div>
              <div className="flex gap-1 rounded-[12px] bg-[var(--muted-surface)] p-1">
                {["All", "Kalshi", "Polymarket"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setVenue(item)}
                    className={cn(
                      "h-8 rounded-[9px] px-3 text-[12px] font-bold transition-colors",
                      venue === item ? "bg-white text-[var(--purple)] shadow-sm" : "text-[#64748B]",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[calc(86vh-154px)] overflow-y-auto p-4">
              <div className="grid gap-2">
                {filtered.map((market) => (
                  <button
                    key={market.id}
                    type="button"
                    onClick={() => onSelect(market.id)}
                    className={cn(
                      "grid grid-cols-[32px_1fr_62px_92px] items-center gap-3 rounded-[14px] border px-3 py-3 text-left transition-colors",
                      activeMarketId === market.id
                        ? "border-[#D8D2FF] bg-[#FBFAFF]"
                        : "border-[var(--border-soft)] bg-white hover:border-[#D8D2FF]",
                    )}
                  >
                    <RiskIcon icon={market.icon} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-[var(--text-primary)]">
                        {market.title}
                      </span>
                      <span className="mt-1 block truncate text-[11px] font-semibold text-[var(--text-secondary)]">
                        {market.category} · {market.venue} · {market.volume} vol
                      </span>
                    </span>
                    <span
                      className={cn(
                        "text-right text-[15px] font-bold",
                        market.probability >= 50 ? "text-[var(--positive)]" : "text-[var(--negative)]",
                      )}
                    >
                      {market.probability}%
                    </span>
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleCompare(market.id);
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-center text-[11px] font-bold",
                        compareIds.includes(market.id)
                          ? "border-[#D8D2FF] bg-[var(--purple-light)] text-[var(--purple)]"
                          : "border-[var(--border-soft)] text-[var(--text-secondary)]",
                      )}
                    >
                      Compare
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="bg-[#FBFCFF] p-5">
            <div className="flex items-center justify-between">
              <Badge className="border-[#D8D2FF] bg-white text-[var(--purple)]">
                {active?.venue ?? "Kalshi / Polymarket"}
              </Badge>
              <Link
                href="/markets"
                className="flex items-center gap-1 text-[12px] font-bold text-[var(--purple)]"
              >
                Markets page
                <ExternalLink className="size-3.5" />
              </Link>
            </div>

            {active ? (
              <>
                <h3 className="mt-5 text-[18px] font-semibold leading-snug tracking-[-0.01em] text-[var(--text-primary)]">
                  {active.title}
                </h3>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-[13px] border border-[var(--border-soft)] bg-white p-3">
                    <div className="text-[11px] font-semibold text-[var(--text-muted)]">Yes</div>
                    <div className="mt-1 text-[18px] font-bold text-[var(--positive)]">
                      {active.yes}¢
                    </div>
                  </div>
                  <div className="rounded-[13px] border border-[var(--border-soft)] bg-white p-3">
                    <div className="text-[11px] font-semibold text-[var(--text-muted)]">No</div>
                    <div className="mt-1 text-[18px] font-bold text-[var(--negative)]">
                      {active.no}¢
                    </div>
                  </div>
                  <div className="rounded-[13px] border border-[var(--border-soft)] bg-white p-3">
                    <div className="text-[11px] font-semibold text-[var(--text-muted)]">Hedge</div>
                    <div className="mt-1 text-[18px] font-bold text-[var(--purple)]">
                      {active.hedgeRatio.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[15px] border border-[var(--border-soft)] bg-white p-4">
                  <div className="mb-3 text-[12px] font-bold text-[var(--text-primary)]">
                    Venue quotes
                  </div>
                  <div className="space-y-2">
                    {active.quoteRows.map((row) => (
                      <div
                        key={row.venue}
                        className="grid grid-cols-[1fr_44px_44px_58px] items-center gap-2 rounded-[10px] bg-[var(--muted-surface)] px-3 py-2 text-[11px] font-semibold"
                      >
                        <span className="text-[var(--text-primary)]">{row.venue}</span>
                        <span className="text-[var(--positive)]">{row.yes}¢</span>
                        <span className="text-[var(--negative)]">{row.no}¢</span>
                        <span className="text-right text-[var(--text-secondary)]">{row.volume}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-[15px] border border-[#E6E1FF] bg-white p-4">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-[var(--text-primary)]">
                    <Sparkles className="size-4 text-[var(--purple)]" />
                    Recommended action
                  </div>
                  <p className="mt-3 text-[13px] font-medium leading-6 text-[var(--text-secondary)]">
                    Buy {active.hedgeSide} with a {active.hedgeRatio.toFixed(2)} hedge ratio to
                    reduce modeled downside by ~{active.protectionPct}%.
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      onSelect(active.id);
                      onClose();
                    }}
                    className="mt-4 h-10 w-full rounded-[12px] bg-[var(--purple)] text-[13px] font-semibold hover:bg-[#6C4DF1]"
                  >
                    Use this hedge
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}

function HeaderIntro() {
  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.025em] text-[var(--text-primary)]">
        Build your hedged position
      </h1>
      <p className="mt-2 max-w-[820px] text-[14px] font-medium leading-6 text-[var(--text-secondary)]">
        Combine traditional assets with prediction markets to express your view and hedge
        real-world risks.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = React.useState("LMT");
  const [activeMarketId, setActiveMarketId] = React.useState("fed-rate-cut-july");
  const [compareIds, setCompareIds] = React.useState<string[]>([
    "defense-budget-900",
    "republicans-2026",
  ]);
  const [browseOpen, setBrowseOpen] = React.useState(false);
  const [appliedMarketId, setAppliedMarketId] = React.useState<string | null>(null);

  // ── User-added stocks ─────────────────────────────────────────────────────
  const [extraAssets, setExtraAssets] = React.useState<Asset[]>([]);

  // ── Live data patches ──────────────────────────────────────────────────────
  const [livePrices, setLivePrices] = React.useState<Record<string, { price: number; changePct: number; direction: "up" | "down" }>>({});
  const [liveMarketProbs, setLiveMarketProbs] = React.useState<Record<string, { yes: number; no: number; probability: number; venue: string }>>({});

  React.useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.json())
      .then(setLivePrices)
      .catch(() => {});

    fetch("/api/risk-markets")
      .then((r) => r.json())
      .then((markets: Array<{ id: string; yes: number; no: number; probability: number; venue: string; title: string }>) => {
        const map: Record<string, { yes: number; no: number; probability: number; venue: string }> = {};
        for (const m of markets) map[m.id] = { yes: m.yes, no: m.no, probability: m.probability, venue: m.venue };
        setLiveMarketProbs(map);
      })
      .catch(() => {});
  }, []);

  // Merge live prices into assets (base + user-added)
  const patchedAssets = React.useMemo(() =>
    [...assets, ...extraAssets].map((a) => {
      const live = livePrices[a.symbol];
      if (!live) return a;
      return { ...a, price: live.price, position: { ...a.position, avgPrice: live.price, notional: live.price * a.position.shares, pnl: (live.price - a.position.avgPrice) * a.position.shares } };
    }),
  [livePrices, extraAssets]);

  // Merge live probabilities into riskMarkets
  const patchedMarkets = React.useMemo(() =>
    riskMarkets.map((m) => {
      const live = liveMarketProbs[m.id];
      if (!live) return m;
      return { ...m, probability: live.probability, yes: live.yes, no: live.no, venue: live.venue };
    }),
  [liveMarketProbs]);

  const selectedAsset = patchedAssets.find((asset) => asset.symbol === selectedSymbol) ?? patchedAssets[2];

  const matchedRiskMarkets = patchedMarkets.filter(
    (market) =>
      market.assetSymbols.includes(selectedAsset.symbol) &&
      !(selectedAsset.symbol === "LMT" && market.id === "fed-rate-cut-july"),
  );
  const visibleRiskMarkets = (matchedRiskMarkets.length > 0 ? matchedRiskMarkets : patchedMarkets).slice(0, 3);

  const activeMarket =
    patchedMarkets.find((market) => market.id === activeMarketId) ??
    patchedMarkets.find((market) => market.id === selectedAsset.recommendedMarketId) ??
    patchedMarkets[0];

  // Add a brand-new stock from the search bar with live Alpaca price
  const addAssetBySymbol = React.useCallback(async (symbol: string) => {
    const meta = STOCKS_DB.find((s) => s.symbol === symbol);

    // Fetch price + historical bars in parallel
    const [priceData, barsData] = await Promise.all([
      fetch(`/api/prices?symbols=${symbol}`).then((r) => r.json()).catch(() => ({})),
      fetch(`/api/bars?symbol=${symbol}`).then((r) => r.json()).catch(() => []),
    ]);

    const price: number = priceData[symbol]?.price ?? 100;
    const closes: number[] = Array.isArray(barsData) && barsData.length >= 2 ? barsData : Array(34).fill(price);
    const chartData = chart(closes);

    const newAsset: Asset = {
      symbol,
      name: meta?.name ?? symbol,
      exchange: meta?.exchange ?? "NASDAQ",
      sector: meta?.sector ?? "Equities",
      price,
      accent: "#7C5CFF",
      chart: chartData,
      metrics: { marketCap: "—", pe: "—", range52w: "—", dividendYield: "—", beta: "—" },
      position: {
        shares: 100,
        notional: price * 100,
        portfolioPct: "—",
        avgPrice: price,
        pnl: 0,
        pnlPct: "+0.00%",
        volatility: "—",
      },
      recommendedMarketId: riskMarkets[0]?.id ?? "fed-rate-cut-july",
    };

    setExtraAssets((prev) => {
      if (prev.some((a) => a.symbol === symbol)) return prev;
      return [...prev, newAsset];
    });
    setSelectedSymbol(symbol);
    setActiveMarketId(riskMarkets[0]?.id ?? "fed-rate-cut-july");
    setCompareIds(defaultCompareIds(symbol, riskMarkets[0]?.id ?? "fed-rate-cut-july"));
    setAppliedMarketId(null);
  }, []);

  const selectAsset = React.useCallback((symbol: string) => {
    const nextAsset = patchedAssets.find((asset) => asset.symbol === symbol);
    if (!nextAsset) {
      addAssetBySymbol(symbol);
      return;
    }
    setSelectedSymbol(nextAsset.symbol);
    setActiveMarketId(nextAsset.recommendedMarketId);
    setCompareIds(defaultCompareIds(nextAsset.symbol, nextAsset.recommendedMarketId));
    setAppliedMarketId(null);
  }, [patchedAssets, addAssetBySymbol]);

  React.useEffect(() => {
    const onAsset = (event: Event) => {
      const symbol = (event as CustomEvent<{ symbol?: string }>).detail?.symbol;
      if (symbol) selectAsset(symbol);
    };
    const onMarket = (event: Event) => {
      const marketId = (event as CustomEvent<{ marketId?: string }>).detail?.marketId;
      const market = patchedMarkets.find((item) => item.id === marketId);
      if (!market) return;
      setActiveMarketId(market.id);
      if (!market.assetSymbols.includes(selectedSymbol)) {
        const nextSymbol = market.assetSymbols[0];
        setSelectedSymbol(nextSymbol);
        setCompareIds(defaultCompareIds(nextSymbol, market.id));
      }
      setAppliedMarketId(null);
      setBrowseOpen(true);
    };
    window.addEventListener("verso:select-asset", onAsset);
    window.addEventListener("verso:select-market", onMarket);
    return () => {
      window.removeEventListener("verso:select-asset", onAsset);
      window.removeEventListener("verso:select-market", onMarket);
    };
  }, [selectAsset, selectedSymbol]);

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id].slice(-3);
    });
  };

  const selectHedge = (id: string) => {
    setActiveMarketId(id);
    setAppliedMarketId(null);
  };

  return (
    <>
      <div className="mx-auto flex max-w-[1540px] flex-col gap-5 px-8 py-6">
        <HeaderIntro />
        <AssetSwitcher selectedSymbol={selectedSymbol} onSelect={selectAsset} assetList={patchedAssets} />

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <AssetChartCard asset={selectedAsset} />
          <RiskMarketsCard
            assetSymbol={selectedAsset.symbol}
            markets={visibleRiskMarkets}
            activeMarketId={activeMarketId}
            onSelectHedge={selectHedge}
            onBrowse={() => setBrowseOpen(true)}
          />
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-4">
          <PositionCard asset={selectedAsset} />
          <RecommendedHedgeCard
            market={activeMarket}
            applied={appliedMarketId === activeMarket.id}
            onApply={() => setAppliedMarketId(activeMarket.id)}
          />
          <ProjectedOutcomesCard market={activeMarket} />
          <SummaryCard
            market={activeMarket}
            asset={selectedAsset}
            onOpenAnalysis={() => setBrowseOpen(true)}
          />
        </div>

      </div>

      <MarketBrowserModal
        open={browseOpen}
        markets={patchedMarkets}
        activeMarketId={activeMarketId}
        compareIds={compareIds}
        onClose={() => setBrowseOpen(false)}
        onSelect={selectHedge}
        onToggleCompare={toggleCompare}
      />
    </>
  );
}
