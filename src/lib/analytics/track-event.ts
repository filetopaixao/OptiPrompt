"use client";

/**
 * Dispara um evento de funil pro log mínimo (ver /api/events e o model
 * ProductEvent) — fire-and-forget, nunca bloqueia nem quebra a UI se falhar
 * (rede offline, ad-blocker etc.). Não é uma plataforma de analytics, só o
 * necessário pra medir os eventos pedidos (calculadora, cadastro Free,
 * cliques em upgrade...).
 */
export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, properties }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Sem fetch disponível (ambiente muito antigo) — não é crítico, ignora.
  }
}
