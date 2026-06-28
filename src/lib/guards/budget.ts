/**
 * Kill-switch de orçamento diário GLOBAL (ADR-0002, Fatia 4).
 *
 * Só missões no HOST (Gemini) contam — o premium é BYOK, ou seja, a carteira é
 * do visitante, não do host. A estimativa de custo é grosseira de propósito: o
 * objetivo é um *teto de segurança* que desliga as chamadas, não contabilidade
 * exata. Estado em memória, por instância (mesma ressalva do rateLimit.ts).
 *
 * Sem `DAILY_BUDGET_USD` no ambiente → sem teto (não atrapalha o Self-Hoster).
 */

// Preço aproximado do gemini-2.5-flash (USD por token). Ajustar se trocar o host.
const PRICE_IN_PER_TOKEN = 0.3 / 1_000_000;
const PRICE_OUT_PER_TOKEN = 2.5 / 1_000_000;

// ~4 chars por token (heurística suficiente para um teto de segurança).
const CHARS_PER_TOKEN = 4;

let dayKey = "";
let spentUsd = 0;

/** Zera o acumulado quando vira o dia (UTC). */
function rollover(): void {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dayKey) {
    dayKey = today;
    spentUsd = 0;
  }
}

/** Teto diário em USD. Env ausente/inválida → Infinity (sem teto). */
function capUsd(): number {
  const n = Number(process.env.DAILY_BUDGET_USD);
  return Number.isFinite(n) && n > 0 ? n : Infinity;
}

/** true se ainda há orçamento para uma missão no host. */
export function budgetOk(): boolean {
  rollover();
  return spentUsd < capUsd();
}

/** Custo estimado de uma missão a partir do tamanho de entrada e saída. */
export function estimateCostUsd(inputChars: number, outputChars: number): number {
  const inTokens = inputChars / CHARS_PER_TOKEN;
  const outTokens = outputChars / CHARS_PER_TOKEN;
  return inTokens * PRICE_IN_PER_TOKEN + outTokens * PRICE_OUT_PER_TOKEN;
}

/** Soma o gasto estimado de uma missão concluída no host. */
export function recordSpend(usd: number): void {
  rollover();
  spentUsd += usd;
}
