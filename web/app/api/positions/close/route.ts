// Server-side proxy: browser → this handler → Python backend POST /positions/close.
// Liquidates a single position (by ledger id) or a whole combined hedge (group_id).
const API = process.env.MARKETS_API_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // empty/invalid body — let the backend return a 422
  }
  try {
    const r = await fetch(`${API}/positions/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return Response.json({ detail: "trading backend unreachable" }, { status: 502 });
  }
}
