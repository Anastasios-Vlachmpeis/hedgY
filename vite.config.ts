import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { ProxyOptions } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const alpacaProxy: ProxyOptions = {
    target: env.ALPACA_DATA_URL || "https://data.alpaca.markets",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/alpaca/, ""),
    configure: (proxy) => {
      proxy.on("proxyReq", (proxyReq) => {
        const key = env.APCA_API_KEY_ID;
        const secret = env.APCA_API_SECRET_KEY;
        if (key && secret) {
          proxyReq.setHeader("APCA-API-KEY-ID", key);
          proxyReq.setHeader("APCA-API-SECRET-KEY", secret);
        }
      });
    },
  };

  const polymarketProxy: ProxyOptions = {
    target: "https://gamma-api.polymarket.com",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/polymarket/, ""),
  };

  const marketsProxy: ProxyOptions = {
    target: "http://127.0.0.1:8000",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/markets/, "/markets"),
  };

  const streamProxy: ProxyOptions = {
    target: "http://127.0.0.1:3001",
    changeOrigin: true,
  };

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api/alpaca": alpacaProxy,
        "/api/polymarket": polymarketProxy,
        "/api/markets": marketsProxy,
        "/api/stream": streamProxy,
      },
    },
    preview: {
      proxy: {
        "/api/alpaca": alpacaProxy,
        "/api/polymarket": polymarketProxy,
        "/api/markets": marketsProxy,
        "/api/stream": streamProxy,
      },
    },
  };
});
