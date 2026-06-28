import { NextResponse } from "next/server";

const BACKEND = process.env.MARKETS_API_URL ?? "http://localhost:8000";

const SKIP = /world cup|fifa|nba|nfl|super bowl|premier league|\bvs\b.*fc|win the.*cup/i;

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/markets`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`backend ${res.status}`);
    const all = await res.json();

    const filtered = all
      .filter((m: any) =>
        m.best_yes &&
        m.best_yes.price > 0.05 &&
        m.best_yes.price < 0.95 &&
        !SKIP.test(m.canonical_question) &&
        m.canonical_question.length < 120
      )
      .sort((a: any, b: any) =>
        b.venues.length - a.venues.length ||
        b.match_confidence - a.match_confidence
      )
      .slice(0, 20)
      .map((m: any) => ({
        id: m.id,
        title: m.canonical_question,
        category: m.category ?? "Markets",
        probability: Math.round(m.best_yes.price * 100),
        yes: Math.round(m.best_yes.price * 100),
        no: Math.round((1 - m.best_yes.price) * 100),
        venue: m.venues.join(" / "),
        venues: m.venues,
      }));

    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
