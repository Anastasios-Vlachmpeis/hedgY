import type { NextRequest } from "next/server";

import { subscribeTrades, hasKeys } from "@/lib/server/alpacaStream";

// Browser-facing live trade stream (Server-Sent Events). Backed by ONE shared
// Alpaca WebSocket per feed (see lib/server/alpacaStream) so many tabs / React
// StrictMode double-mounts never exceed Alpaca's 1-connection limit. The API
// secret stays server-side; the browser only ever receives {price, t}.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "BTC/USD";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };
      const send = (obj: unknown) => safeEnqueue(`data: ${JSON.stringify(obj)}\n\n`);

      if (!hasKeys()) {
        send({ type: "error", message: "no-keys" });
        controller.close();
        return;
      }

      send({ type: "status", message: "live" });
      const unsubscribe = subscribeTrades(symbol, (price, t) =>
        send({ type: "trade", price, t }),
      );

      const ping = setInterval(() => safeEnqueue(": ping\n\n"), 15_000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(ping);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* noop */
        }
      };
      req.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
