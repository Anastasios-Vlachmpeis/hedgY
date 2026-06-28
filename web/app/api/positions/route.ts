// Server-side proxy: browser → this handler → Python backend GET /positions.
// Live positions marked to current prices (stocks via Alpaca, predictions via
// the Kalshi+Polymarket aggregator) — the triple-venue book.
const API = process.env.MARKETS_API_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const r = await fetch(`${API}/positions`, { cache: "no-store" });
    const text = await r.text();
    return new Response(text, { status: r.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return Response.json({ detail: "trading backend unreachable" }, { status: 502 });
  }
}
