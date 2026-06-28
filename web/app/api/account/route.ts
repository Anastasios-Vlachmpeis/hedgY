// Server-side proxy: browser → this handler → Python backend GET /account.
// Surfaces the live paper account (cash, equity, P&L) without exposing the URL.
const API = process.env.MARKETS_API_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const r = await fetch(`${API}/account`, { cache: "no-store" });
    const text = await r.text();
    return new Response(text, { status: r.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return Response.json({ detail: "trading backend unreachable" }, { status: 502 });
  }
}
