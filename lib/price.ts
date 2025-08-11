type PriceResult = { price: number, source: string };

export async function fetchPrice(symbol: string, alphaKey?: string): Promise<PriceResult> {
  const [ex, rest] = symbol.split(":");
  if (!ex || !rest) throw new Error("Invalid symbol format. Expected EXCHANGE:SYMBOL");

  if (ex === "BINANCE") {
    const code = rest.replace(/\s+/g, "");
    const u = `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(code)}`;
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) throw new Error(`Binance error ${r.status}`);
    const j: any = await r.json();
    const price = parseFloat(j.price);
    if (!isFinite(price)) throw new Error("Invalid price from Binance");
    return { price, source: "binance" };
  }

  if (!alphaKey) throw new Error("ALPHAVANTAGE_KEY not configured for non-Binance symbols");

  let ticker = rest;
  if (ex === "SIX") ticker = `${rest}.SW`;
  if (ex === "NYSE" || ex === "NASDAQ") ticker = rest;

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${alphaKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`AlphaVantage error ${res.status}`);
  const data: any = await res.json();
  const q = data["Global Quote"];
  const price = q ? parseFloat(q["05. price"]) : NaN;
  if (!isFinite(price)) throw new Error("Invalid price from Alpha Vantage");
  return { price, source: "alpha" };
}
