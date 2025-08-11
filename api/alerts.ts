import { getDb } from "../lib/db";
import { fetchPrice } from "../lib/price";
import { buildCorsHeaders } from "../lib/cors";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const origin = req.headers.get("origin");
  const CORS = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS as any });
  }

  try {
    if (req.method === "POST") {
      const body = await req.json();
      const { email, symbol, percent, direction = "below" } = body || {};
      if (!email || !symbol || !percent) {
        return new Response(JSON.stringify({ error: "email, symbol, percent are required" }), { status: 400, headers: { "content-type":"application/json", ...CORS } as any });
      }
      const alphaKey = process.env.ALPHAVANTAGE_KEY;
      const { price, source } = await fetchPrice(symbol, alphaKey);
      const pct = Math.abs(parseFloat(String(percent)));
      if (!isFinite(pct) || pct <= 0) {
        return new Response(JSON.stringify({ error: "percent must be > 0" }), { status: 400, headers: { "content-type":"application/json", ...CORS } as any });
      }
      const dir = (String(direction).toLowerCase() === "above") ? "above" : "below";
      const target = dir === "below" ? price * (1 - pct/100) : price * (1 + pct/100);

      const id = crypto.randomUUID();
      const sql = getDb();
      await sql`INSERT INTO alerts (id, email, symbol, direction, percent, target_price, reference_price, source) VALUES (${id}, ${email}, ${symbol}, ${dir}, ${pct}, ${target}, ${price}, ${source})`;
      return new Response(JSON.stringify({ id, reference_price: price, target_price: target, source }), { status: 201, headers: { "content-type":"application/json", ...CORS } as any });
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const email = url.searchParams.get("email");
      const sql = getDb();
      const rows = email
        ? await sql`SELECT * FROM alerts WHERE email = ${email} ORDER BY created_at DESC LIMIT 200`
        : await sql`SELECT * FROM alerts ORDER BY created_at DESC LIMIT 200`;
      return new Response(JSON.stringify(rows), { status: 200, headers: { "content-type":"application/json", ...CORS } as any });
    }

    return new Response("Method not allowed", { status: 405, headers: CORS as any });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "unknown error" }), { status: 500, headers: { "content-type":"application/json", ...CORS } as any });
  }
}
