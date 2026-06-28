import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { getStock } from "../mock/seed";
import { AssetRow, AssetRowSkeleton } from "../components/AssetRow";
import { Card } from "../components/Card";
import { ExposureChart } from "../components/ExposureChart";
import { LineChart } from "../components/LineChart";
import { PriceText } from "../components/PriceText";

export function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.getPortfolio(),
  });

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-down">Failed to load portfolio.</p>
        <p className="mt-2 text-sm text-text-dim">Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-text-dim">
          Portfolio value
        </p>
        {isLoading ? (
          <div className="mt-2 h-12 w-64 animate-pulse rounded bg-surface-2" />
        ) : (
          <>
            <PriceText value={data?.totalValue} size="xl" />
            <div className="mt-2">
              <PriceText changePct={data?.dayChangePct} size="md" />
              <span className="ml-2 text-sm text-text-dim">Today</span>
            </div>
          </>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="h-[320px] animate-pulse rounded-2xl bg-surface-2" />
          ) : (
            data?.chart && (
              <Card className="p-6">
                <LineChart data={data.chart} height={280} />
              </Card>
            )
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <h2 className="mb-4 text-xs uppercase tracking-wide text-text-dim">
              Holdings
            </h2>
            {isLoading ? (
              <>
                <AssetRowSkeleton />
                <AssetRowSkeleton />
                <AssetRowSkeleton />
              </>
            ) : data?.holdings.length === 0 ? (
              <p className="py-8 text-center text-text-dim">
                Add your first position to get started.
              </p>
            ) : (
              data?.holdings.map((h) => {
                const stock = h.kind === "stock" ? getStock(h.id) : undefined;
                return (
                  <AssetRow
                    key={`${h.kind}-${h.id}`}
                    kind={h.kind}
                    id={h.id}
                    label={h.label}
                    price={h.price}
                    qty={h.qty}
                    side={h.side}
                    changePct={stock?.changePct}
                    spark={stock?.spark}
                  />
                );
              })
            )}
          </Card>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xs uppercase tracking-wide text-text-dim">
          Exposure breakdown
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-surface-2" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <Card className="p-6">
              <ExposureChart
                title="By sector"
                data={data?.exposure.bySector ?? []}
              />
            </Card>
            <Card className="p-6">
              <ExposureChart
                title="By country / region"
                data={data?.exposure.byCountry ?? []}
              />
            </Card>
            <Card className="p-6">
              <ExposureChart
                title="By asset type"
                data={data?.exposure.byAssetType ?? []}
              />
            </Card>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xs uppercase tracking-wide text-text-dim">
          Watchlist
        </h2>
        <Card className="px-5 py-1">
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            {isLoading ? (
              <>
                <AssetRowSkeleton />
                <AssetRowSkeleton />
              </>
            ) : (
              data?.watchlist.map((w) => {
                const stock = w.kind === "stock" ? getStock(w.id) : undefined;
                return (
                  <AssetRow
                    key={`watch-${w.kind}-${w.id}`}
                    kind={w.kind}
                    id={w.id}
                    label={w.label}
                    price={w.price}
                    side={w.side}
                    changePct={stock?.changePct}
                    spark={stock?.spark}
                  />
                );
              })
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
