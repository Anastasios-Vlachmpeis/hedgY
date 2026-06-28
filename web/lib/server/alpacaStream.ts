// ─────────────────────────────────────────────────────────────────────────────
// Single shared Alpaca market-data WebSocket per feed (crypto / stock), fanned
// out to many browser SSE clients. Alpaca's free plan allows only ONE concurrent
// data connection per feed, so we must NOT open one socket per request. This hub
// keeps exactly one socket alive, multiplexes symbol subscriptions, and survives
// dev HMR via a globalThis singleton.
//
// Server-only: holds the API secret. Never import from a client component.
// ─────────────────────────────────────────────────────────────────────────────

type Listener = (price: number, tSec: number) => void;
type FeedKind = "crypto" | "stock";

const WS_URL: Record<FeedKind, string> = {
  crypto: "wss://stream.data.alpaca.markets/v1beta3/crypto/us",
  stock: "wss://stream.data.alpaca.markets/v2/iex", // free IEX feed
};

interface Feed {
  ws: WebSocket | null;
  authed: boolean;
  connecting: boolean;
  subs: Map<string, Set<Listener>>; // symbol -> listeners
  retry: ReturnType<typeof setTimeout> | null;
  authTimer: ReturnType<typeof setTimeout> | null;
  connectingSince: number;
}

interface Hub {
  feeds: Record<FeedKind, Feed>;
}

const g = globalThis as unknown as { __alpacaHub?: Hub };

function emptyFeed(): Feed {
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

const hub: Hub =
  g.__alpacaHub ??
  (g.__alpacaHub = { feeds: { crypto: emptyFeed(), stock: emptyFeed() } });

const feedKind = (symbol: string): FeedKind =>
  symbol.includes("/") ? "crypto" : "stock";

const OPEN = 1; // WebSocket.OPEN
const CONNECTING = 0; // WebSocket.CONNECTING

function connect(kind: FeedKind) {
  const feed = hub.feeds[kind];
  // Treat anything that isn't a genuinely live/connecting socket as absent —
  // guards against a zombie half-open socket surviving in the HMR singleton.
  const alive =
    feed.ws && (feed.ws.readyState === OPEN || feed.ws.readyState === CONNECTING);
  if (alive && feed.authed) return; // healthy, authenticated — nothing to do
  // A socket stuck "connecting" (never authed) for too long is a zombie: recycle.
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

  // If Alpaca never authenticates us (e.g. slot busy), tear down and retry.
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

  ws.onmessage = (ev: MessageEvent) => {
    let msgs: unknown;
    try {
      msgs = JSON.parse(String(ev.data));
    } catch {
      return;
    }
    if (!Array.isArray(msgs)) return;
    for (const m of msgs as Array<Record<string, unknown>>) {
      if (m.T === "success" && m.msg === "authenticated") {
        feed.authed = true;
        feed.connecting = false;
        if (feed.authTimer) {
          clearTimeout(feed.authTimer);
          feed.authTimer = null;
        }
        const symbols = [...feed.subs.keys()];
        if (symbols.length) {
          // Trades give the truest "last", but can be sparse (esp. crypto).
          // Quotes update continuously, so we drive the live candle from either.
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
        // Trade: use the trade price. Quote: use the bid/ask mid.
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
    // Reconnect only while clients are still listening.
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

function sendSubscribe(kind: FeedKind, symbol: string) {
  const feed = hub.feeds[kind];
  if (feed.ws && feed.authed) {
    feed.ws.send(
      JSON.stringify({ action: "subscribe", trades: [symbol], quotes: [symbol] }),
    );
  }
}

function sendUnsubscribe(kind: FeedKind, symbol: string) {
  const feed = hub.feeds[kind];
  if (feed.ws && feed.authed) {
    feed.ws.send(
      JSON.stringify({ action: "unsubscribe", trades: [symbol], quotes: [symbol] }),
    );
  }
}

/** Subscribe a listener to live trades for one symbol. Returns an unsubscribe fn. */
export function subscribeTrades(symbol: string, listener: Listener): () => void {
  const kind = feedKind(symbol);
  const feed = hub.feeds[kind];

  let set = feed.subs.get(symbol);
  const firstForSymbol = !set || set.size === 0;
  if (!set) {
    set = new Set();
    feed.subs.set(symbol, set);
  }
  set.add(listener);

  // Idempotent: (re)connects only if there's no healthy socket. If we're already
  // authenticated and this is a newly-seen symbol, subscribe immediately;
  // otherwise the subscribe is sent for all symbols on (re)auth.
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

export function hasKeys(): boolean {
  return Boolean(process.env.APCA_API_KEY_ID && process.env.APCA_API_SECRET_KEY);
}
