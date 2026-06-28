export type StockEntry = {
  symbol: string;
  name: string;
  exchange: "NASDAQ" | "NYSE" | "AMEX";
  sector: string;
};

export const STOCKS_DB: StockEntry[] = [
  { symbol: "AAPL",  name: "Apple Inc.",              exchange: "NASDAQ", sector: "Technology" },
  { symbol: "NVDA",  name: "NVIDIA Corp.",             exchange: "NASDAQ", sector: "Semiconductors" },
  { symbol: "MSFT",  name: "Microsoft Corp.",          exchange: "NASDAQ", sector: "Software" },
  { symbol: "AMD",   name: "Advanced Micro Devices",   exchange: "NASDAQ", sector: "Semiconductors" },
  { symbol: "LMT",   name: "Lockheed Martin",          exchange: "NYSE",   sector: "Defense" },
  { symbol: "TSLA",  name: "Tesla Inc.",               exchange: "NASDAQ", sector: "Automotive" },
  { symbol: "META",  name: "Meta Platforms",           exchange: "NASDAQ", sector: "Technology" },
  { symbol: "AMZN",  name: "Amazon.com Inc.",          exchange: "NASDAQ", sector: "E-commerce" },
  { symbol: "GOOGL", name: "Alphabet Inc.",            exchange: "NASDAQ", sector: "Technology" },
  { symbol: "NFLX",  name: "Netflix Inc.",             exchange: "NASDAQ", sector: "Streaming" },
  { symbol: "JPM",   name: "JPMorgan Chase",           exchange: "NYSE",   sector: "Banking" },
  { symbol: "GS",    name: "Goldman Sachs",            exchange: "NYSE",   sector: "Banking" },
  { symbol: "V",     name: "Visa Inc.",                exchange: "NYSE",   sector: "Payments" },
  { symbol: "WMT",   name: "Walmart Inc.",             exchange: "NYSE",   sector: "Retail" },
  { symbol: "XOM",   name: "ExxonMobil Corp.",         exchange: "NYSE",   sector: "Energy" },
  { symbol: "PLTR",  name: "Palantir Technologies",    exchange: "NASDAQ", sector: "Software" },
  { symbol: "ADBE",  name: "Adobe Inc.",               exchange: "NASDAQ", sector: "Software" },
  { symbol: "COIN",  name: "Coinbase Global",          exchange: "NASDAQ", sector: "Crypto" },
  { symbol: "PYPL",  name: "PayPal Holdings",          exchange: "NASDAQ", sector: "Fintech" },
  { symbol: "UBER",  name: "Uber Technologies",        exchange: "NYSE",   sector: "Technology" },
];
