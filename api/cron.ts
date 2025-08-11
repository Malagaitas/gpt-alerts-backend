import { getDb } from "../lib/db";
import { fetchPrice } from "../lib/price";
import { sendEmail } from "../lib/email";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const sql = getDb();
  const alphaKey = process.env.ALPHAVANTAGE_KEY;

  const active: any[] = await sql`SELECT * FROM alerts WHERE active = true ORDER BY created_at ASC LIMIT 100`;

  let checked = 0, triggered = 0, errors: string[] = [];
  const bySymbol: Record<string, any[]> = {};
  for (const a of active) (bySymbol[a.symbol] ||= []).push(a);

  for (const [symbol, alerts] of Object.entries(bySymbol)) {
    try {
      const { price } = await fetchPrice(symbol, alphaKey);
      checked += (alerts as any[]).length;
      for (const a of alerts as any[]) {
        const hit = (a.direction === 'below' && price <= Number(a.target_price)) ||
                    (a.direction === 'above' && price >= Number(a.target_price));
        if (hit) {
          const subject = `Alert: ${symbol} hit ${a.direction === 'below' ? '≤' : '≥'} target`;
          const diffPct = ((price - Number(a.reference_price)) / Number(a.reference_price)) * 100;
          const html = `<p>Your alert was triggered.</p>
                        <ul>
                          <li><b>Symbol:</b> ${symbol}</li>
                          <li><b>Direction:</b> ${a.direction}</li>
                          <li><b>Threshold:</b> ${a.percent}%</li>
                          <li><b>Reference price:</b> ${a.reference_price}</li>
                          <li><b>Target price:</b> ${a.target_price}</li>
                          <li><b>Current price:</b> ${price}</li>
                          <li><b>Change vs reference:</b> ${diffPct.toFixed(2)}%</li>
                        </ul>`;
          await sendEmail(a.email, subject, html, `Alert ${symbol} ${a.direction} target. Current: ${price}`);
          await sql`UPDATE alerts SET active = false, triggered_at = NOW() WHERE id = ${a.id}`;
          triggered += 1;
        }
      }
    } catch (e: any) {
      errors.push(`${symbol}: ${e?.message || e}`);
    }
  }

  return new Response(JSON.stringify({ checked, triggered, errors }), { status: 200, headers: { "content-type": "application/json" } });
}
