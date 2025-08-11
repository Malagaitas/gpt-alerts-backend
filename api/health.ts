export const config = { runtime: 'edge' };
export default async function handler() {
  return new Response(JSON.stringify({ ok: true, now: new Date().toISOString() }), { status: 200, headers: { "content-type":"application/json" } });
}
