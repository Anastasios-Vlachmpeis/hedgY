import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api/client";
import { getStockNotional } from "../lib/hedge";
import { formatCents, formatMoney } from "../lib/format";
import { useUIStore } from "../store/ui";
import type { HedgeSuggestion } from "../lib/api/types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { PayoffChart } from "../components/PayoffChart";
import { Tag } from "../components/Tag";

export function Hedge() {
  const [searchParams] = useSearchParams();
  const initialSymbol = searchParams.get("symbol") ?? "TAN";

  const [symbol, setSymbol] = useState(initialSymbol);
  const [selected, setSelected] = useState<HedgeSuggestion | null>(null);
  const openTicket = useUIStore((s) => s.openTicket);

  const holdingsQuery = useQuery({
    queryKey: ["holdings"],
    queryFn: () => api.getHoldings(),
  });

  const stockHoldings = useMemo(
    () => holdingsQuery.data?.filter((h) => h.kind === "stock") ?? [],
    [holdingsQuery.data],
  );

  const suggestionsQuery = useQuery({
    queryKey: ["hedge-suggestions", symbol],
    queryFn: () => api.getHedgeSuggestions(symbol),
    enabled: !!symbol,
  });

  const notional = getStockNotional(symbol);

  const payoffQuery = useQuery({
    queryKey: ["payoff", symbol, selected?.market.id, selected?.side],
    queryFn: () => api.computePayoff(symbol, selected!, notional),
    enabled: !!selected,
  });

  const currentHolding = stockHoldings.find((h) => h.id === symbol);

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">Hedge</h2>
        <p className="mt-1 text-text-dim">
          Offset stock exposure with prediction markets
        </p>
      </header>

      <Card className="mb-8">
        <label className="mb-2 block text-xs uppercase tracking-wide text-text-dim">
          Pick exposure
        </label>
        <select
          value={symbol}
          onChange={(e) => {
            setSymbol(e.target.value);
            setSelected(null);
          }}
          className="glass-inset w-full max-w-md rounded-xl px-4 py-3 text-sm text-text focus:border-up/50 focus:outline-none [&>option]:bg-[#16202a] [&>option]:text-text"
        >
          {stockHoldings.map((h) => (
            <option key={h.id} value={h.id}>
              {h.id} — {h.label}
            </option>
          ))}
        </select>
        {currentHolding && (
          <p className="mt-3 text-sm text-text-dim">
            {formatMoney(currentHolding.qty * currentHolding.price)} in{" "}
            <span className="font-medium text-text">{symbol}</span>
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Suggestions panel */}
        <section>
          <h3 className="mb-4 text-xs uppercase tracking-wide text-text-dim">
            {selected ? "Selected hedge" : "Suggestions"}
          </h3>

          {selected ? (
            <div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="mb-4 text-sm text-text-dim hover:text-text"
              >
                ← View all suggestions
              </button>
              <Card>
                <div className="mb-3 flex items-center gap-2">
                  <Tag variant={selected.direction === "hedge" ? "hedge" : "expression"}>
                    {selected.direction === "hedge" ? "Hedge" : "Expression"}
                  </Tag>
                  <Tag variant={selected.side === "YES" ? "yes" : "no"}>
                    {selected.side}
                  </Tag>
                </div>
                <p className="text-lg font-medium leading-snug">
                  {selected.market.question}
                </p>
                <p className="mt-3 text-sm text-text-dim">{selected.rationale}</p>
                <p className="mt-4 text-xs text-express">
                  leaves ~{Math.round(selected.residualRisk * 100)}% basis risk
                </p>
              </Card>

              <Button
                className="mt-6 w-full max-w-sm"
                onClick={() =>
                  openTicket({
                    kind: "market",
                    id: selected.market.id,
                    label: selected.market.question.slice(0, 30) + "…",
                    price:
                      selected.side === "YES"
                        ? selected.market.yesPrice
                        : selected.market.noPrice,
                    marketSide: selected.side,
                    hedgePair: { stockSymbol: symbol, suggestion: selected },
                  })
                }
              >
                Build this pair
              </Button>
            </div>
          ) : suggestionsQuery.isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-surface-2" />
              ))}
            </div>
          ) : suggestionsQuery.error ? (
            <p className="text-down">Failed to load suggestions.</p>
          ) : suggestionsQuery.data?.length === 0 ? (
            <p className="text-text-dim">No hedge suggestions for this symbol.</p>
          ) : (
            <div className="space-y-3">
              {suggestionsQuery.data?.map((s) => (
                <Card key={s.market.id + s.side} onClick={() => setSelected(s)}>
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <p className="font-medium leading-snug">{s.market.question}</p>
                    <Tag variant={s.direction === "hedge" ? "hedge" : "expression"}>
                      {s.direction === "hedge" ? "Hedge" : "Expression"}
                    </Tag>
                  </div>
                  <p className="mb-3 text-sm text-text-dim">
                    Side: <span className="text-text">{s.side}</span> ·{" "}
                    {formatCents(
                      s.side === "YES" ? s.market.yesPrice : s.market.noPrice,
                    )}
                  </p>
                  <div className="mb-2">
                    <div className="mb-1 flex justify-between text-xs text-text-dim">
                      <span>Offset score</span>
                      <span>{Math.round(s.offsetScore * 100)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${s.offsetScore * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-express">
                    leaves ~{Math.round(s.residualRisk * 100)}% basis risk
                  </p>
                  <p className="mt-2 text-sm text-text-dim">{s.rationale}</p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Payoff panel */}
        <section>
          <h3 className="mb-4 text-xs uppercase tracking-wide text-text-dim">
            Combined payoff
          </h3>
          {!selected ? (
            <Card className="flex min-h-[400px] items-center justify-center p-12 text-center">
              <div>
                <p className="text-lg font-medium text-text-dim">
                  Select a suggestion
                </p>
                <p className="mt-2 text-sm text-text-dim">
                  The payoff chart will show how the hedge flattens your downside.
                </p>
              </div>
            </Card>
          ) : payoffQuery.isLoading ? (
            <div className="min-h-[400px] animate-pulse rounded-2xl bg-surface-2" />
          ) : payoffQuery.data ? (
            <PayoffChart result={payoffQuery.data} />
          ) : null}
        </section>
      </div>
    </div>
  );
}
