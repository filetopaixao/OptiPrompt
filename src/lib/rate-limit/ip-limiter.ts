/**
 * Rate limiter em memória, por IP — janela deslizante simples com um
 * `Map<ip, timestamps[]>`. Suficiente pra proteger a execução diária do
 * plano Free contra scripts batendo várias vezes seguidas; não sobrevive a
 * restart nem funciona entre múltiplas instâncias do servidor (documentado
 * como limitação conhecida — ver resumo da Release 1). Se o app escalar
 * horizontalmente, isso precisa virar Redis ou equivalente compartilhado.
 */
const attemptsByKey = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

/** true quando `key` já bateu `maxAttempts` dentro de `windowMs` — cada
 * chamada (permitida ou não) registra uma nova tentativa na janela. */
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (attemptsByKey.get(key) ?? []).filter((ts) => ts > windowStart);

  if (timestamps.length >= maxAttempts) {
    const oldestInWindow = timestamps[0];
    attemptsByKey.set(key, timestamps);
    return { allowed: false, retryAfterMs: oldestInWindow + windowMs - now };
  }

  timestamps.push(now);
  attemptsByKey.set(key, timestamps);
  return { allowed: true };
}

/** Extrai o IP do cliente a partir dos headers de proxy padrão — Next.js
 * não expõe `request.ip` de forma confiável em todo runtime. Retorna null
 * quando nenhum header está presente (ex.: chamada direta em dev). */
export function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;
  return headers.get("x-real-ip");
}
