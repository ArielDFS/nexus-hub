/**
 * Rate-limit por IP (ADR-0002, Fatia 4) — primeira barreira de abuso na rota.
 *
 * Janela fixa em memória. Ressalva: em serverless (Vercel) a memória NÃO é
 * compartilhada entre instâncias, então isto é uma defesa *por instância*, não
 * global. É suficiente como primeira barreira do demo; um limitador forte
 * (Upstash/Redis) fica no backlog. O kill-switch de orçamento (budget.ts) é a
 * trava de custo que não depende disto.
 */

const WINDOW_MS = 60_000;

interface Hit {
  count: number;
  resetAt: number;
}

const hits = new Map<string, Hit>();

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

/** Teto de missões por IP na janela. Env inválida/ausente → default 10. */
function maxPerWindow(): number {
  const n = Number(process.env.RATE_LIMIT_PER_IP);
  return Number.isFinite(n) && n > 0 ? n : 10;
}

export function rateLimit(ip: string): RateResult {
  const max = maxPerWindow();
  const now = Date.now();

  let h = hits.get(ip);
  if (!h || now >= h.resetAt) {
    h = { count: 0, resetAt: now + WINDOW_MS };
    hits.set(ip, h);
  }
  h.count += 1;

  // limpeza preguiçosa para não vazar memória sob muitos IPs distintos
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now >= v.resetAt) hits.delete(k);
  }

  return {
    ok: h.count <= max,
    remaining: Math.max(0, max - h.count),
    retryAfterSec: Math.ceil((h.resetAt - now) / 1000),
  };
}
