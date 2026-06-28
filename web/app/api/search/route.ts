import { searchAssets } from "@/lib/server/assets";

// GET /api/search?q=app  → up to 12 matching assets (equities/ETFs + crypto).
// Server-side so the Alpaca key stays off the client.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const results = await searchAssets(q);
  return Response.json(results);
}
