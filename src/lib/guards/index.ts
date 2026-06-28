/** Guards de custo da rota (ADR-0002, Fatia 4). */

export { rateLimit, type RateResult } from "./rateLimit";
export { budgetOk, estimateCostUsd, recordSpend } from "./budget";

/** IP do cliente a partir dos headers de proxy (Vercel define x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
