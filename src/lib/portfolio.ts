import type { Holding, PortfolioExposure } from "./api/types";
import { getMarket, getStock } from "../mock/seed";

function holdingValue(h: Holding): number {
  return h.qty * h.price;
}

function toSlices(
  buckets: Map<string, number>,
  total: number,
): PortfolioExposure["bySector"] {
  return [...buckets.entries()]
    .map(([label, value]) => ({
      label,
      value,
      pct: total > 0 ? value / total : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function computePortfolioExposure(
  holdings: Holding[],
): PortfolioExposure {
  const sectorBuckets = new Map<string, number>();
  const countryBuckets = new Map<string, number>();
  const typeBuckets = new Map<string, number>();

  let total = 0;

  for (const h of holdings) {
    const value = holdingValue(h);
    if (value <= 0) continue;
    total += value;

    if (h.kind === "stock") {
      const stock = getStock(h.id);
      const sector = stock?.sector ?? "Other";
      const country = stock?.country ?? "United States";

      sectorBuckets.set(sector, (sectorBuckets.get(sector) ?? 0) + value);
      countryBuckets.set(country, (countryBuckets.get(country) ?? 0) + value);
      typeBuckets.set("Stocks", (typeBuckets.get("Stocks") ?? 0) + value);
    } else {
      const market = getMarket(h.id);
      const theme = market?.theme ?? "Other";
      const region = market?.region ?? "Global";

      sectorBuckets.set(
        `Markets · ${theme}`,
        (sectorBuckets.get(`Markets · ${theme}`) ?? 0) + value,
      );
      countryBuckets.set(region, (countryBuckets.get(region) ?? 0) + value);
      typeBuckets.set(
        "Prediction markets",
        (typeBuckets.get("Prediction markets") ?? 0) + value,
      );
    }
  }

  return {
    bySector: toSlices(sectorBuckets, total),
    byCountry: toSlices(countryBuckets, total),
    byAssetType: toSlices(typeBuckets, total),
  };
}
