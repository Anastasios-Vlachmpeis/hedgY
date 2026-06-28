/**
 * Alpaca WebSocket hub + SSE endpoint for live stock/crypto trades.
 * Single shared WebSocket per feed (Alpaca free tier = 1 connection).
 *
 * GET /api/stream?symbol=NVDA  ->  SSE {type:"trade", price, t}
 */

import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.SSE_PORT || 3001);
const OPEN = 1;
const CONNECTING = 0;

const WS_URL = {
  crypto: "wss://stream.data.alpaca.markets/v1beta3/crypto/us",
  stock: "wss://stream.data.alpaca.markets/v2/iex",
};

/** @type {Record<"crypto"|"stock", Feed>} */
const feeds = {
  crypto: emptyFeed(),
  stock: emptyFeed(),
};

function emptyFeed() {
  return {
    ws: null,
    authed: false,
    connecting: false,
    subs: new Map(),
    retry: null,
    authTimer: null,
    connectingSince: 0,
  };
}

const feedKind = (symbol) => (symbol.includes("/") ? "crypto" : "stock");

function hasKeys() {
  return Boolean(process.env.APCA_API_KEY_ID && process.env.APCA_API_SECRET_KEY);
}

function connect(kind) {
  const feed = feeds[kind];
  const alive =
    feed.ws && (feed.ws.readyState === OPEN || feed.ws.readyState === CONNECTING);
  if (alive && feed.authed) return;
  const stalled =
    feed.connecting && Date.now() - (feed.connectingSince || 0) > 8_000;
  if (alive && feed.connecting && !stalled) return;

  const key = process.env.APCA_API_KEY_ID ?? "";
  const secret = process.env.APCA_API_SECRET_KEY ?? "";
  if (!key || !secret) return;

  try {
    feed.ws?.close();
  } catch {
    /* noop */
  }

  feed.connecting = true;
  feed.connectingSince = Date.now();
  feed.authed = false;
  const ws = new WebSocket(WS_URL[kind]);
  feed.ws = ws;

  if (feed.authTimer) clearTimeout(feed.authTimer);
  feed.authTimer = setTimeout(() => {
    if (!feed.authed) {
      console.warn(`[alpaca:${kind}] auth timeout — recycling socket`);
      try {
        ws.close();
      } catch {
        /* noop */
      }
    }
  }, 6_000);

  ws.onopen = () => ws.send(JSON.stringify({ action: "auth", key, secret }));

  ws.onmessage = (ev) => {
    let msgs;
    try {
      msgs = JSON.parse(String(ev.data));
    } catch {
      return;
    }
    if (!Array.isArray(msgs)) return;
    for (const m of msgs) {
      if (m.T === "success" && m.msg === "authenticated") {
        feed.authed = true;
        feed.connecting = false;
        if (feed.authTimer) {
          clearTimeout(feed.authTimer);
          feed.authTimer = null;
        }
        const symbols = [...feed.subs.keys()];
        if (symbols.length) {
          ws.send(
            JSON.stringify({ action: "subscribe", trades: symbols, quotes: symbols }),
          );
        }
      } else if (m.T === "error") {
        console.error(`[alpaca:${kind}] error`, JSON.stringify(m));
      } else if (m.T === "t" || m.T === "q") {
        const sym = String(m.S);
        const listeners = feed.subs.get(sym);
        if (!listeners?.size) continue;
        const ts = Date.parse(String(m.t));
        const tSec = Math.floor((Number.isNaN(ts) ? Date.now() : ts) / 1000);
        const price =
          m.T === "t" ? Number(m.p) : (Number(m.bp) + Number(m.ap)) / 2;
        if (!Number.isFinite(price) || price <= 0) continue;
        for (const fn of listeners) fn(price, tSec);
      }
    }
  };

  const drop = () => {
    if (feed.authTimer) {
      clearTimeout(feed.authTimer);
      feed.authTimer = null;
    }
    feed.ws = null;
    feed.authed = false;
    feed.connecting = false;
    const hasSubs = [...feed.subs.values()].some((s) => s.size > 0);
    if (hasSubs && !feed.retry) {
      feed.retry = setTimeout(() => {
        feed.retry = null;
        connect(kind);
      }, 2_000);
    }
  };
  ws.onclose = drop;
  ws.onerror = () => {
    try {
      ws.close();
    } catch {
      /* noop */
    }
  };
}

function sendSubscribe(kind, symbol) {
  const feed = feeds[kind];
  if (feed.ws && feed.authed) {
    feed.ws.send(
      JSON.stringify({ action: "subscribe", trades: [symbol], quotes: [symbol] }),
    );
  }
}

function sendUnsubscribe(kind, symbol) {
  const feed = feeds[kind];
  if (feed.ws && feed.authed) {
    feed.ws.send(
      JSON.stringify({ action: "unsubscribe", trades: [symbol], quotes: [symbol] }),
    );
  }
}

function subscribeTrades(symbol, listener) {
  const kind = feedKind(symbol);
  const feed = feeds[kind];

  let set = feed.subs.get(symbol);
  const firstForSymbol = !set || set.size === 0;
  if (!set) {
    set = new Set();
    feed.subs.set(symbol, set);
  }
  set.add(listener);

  connect(kind);
  if (feed.authed && firstForSymbol) sendSubscribe(kind, symbol);

  return () => {
    const s = feed.subs.get(symbol);
    if (!s) return;
    s.delete(listener);
    if (s.size === 0) {
      feed.subs.delete(symbol);
      sendUnsubscribe(kind, symbol);
    }
  };
}

function handleStream(req, res, symbol) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const send = (obj) => {
    if (res.writableEnded) return;
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  if (!hasKeys()) {
    send({ type: "error", message: "no-keys" });
    res.end();
    return;
  }

  send({ type: "status", message: "live" });
  const unsubscribe = subscribeTrades(symbol, (price, t) =>
    send({ type: "trade", price, t }),
  );

  const ping = setInterval(() => {
    if (!res.writableEnded) res.write(": ping\n\n");
  }, 15_000);

  const cleanup = () => {
    clearInterval(ping);
    unsubscribe();
  };
  req.on("close", cleanup);
  req.on("aborted", cleanup);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (url.pathname === "/api/stream" && req.method === "GET") {
    const symbol = url.searchParams.get("symbol") ?? "BTC/USD";
    handleStream(req, res, symbol);
    return;
  }

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, keys: hasKeys() }));
    return;
  }

  res.writeHead(404);
  res.end("not found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[sse] listening on http://127.0.0.1:${PORT}`);
});
