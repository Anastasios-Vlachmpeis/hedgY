"use client";

import * as React from "react";

const SI_ICONS: Record<string, string> = {
  AAPL: "apple",        NVDA: "nvidia",       MSFT: "microsoft",
  AMD:  "amd",          TSLA: "tesla",        AMZN: "amazon",
  META: "meta",         GOOGL:"google",       GOOG: "google",
  PLTR: "palantir",     NFLX: "netflix",      ADBE: "adobe",
  CRM:  "salesforce",   ORCL: "oracle",       V:    "visa",
  INTC: "intel",        QCOM: "qualcomm",     AVGO: "broadcom",
  ASML: "asml",         MU:   "micron",       AMAT: "appliedmaterials",
  GS:   "goldmansachs", WMT:  "walmart",      UNH:  "unitedhealth",
  JNJ:  "johnson",      PFE:  "pfizer",       JPM:  "jpmorgan",
};

const LETTER_BG: Record<string, string> = {
  LMT: "#1B3A6B", RHM: "#009640", BTC: "#F7931A", ETH: "#627EEA",
  XOM: "#C0131A", BA: "#1E4D8C",
  MS:  "#003087", TSM: "#C0131A", KLAC: "#0033A0",
};

/** Remote logo URLs — fetched by the browser at render time. */
const REMOTE_LOGOS: Record<string, string[]> = {
  LMT: [
    "https://financialmodelingprep.com/image-stock/LMT.png",
    "https://logo.clearbit.com/lockheedmartin.com",
  ],
  RHM: [
    "https://financialmodelingprep.com/image-stock/RHM.png",
    "https://logo.clearbit.com/rheinmetall.com",
  ],
  BTC: ["https://cdn.simpleicons.org/bitcoin/F7931A"],
  ETH: ["https://cdn.simpleicons.org/ethereum/627EEA"],
};

function logoKey(symbol: string): string | null {
  const base = symbol.split("/")[0].toUpperCase();
  return REMOTE_LOGOS[base] ? base : null;
}

function RemoteLogo({ symbol, urls }: { symbol: string; urls: string[] }) {
  const [idx, setIdx] = React.useState(0);
  const base = symbol.split("/")[0].toUpperCase();
  const src = urls[idx];

  if (!src) {
    const bg = LETTER_BG[base] ?? "#0a0a0a";
    return (
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tracking-tight text-white"
        style={{ background: bg }}
      >
        {symbol.slice(0, 2)}
      </span>
    );
  }

  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_0_1.5px_#ececec]">
      <img
        src={src}
        alt={symbol}
        width={22}
        height={22}
        style={{ objectFit: "contain" }}
        onError={() => setIdx((i) => i + 1)}
      />
    </span>
  );
}

function AssetLogo({ symbol }: { symbol: string }) {
  const [err, setErr] = React.useState(false);

  const key = logoKey(symbol);
  if (key) return <RemoteLogo symbol={symbol} urls={REMOTE_LOGOS[key]} />;

  if (symbol === "MSFT") {
    return (
      <span className="grid size-9 shrink-0 grid-cols-2 gap-[3px] rounded-full bg-white p-[9px] shadow-[0_0_0_1.5px_#ececec]">
        <span className="rounded-[1px] bg-[#F25022]" />
        <span className="rounded-[1px] bg-[#7FBA00]" />
        <span className="rounded-[1px] bg-[#00A4EF]" />
        <span className="rounded-[1px] bg-[#FFB900]" />
      </span>
    );
  }

  const siName = SI_ICONS[symbol];
  if (siName && !err) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_0_1.5px_#ececec]">
        <img
          src={`https://cdn.simpleicons.org/${siName}`}
          alt={symbol}
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
          onError={() => setErr(true)}
        />
      </span>
    );
  }

  const bg = LETTER_BG[symbol] ?? "#0a0a0a";
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tracking-tight text-white"
      style={{ background: bg }}
    >
      {symbol.slice(0, 2)}
    </span>
  );
}

export { AssetLogo };
