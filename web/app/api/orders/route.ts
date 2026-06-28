// Server-side proxy: browser → this handler → Python backend POST /orders.
// Keeps the backend URL server-only and avoids CORS.
const API = process.env.MARKETS_API_URL ?? "http://localhost:8000";

export async function POST(req: Request): Promise<Response> {
  const body = await req.text();
  try {
    const r = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
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
