// Minimal Coinbase connectivity test: live ticker + 24h stats for a few products.
// Public market data, no auth. Run with:  npm run coinbase:test

const BASE = "https://api.exchange.coinbase.com";
const PRODUCTS = ["BTC-USD", "ETH-USD", "SOL-USD"];

async function get(url: string) {
  // Coinbase Exchange requires a User-Agent header or it rejects the request.
  const res = await fetch(url, { headers: { "User-Agent": "paris-hack/0.1" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${url}\n${await res.text()}`);
  return res.json();
}

async function main() {
  console.log("\n✅ Coinbase public market data — live tickers:\n");
  for (const p of PRODUCTS) {
    const [ticker, stats] = await Promise.all([
      get(`${BASE}/products/${p}/ticker`),
      get(`${BASE}/products/${p}/stats`),
    ]);
    const open = Number(stats.open);
    const last = Number(ticker.price);
    const chg = open ? ((last - open) / open) * 100 : 0;
    console.log(`   • ${p}: $${last.toLocaleString()}  ` +
      `bid $${Number(ticker.bid).toLocaleString()} / ask $${Number(ticker.ask).toLocaleString()}  ` +
      `24h ${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`);
  }
  console.log("\nCoinbase reachable. 🎉\n");
}

main().catch((e) => {
  console.error("\n❌ Failed:\n", e.message ?? e);
  process.exit(1);
});
