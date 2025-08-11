export function buildCorsHeaders(origin: string | null) {
  const allow = process.env.ALLOWED_ORIGINS || "*";
  let ok = "*";
  if (allow !== "*" && origin) {
    const list = allow.split(",").map(s => s.trim());
    if (list.includes(origin)) ok = origin;
    else ok = list[0] || "*";
  }
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
