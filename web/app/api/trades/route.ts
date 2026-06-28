// Server-side proxy: browser → this handler → Python backend GET /trades.
// The account's trade history (stock + prediction fills) for the Activity tab.
const API = process.env.MARKETS_API_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const r = await fetch(`${API}/trades`, { cache: "no-store" });
    const text = await r.text();
    return new Response(text, { status: r.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return Response.json({ detail: "trading backend unreachable" }, { status: 502 });
  }
}
