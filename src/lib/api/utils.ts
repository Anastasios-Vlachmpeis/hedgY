/** Shared helpers for live venue adapters (from main branch scripts/connectors). */

export function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

const SPORTS =
  /world cup|fifa|\bnba\b|\bnfl\b|super bowl|\bvs\b|premier league|champions league|grand prix/i;

export function isDiscoverableMarket(question: string): boolean {
  return question.length > 0 && question.length <= 120 && !SPORTS.test(question);
}

export function categorizeMarket(question: string): string {
  const q = question.toLowerCase();
  if (/bitcoin|ethereum|\bcrypto\b|stablecoin|\bbtc\b|\beth\b/.test(q))
    return "Crypto";
  if (/\boil\b|brent|crude|opec|gas price|\benergy\b/.test(q)) return "Energy";
  if (
    /invade|\bwar\b|ceasefire|nato|nuclear|hormuz|taiwan|iran|russia|ukraine|gaza|israel|missile|regime/.test(
      q,
    )
  )
    return "Geopolitics";
  if (
    /\bfed\b|rate cut|rate hike|fomc|recession|inflation|\bgdp\b|jobs report|unemployment|tariff/.test(
      q,
    )
  )
    return "Macro";
  if (
    /\bgpt\b|openai|\bai\b|nvidia|\bchip\b|layoffs|aliens|spacex|starship/.test(q)
  )
    return "Tech";
  if (
    /nominee|nomination|president|election|senate|congress|governor|prime minister|impeach/.test(
      q,
    )
  )
    return "Politics";
  return "Markets";
}

export function filterByQuery<T extends { symbol?: string; name?: string; question?: string }>(
  items: T[],
  q?: string,
): T[] {
  if (!q?.trim()) return items;
  const lower = q.toLowerCase();
  return items.filter(
    (item) =>
      item.symbol?.toLowerCase().includes(lower) ||
      item.name?.toLowerCase().includes(lower) ||
      item.question?.toLowerCase().includes(lower),
  );
}
