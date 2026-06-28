// ─────────────────────────────────────────────────────────────────────────────
// SERVER-ONLY asset universe + price data (Alpaca). Used by the /api/search route
// and the asset detail page. Keys stay on the server.
//   - searchAssets(q): fuzzy search across all tradable US equities/ETFs + crypto
//   - getAsset(symbol): snapshot price/change + ~6mo daily bars for the chart
// Indices aren't on Alpaca's free tier → use ETF proxies (SPY, QQQ, DIA, IWM).
// ─────────────────────────────────────────────────────────────────────────────

const DATA = "https://data.alpaca.markets";
const TRADING = "https://paper-api.alpaca.markets";
const ALP = {
  headers: {
    "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID ?? "",
    "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY ?? "",
  },
  cache: "no-store" as const,
};

export interface AssetRow {
  symbol: string;
  name: string;
  exchange: string;
  cls: "equity" | "crypto";
}

export interface AssetDetail {
  symbol: string;
  name: string;
  cls: "equity" | "crypto";
  price: number;
  changePct: number;
  direction: "up" | "down";
  bars: { t: string; c: number }[];
}

// The asset list is ~14k rows and changes rarely — cache it in-process.
let universe: { at: number; rows: AssetRow[] } | null = null;
const UNIVERSE_TTL = 6 * 60 * 60 * 1000;

async function loadUniverse(): Promise<AssetRow[]> {
  if (universe && Date.now() - universe.at < UNIVERSE_TTL) return universe.rows;
  const [eq, cr] = await Promise.all([
    fetch(`${TRADING}/v2/assets?status=active&asset_class=us_equity`, ALP).then((r) => (r.ok ? r.json() : [])),
    fetch(`${TRADING}/v2/assets?status=active&asset_class=crypto`, ALP).then((r) => (r.ok ? r.json() : [])),
  ]);
  const rows: AssetRow[] = [];
  if (Array.isArray(eq)) for (const a of eq) if (a.tradable) rows.push({ symbol: a.symbol, name: a.name ?? a.symbol, exchange: a.exchange ?? "", cls: "equity" });
  if (Array.isArray(cr)) for (const a of cr) if (a.tradable) rows.push({ symbol: a.symbol, name: a.name ?? a.symbol, exchange: a.exchange ?? "CRYPTO", cls: "crypto" });
  universe = { at: Date.now(), rows };
  return rows;
}

/** Rank: exact symbol > symbol prefix > symbol substring > name substring. */
export async function searchAssets(query: string, limit = 12): Promise<AssetRow[]> {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const rows = await loadUniverse();
  const scored: { row: AssetRow; score: number }[] = [];
  for (const row of rows) {
    const sym = row.symbol.toUpperCase();
    const name = row.name.toUpperCase();
    let score = -1;
    if (sym === q) score = 0;
    else if (sym.startsWith(q)) score = 1;
    else if (sym.includes(q)) score = 2;
    else if (name.includes(q)) score = 3;
    // float crypto pairs up among same-prefix equity ETFs (but not above exact)
    if (row.cls === "crypto" && score > 0) score -= 0.5;
    if (score >= 0) scored.push({ row, score });
  }
  scored.sort(
    (a, b) => a.score - b.score || a.row.symbol.length - b.row.symbol.length || a.row.symbol.localeCompare(b.row.symbol),
  );
  return scored.slice(0, limit).map((s) => s.row);
}

const startParam = () => new Date(Date.now() - 183 * 864e5).toISOString().slice(0, 10);

async function getBars(symbol: string, isCrypto: boolean): Promise<{ t: string; c: number }[]> {
  const start = startParam();
  if (isCrypto) {
    const enc = encodeURIComponent(symbol);
    const d = await fetch(`${DATA}/v1beta3/crypto/us/bars?symbols=${enc}&timeframe=1Day&start=${start}&limit=250`, ALP).then((r) => r.json());
    return (d.bars?.[symbol] ?? []).map((b: any) => ({ t: b.t, c: b.c }));
  }
  // free tier requires feed=iex
  const d = await fetch(`${DATA}/v2/stocks/${symbol}/bars?timeframe=1Day&start=${start}&feed=iex&limit=250`, ALP).then((r) => r.json());
  return (d.bars ?? []).map((b: any) => ({ t: b.t, c: b.c }));
}

/** Full detail for one asset: name, current price + day change, and daily bars. */
export async function getAsset(symbol: string, isCrypto: boolean): Promise<AssetDetail | null> {
  try {
    const bars = await getBars(symbol, isCrypto);

    // name (best-effort)
    let name = symbol;
    try {
      const a = await fetch(`${TRADING}/v2/assets/${encodeURIComponent(symbol)}`, ALP).then((r) => (r.ok ? r.json() : null));
      if (a?.name) name = a.name;
    } catch {}

    // price + previous close — snapshot is freshest for equities
    let price = bars.at(-1)?.c ?? 0;
    let prev = bars.at(-2)?.c ?? price;
    if (!isCrypto) {
      try {
        const snap = await fetch(`${DATA}/v2/stocks/snapshots?symbols=${symbol}`, ALP).then((r) => r.json());
        const s = snap[symbol];
        if (s?.latestTrade?.p) price = s.latestTrade.p;
        if (s?.prevDailyBar?.c) prev = s.prevDailyBar.c;
      } catch {}
    }

    if (!price && bars.length === 0) return null;
    const changePct = prev ? ((price - prev) / prev) * 100 : 0;
    return {
      symbol,
      name,
      cls: isCrypto ? "crypto" : "equity",
      price,
      changePct: Number(changePct.toFixed(2)),
      direction: changePct >= 0 ? "up" : "down",
      bars,
    };
  } catch {
    return null;
  }
}
