// End-to-end smoke test of the DATA & INTEGRATIONS (P4) layer.
// Exercises all five boxes. Polymarket is auth-free; crypto/equities need Alpaca
// keys in .env (the same ones from `npm run alpaca:test`).
//
// Run with:  npm run integrations:demo

import { createDataLayer, reconcile, fundingRailFor } from "../packages/integrations/src/index.ts";
import type { Fill, LedgerEntry } from "../packages/integrations/src/index.ts";

function h(title: string) {
  console.log(`\n${"─".repeat(70)}\n${title}\n${"─".repeat(70)}`);
}

async function main() {
  const { aggregator, instruments, custody } = createDataLayer();

  h("① VENUE CONNECTORS — active venues");
  console.log("   " + aggregator.activeVenues().join(", ") + "  (alpaca appears only if keys are set)");

  h("③ INSTRUMENT MAPPING ★ — catalog");
  for (const i of instruments.all()) {
    console.log(`   ${i.canonicalId.padEnd(22)} ${i.label}  [${i.tags.join(", ")}]`);
  }

  h('③ "Is this the same market?" — cross-venue matching');
  // The product-relevant case: the SAME event listed on different venues, phrased
  // differently. Today we score by text similarity; this is where a Claude call
  // upgrades it to semantic matching.
  const fuzzy = instruments.sameMarket(
    { venue: "polymarket", symbol: "x", label: "USA win the 2026 World Cup" },
    { venue: "kalshi", symbol: "y", label: "Will the United States win World Cup 2026" },
  );
  console.log(`   polymarket vs kalshi event → confidence ${(fuzzy.confidence * 100).toFixed(0)}%  (${fuzzy.reason})`);
  console.log("   note: exact 100% match fires automatically once an instrument is");
  console.log("         listed on 2+ venues in the catalog (e.g. when Kalshi lands).");

  h("②③ AGGREGATOR — resolve crypto:BTC and quote");
  const btcRefs = await instruments.resolve("crypto:BTC");
  console.log("   resolved listings: " + btcRefs.map((r) => `${r.venue}:${r.symbol}`).join(", "));
  const agg = await aggregator.aggregate(btcRefs);
  for (const q of agg.quotes) {
    console.log(`   ${q.venue.padEnd(9)} bid $${q.bid?.toLocaleString()} / ask $${q.ask?.toLocaleString()}`);
  }
  if (agg.quotes.length === 0) console.log("   (no quote — set Alpaca keys in .env)");
  if (agg.bestAsk) console.log(`   → best ASK across venues: ${agg.bestAsk.venue} @ $${agg.bestAsk.price.toLocaleString()}`);
  console.log("   (cross-venue best-execution kicks in once an instrument lists on 2+ venues)");

  h("②③ Event leg — resolve a Polymarket market live");
  try {
    const evRefs = await instruments.resolve("event:fifa-wc-2026-usa");
    if (evRefs.length) {
      const meta = evRefs[0].meta as any;
      const qr = await aggregator.quote(evRefs[0]);
      console.log(`   "${meta?.question}" (${meta?.outcome})`);
      console.log(`   live probability: ${qr.quote ? (qr.quote.mid * 100).toFixed(1) + "%" : qr.error}`);
    } else {
      console.log("   (no match found right now — swap the search term in catalog.json)");
    }
  } catch (e: any) {
    console.log("   event resolve skipped:", e.message);
  }

  h("⑤ CUSTODY / PAYMENTS — rail routing per venue");
  for (const v of ["alpaca", "polymarket", "kalshi"] as const) {
    console.log(`   ${v.padEnd(11)} settles on  ${fundingRailFor(v)}`);
  }
  console.log("   balances: " + custody.getBalances().map((b) => `${b.available.toLocaleString()} ${b.currency}`).join("  |  "));
  const fund = custody.canFund("polymarket", 10_000);
  console.log(`   can fund $10k on polymarket? ${fund.ok} (rail ${fund.rail}, ${fund.available.toLocaleString()} avail)`);

  h("④ SETTLEMENT / RECONCILIATION — detect breaks");
  const ledger: LedgerEntry[] = [
    { orderId: "o1", canonicalId: "etf:ITA", side: "buy", qty: 10, expectedPrice: 130 },
    { orderId: "o2", canonicalId: "equity:LMT", side: "buy", qty: 5, expectedPrice: 450 },
    { orderId: "o3", canonicalId: "crypto:BTC", side: "buy", qty: 1, expectedPrice: 60000 },
  ];
  const fills: Fill[] = [
    { orderId: "o1", venue: "alpaca", symbol: "ITA", side: "buy", qty: 10, price: 130.2, ts: "" }, // ok
    { orderId: "o2", venue: "alpaca", symbol: "LMT", side: "buy", qty: 3, price: 451, ts: "" }, // qty short
    // o3 missing entirely
    { orderId: "o9", venue: "alpaca", symbol: "AAPL", side: "buy", qty: 1, price: 200, ts: "" }, // unexpected
  ];
  const breaks = reconcile(ledger, fills);
  if (breaks.length === 0) console.log("   no breaks — books clean");
  for (const b of breaks) console.log(`   ⚠️  [${b.kind}] order ${b.orderId}: ${b.detail}`);

  console.log("\n✅ P4 data layer wired end-to-end.\n");
}

main().catch((e) => {
  console.error("\n❌ Failed:\n", e);
  process.exit(1);
});
