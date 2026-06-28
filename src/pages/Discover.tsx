import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getDiscoverMeta } from "../lib/api/client";
import { formatCents, formatDate, formatVolume } from "../lib/format";
import { AssetRow, AssetRowSkeleton } from "../components/AssetRow";
import { Card } from "../components/Card";
import { SearchBar } from "../components/SearchBar";
import { Tag } from "../components/Tag";

const THEMES = ["All", "Politics", "Macro", "Crypto", "Tech", "Geopolitics", "Energy"] as const;

function formatVenue(venue: string): string {
  if (venue === "polymarket") return "Polymarket";
  if (venue === "kalshi") return "Kalshi";
  return venue.charAt(0).toUpperCase() + venue.slice(1);
}

function LiveBadge({ live, unified }: { live: boolean; unified?: boolean }) {
  const label = live ? (unified ? "Unified" : "Live") : "Mock";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        live ? "bg-up/20 text-up" : "bg-white/10 text-text-dim"
      }`}
    >
      {label}
    </span>
  );
}

export function Discover() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<(typeof THEMES)[number]>("All");

  const metaQuery = useQuery({
    queryKey: ["discover-meta"],
    queryFn: getDiscoverMeta,
    staleTime: 60_000,
  });

  const stocksQuery = useQuery({
    queryKey: ["stocks", query],
    queryFn: () => api.listStocks(query),
  });

  const marketsQuery = useQuery({
    queryKey: ["markets", query],
    queryFn: () => api.listMarkets(query),
  });

  const markets = useMemo(
    () =>
      marketsQuery.data?.filter(
        (m) => theme === "All" || m.theme === theme,
      ) ?? [],
    [marketsQuery.data, theme],
  );

  const stocksLive = metaQuery.data?.stocksLive ?? false;
  const marketsLive = metaQuery.data?.marketsLive ?? false;
  const marketsUnified = metaQuery.data?.marketsUnified ?? false;

  return (
    <div className="pb-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Discover</h2>
          <p className="mt-1 text-text-dim">
            All securities and prediction markets in one feed
          </p>
        </div>
        <div className="w-full max-w-md">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search stocks and markets..."
          />
        </div>
      </header>

      {/* Stocks */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h3 className="text-xs uppercase tracking-wide text-text-dim">Stocks</h3>
          <LiveBadge live={stocksLive} />
          <span className="text-xs text-text-dim">
            {stocksQuery.data?.length ?? 0} securities
          </span>
        </div>

        <Card className="p-2">
          {stocksQuery.isLoading ? (
            <>
              <AssetRowSkeleton />
              <AssetRowSkeleton />
              <AssetRowSkeleton />
            </>
          ) : stocksQuery.error ? (
            <p className="py-8 text-center text-down">Failed to load stocks.</p>
          ) : stocksQuery.data?.length === 0 ? (
            <p className="py-8 text-center text-text-dim">No stocks found.</p>
          ) : (
            stocksQuery.data?.map((s) => (
              <AssetRow
                key={s.symbol}
                kind="stock"
                id={s.symbol}
                label={s.name}
                price={s.price}
                changePct={s.changePct}
                spark={s.spark}
                subtitle={s.sector}
              />
            ))
          )}
        </Card>
      </section>

      {/* Prediction markets */}
      <section>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h3 className="text-xs uppercase tracking-wide text-text-dim">
            Prediction markets
          </h3>
          <LiveBadge live={marketsLive} unified={marketsUnified} />
          <span className="text-xs text-text-dim">{markets.length} markets</span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                theme === t ? "glass-inset text-text" : "text-text-dim hover:text-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {marketsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : marketsQuery.error ? (
          <p className="py-8 text-center text-down">Failed to load markets.</p>
        ) : markets.length === 0 ? (
          <p className="py-8 text-center text-text-dim">No markets found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {markets.map((m) => (
              <Card
                key={m.id}
                onClick={() => navigate(`/asset/market/${m.id}`)}
                className="h-full"
              >
                <p className="font-medium leading-snug">{m.question}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Tag variant="yes">YES {formatCents(m.yesPrice)}</Tag>
                  {m.theme && <Tag variant="theme">{m.theme}</Tag>}
                  {m.venues && m.venues.length > 1 && (
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium text-text-dim">
                      {m.venues.map(formatVenue).join(" · ")}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xs text-text-dim">
                  {formatVolume(m.volume)} vol · resolves {formatDate(m.resolvesAt)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
