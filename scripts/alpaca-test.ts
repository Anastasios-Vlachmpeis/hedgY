// Minimal Alpaca connectivity test: account, stock quote, crypto price, paper order.
// Run with:  npm run alpaca:test   (loads .env automatically)

const KEY = process.env.APCA_API_KEY_ID!;
const SECRET = process.env.APCA_API_SECRET_KEY!;
const TRADING = process.env.ALPACA_TRADING_URL ?? "https://paper-api.alpaca.markets";
const DATA = process.env.ALPACA_DATA_URL ?? "https://data.alpaca.markets";

if (!KEY || !SECRET) {
  console.error("Missing APCA_API_KEY_ID / APCA_API_SECRET_KEY. Copy .env.example to .env and fill them in.");
  process.exit(1);
}

const headers = {
  "APCA-API-KEY-ID": KEY,
  "APCA-API-SECRET-KEY": SECRET,
};

async function get(url: string) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${url}\n${await res.text()}`);
  return res.json();
}

async function main() {
  // 1) Account — proves auth works
  const acct = await get(`${TRADING}/v2/account`);
  console.log("\n✅ Account OK");
  console.log(`   status=${acct.status}  cash=$${acct.cash}  buying_power=$${acct.buying_power}`);

  // 2) Latest stock quote (ITA = defense ETF — fits the demo thesis)
  const stock = await get(`${DATA}/v2/stocks/ITA/quotes/latest`);
  const q = stock.quote;
  console.log("\n✅ Stock quote OK (ITA)");
  console.log(`   bid=$${q.bp} ask=$${q.ap}  @ ${q.t}`);

  // 3) Latest crypto price (BTC/USD)
  const crypto = await get(`${DATA}/v1beta3/crypto/us/latest/quotes?symbols=BTC%2FUSD`);
  const c = crypto.quotes["BTC/USD"];
  console.log("\n✅ Crypto quote OK (BTC/USD)");
  console.log(`   bid=$${c.bp} ask=$${c.ap}  @ ${c.t}`);

  // 4) Place a tiny paper order — proves execution path
  const orderRes = await fetch(`${TRADING}/v2/orders`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ symbol: "ITA", qty: 1, side: "buy", type: "market", time_in_force: "day" }),
  });
  const order = await orderRes.json();
  if (!orderRes.ok) {
    console.log("\n⚠️  Paper order rejected (often just market-closed):", order.message ?? order);
  } else {
    console.log("\n✅ Paper order submitted");
    console.log(`   id=${order.id}  ${order.side} ${order.qty} ${order.symbol}  status=${order.status}`);
  }

  console.log("\nAll core Alpaca paths reachable. 🎉\n");
}

main().catch((e) => {
  console.error("\n❌ Failed:\n", e.message ?? e);
  process.exit(1);
});
