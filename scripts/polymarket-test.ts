// Minimal Polymarket connectivity test: list top markets + live price for one outcome.
// No auth needed for reads. Run with:  npm run poly:test

const GAMMA = "https://gamma-api.polymarket.com";
const CLOB = "https://clob.polymarket.com";

async function get(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${url}\n${await res.text()}`);
  return res.json();
}

// Gamma returns some array fields as JSON strings; parse safely.
function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return []; }
  }
  return [];
}

async function main() {
  // 1) Pull active markets, sort by volume client-side, take the top few.
  const markets: any[] = await get(`${GAMMA}/markets?closed=false&active=true&limit=100`);
  const top = markets
    .filter((m) => Number(m.volumeNum ?? m.volume ?? 0) > 0)
    .sort((a, b) => Number(b.volumeNum ?? b.volume ?? 0) - Number(a.volumeNum ?? a.volume ?? 0))
    .slice(0, 5);

  console.log("\n✅ Gamma markets OK — top active markets by volume:\n");
  for (const m of top) {
    const outcomes = parseArr(m.outcomes);
    const prices = parseArr(m.outcomePrices);
    const pretty = outcomes.map((o, i) => `${o} ${(Number(prices[i]) * 100).toFixed(1)}%`).join("  |  ");
    console.log(`   • ${m.question}`);
    console.log(`     ${pretty}   (vol $${Math.round(Number(m.volumeNum ?? m.volume ?? 0)).toLocaleString()})`);
  }

  // 2) Live midpoint from the CLOB for the top market's first outcome token.
  const tokenIds = parseArr(top[0]?.clobTokenIds);
  if (tokenIds[0]) {
    const mid = await get(`${CLOB}/midpoint?token_id=${tokenIds[0]}`);
    console.log(`\n✅ CLOB live price OK for "${top[0].question}"`);
    console.log(`   "${parseArr(top[0].outcomes)[0]}" midpoint = ${(Number(mid.mid) * 100).toFixed(1)}%`);
  }

  console.log("\nPolymarket reachable. 🎉\n");
}

main().catch((e) => {
  console.error("\n❌ Failed:\n", e.message ?? e);
  process.exit(1);
});
