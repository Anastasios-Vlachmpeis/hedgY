import type { HedgeSuggestion, PayoffResult, PredictionMarket } from "./api/types";
import { CURATED_HEDGES, HOLDINGS, getMarket, getStock, MARKETS } from "../mock/seed";

const SYMBOL_THEMES: Record<string, string[]> = {
  TAN: ["Politics", "Macro"],
  NVDA: ["Crypto", "Macro"],
  XLE: ["Macro", "Politics"],
  GLD: ["Macro"],
  ARKK: ["Crypto", "Macro"],
};

export function rankSuggestions(
  symbol: string,
  markets: PredictionMarket[] = MARKETS,
): HedgeSuggestion[] {
  const curated = CURATED_HEDGES[symbol];
  if (curated) {
    return curated
      .map((c) => {
        const market = markets.find((m) => m.id === c.marketId);
        if (!market) return null;
        return {
          market,
          side: c.side,
          direction: c.direction,
          offsetScore: c.offsetScore,
          residualRisk: c.residualRisk,
          rationale: c.rationale,
        };
      })
      .filter((s): s is HedgeSuggestion => s !== null)
      .sort((a, b) => b.offsetScore - a.offsetScore);
  }

  const themes = SYMBOL_THEMES[symbol] ?? ["Macro"];
  return markets
    .filter((m) => themes.includes(m.theme ?? ""))
    .map((market, i) => ({
      market,
      side: (i % 2 === 0 ? "NO" : "YES") as "YES" | "NO",
      direction: (i % 2 === 0 ? "hedge" : "expression") as "hedge" | "expression",
      offsetScore: 0.5 + Math.random() * 0.3,
      residualRisk: 0.15 + Math.random() * 0.25,
      rationale: `Theme match (${market.theme}) — heuristic offset for ${symbol}.`,
    }))
    .sort((a, b) => b.offsetScore - a.offsetScore)
    .slice(0, 4);
}

export function computePayoff(
  stockMovePct: number[],
  suggestion: HedgeSuggestion,
  notional: number,
): PayoffResult {
  const stock = getStock(
    Object.keys(CURATED_HEDGES).find((s) =>
      CURATED_HEDGES[s]?.some((c) => c.marketId === suggestion.market.id),
    ) ?? "TAN",
  );

  const contractPrice =
    suggestion.side === "YES"
      ? suggestion.market.yesPrice
      : suggestion.market.noPrice;

  const hedgeRatio = suggestion.offsetScore * 0.15;
  const contractNotional = notional * hedgeRatio;
  const premium = contractNotional * contractPrice;

  const isTanElection =
    suggestion.market.id === "trump-2024" &&
    stock?.symbol === "TAN" &&
    suggestion.direction === "hedge";

  const varianceRemovedPct = isTanElection ? 0.89 : suggestion.offsetScore * 0.85;
  const residualRiskPct = isTanElection ? 0.11 : suggestion.residualRisk;
  const hedgeCostBps = isTanElection ? 24 : Math.round(contractPrice * 100 * hedgeRatio * 10);

  const moves =
    stockMovePct.length > 0
      ? stockMovePct
      : Array.from({ length: 41 }, (_, i) => -0.2 + (i / 40) * 0.4);

  const points = moves.map((move) => {
    const unhedged = notional * move;

    const contractPayoff =
      suggestion.direction === "hedge"
        ? move < -0.05
          ? contractNotional * (1 - contractPrice)
          : -premium * 0.5
        : move > 0.05
          ? contractNotional * (1 - contractPrice)
          : -premium * 0.5;

    const combined = unhedged + contractPayoff - premium * 0.3;

    return { x: move, unhedged, combined };
  });

  return {
    points,
    varianceRemovedPct,
    residualRiskPct,
    hedgeCostBps,
  };
}

export function getStockNotional(symbol: string): number {
  const holding = HOLDINGS.find((h) => h.kind === "stock" && h.id === symbol);
  if (holding) return holding.qty * holding.price;
  const stock = getStock(symbol);
  return stock ? stock.price * 1000 : 100_000;
}

export function getMarketById(id: string): PredictionMarket | undefined {
  return getMarket(id);
}
