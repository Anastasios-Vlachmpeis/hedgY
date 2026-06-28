import { Link, useNavigate, useParams } from "react-router-dom";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { formatCents, formatDate, formatVolume } from "../lib/format";
import { useUIStore } from "../store/ui";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LineChart } from "../components/LineChart";
import { PriceChart, type Live } from "../components/PriceChart";
import { PageHeader } from "../components/Shell";
import { PriceText } from "../components/PriceText";
import { Tag } from "../components/Tag";
import type { AssetKind } from "../lib/api/types";
import { TIMEFRAMES, type Timeframe } from "../lib/timeframes";

function formatVenue(venue: string): string {
  if (venue === "polymarket") return "Polymarket";
  if (venue === "kalshi") return "Kalshi";
  return venue.charAt(0).toUpperCase() + venue.slice(1);
}

function LiveIndicator({ state }: { state: Live }) {
  if (state === "off") return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        state === "live" ? "text-up" : "text-text-dim"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          state === "live" ? "bg-up animate-pulse" : "bg-text-dim"
        }`}
      />
      {state === "live" ? "Live" : "Connecting"}
    </span>
  );
}

export function Asset() {
  const { kind, id } = useParams<{ kind: AssetKind; id: string }>();
  const navigate = useNavigate();
  const openTicket = useUIStore((s) => s.openTicket);
  const [timeframe, setTimeframe] = useState<Timeframe>("1Day");
  const [liveState, setLiveState] = useState<Live>("off");

  const onLiveChange = useCallback((state: Live) => {
    setLiveState(state);
  }, []);

  const stockQuery = useQuery({
    queryKey: ["stock", id],
    queryFn: () => api.getStock(id!),
    enabled: kind === "stock" && !!id,
  });

  const barsQuery = useQuery({
    queryKey: ["stock-bars", id, timeframe],
    queryFn: () => api.getStockBars(id!, timeframe),
    enabled: kind === "stock" && !!id,
  });

  const marketQuery = useQuery({
    queryKey: ["market", id],
    queryFn: () => api.getMarket(id!),
    enabled: kind === "market" && !!id,
  });

  const isLoading =
    kind === "stock"
      ? stockQuery.isLoading || barsQuery.isLoading
      : marketQuery.isLoading;
  const error = kind === "stock" ? stockQuery.error : marketQuery.error;

  if (!kind || !id) {
    navigate("/");
    return null;
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-down">Asset not found.</p>
        <Link to="/" className="mt-4 inline-block text-up">
          Go home
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 rounded bg-surface-2" />
        <div className="h-12 w-48 rounded bg-surface-2" />
        <div className="h-[320px] rounded-2xl bg-surface-2" />
      </div>
    );
  }

  if (kind === "stock" && stockQuery.data && barsQuery.data) {
    const stock = stockQuery.data;
    const { candles } = barsQuery.data;
    const last = candles[candles.length - 1];

    return (
      <div>
        <PageHeader title={stock.symbol} backTo="/" subtitle={stock.name} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PriceText value={stock.price} size="xl" />
            <div className="mb-6 mt-2">
              <PriceText changePct={stock.changePct} size="md" />
              <span className="ml-2 text-sm text-text-dim">Today</span>
            </div>

            <Card className="mb-6 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setTimeframe(tf.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        timeframe === tf.id
                          ? "glass-inset text-text"
                          : "text-text-dim hover:text-text"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
                <LiveIndicator state={liveState} />
              </div>
              <PriceChart
                candles={candles}
                symbol={stock.symbol}
                timeframe={timeframe}
                streamable
                onLiveChange={onLiveChange}
              />
            </Card>

            <div className="glass grid grid-cols-4 gap-4 rounded-2xl p-5 text-center text-sm">
              <div>
                <p className="text-text-dim">Open</p>
                <p className="mt-1 font-medium tabular-nums">
                  ${last?.open.toFixed(2) ?? stock.price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-text-dim">High</p>
                <p className="mt-1 font-medium tabular-nums">
                  ${last?.high.toFixed(2) ?? stock.price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-text-dim">Low</p>
                <p className="mt-1 font-medium tabular-nums">
                  ${last?.low.toFixed(2) ?? stock.price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-text-dim">Close</p>
                <p className="mt-1 font-medium tabular-nums">
                  ${last?.close.toFixed(2) ?? stock.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Card className="sticky top-24">
              <h3 className="mb-4 text-xs uppercase tracking-wide text-text-dim">
                Actions
              </h3>
              <Button
                className="mb-4 w-full"
                onClick={() =>
                  openTicket({
                    kind: "stock",
                    id: stock.symbol,
                    label: stock.symbol,
                    price: stock.price,
                  })
                }
              >
                Trade
              </Button>
              <Link
                to={`/hedge?symbol=${stock.symbol}`}
                className="block w-full rounded-full bg-accent py-3 text-center text-sm font-semibold text-white shadow-[0_4px_16px_rgba(0,0,128,0.45)] transition-all hover:brightness-125"
              >
                Hedge this position →
              </Link>
              {stock.sector && (
                <p className="mt-6 text-sm text-text-dim">
                  Sector: <span className="text-text">{stock.sector}</span>
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "market" && marketQuery.data) {
    const market = marketQuery.data;
    const crossVenue = (market.venues?.length ?? 0) > 1;

    return (
      <div>
        <PageHeader title="Market" backTo="/discover" subtitle={market.question} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 flex gap-4">
              <div className="glass flex-1 rounded-2xl border-up/40 bg-up/10 p-5 text-center">
                <p className="text-xs uppercase tracking-wide text-text-dim">YES</p>
                <p className="mt-1 text-4xl font-semibold text-up tabular-nums">
                  {formatCents(market.yesPrice)}
                </p>
                {crossVenue && market.yesVenue && (
                  <p className="mt-1 text-xs text-text-dim">
                    Best on {formatVenue(market.yesVenue)}
                  </p>
                )}
              </div>
              <div className="glass flex-1 rounded-2xl border-down/40 bg-down/10 p-5 text-center">
                <p className="text-xs uppercase tracking-wide text-text-dim">NO</p>
                <p className="mt-1 text-4xl font-semibold text-down tabular-nums">
                  {formatCents(market.noPrice)}
                </p>
                {crossVenue && market.noVenue && (
                  <p className="mt-1 text-xs text-text-dim">
                    Best on {formatVenue(market.noVenue)}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {market.theme && <Tag variant="theme">{market.theme}</Tag>}
              {crossVenue && market.venues && (
                <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-text-dim">
                  {market.venues.map(formatVenue).join(" · ")}
                </span>
              )}
              <span className="text-sm text-text-dim">
                {formatVolume(market.volume)} volume
              </span>
              <span className="text-sm text-text-dim">
                Resolves {formatDate(market.resolvesAt)}
              </span>
            </div>

            <Card className="p-6">
              <p className="mb-4 text-xs uppercase tracking-wide text-text-dim">
                YES price history
              </p>
              <LineChart data={market.chart} height={300} />
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <h3 className="mb-4 text-xs uppercase tracking-wide text-text-dim">
                Trade
              </h3>
              <Button
                className="w-full"
                onClick={() =>
                  openTicket({
                    kind: "market",
                    id: market.id,
                    label: market.question.slice(0, 30) + "…",
                    price: market.yesPrice,
                    marketSide: "YES",
                  })
                }
              >
                Open trade ticket
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
