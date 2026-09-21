/**
 * Motor de créditos: converte custo real (R$) em créditos internos.
 * R$ 0,01 = 10 créditos → 1 crédito = R$ 0,001.
 *
 * A barra de cota do dashboard mostra o saldo numérico de créditos
 * (ver components/dashboard/usage-progress-bar.tsx) — não mais percentual.
 */
const BRL_PER_CREDIT = 0.001;

/** Percentual da assinatura do plano que vira o teto mensal de créditos. */
const PLAN_CREDIT_CEILING_RATIO = 0.2;

export function brlToCredits(amountInBRL: number): number {
  return Math.ceil(amountInBRL / BRL_PER_CREDIT);
}

export function creditsToBRL(credits: number): number {
  return Number((credits * BRL_PER_CREDIT).toFixed(6));
}

/** Cotação usada em toda conversão USD↔BRL do app (ex.: teto de gasto
 * provisionado no OpenRouter, ver src/lib/openrouter/client.ts) — não é
 * buscada em tempo real, ajuste aqui se ela mudar muito. */
export const USD_TO_BRL_RATE = 5.13;

export function creditsToUSD(credits: number): number {
  return Number((creditsToBRL(credits) / USD_TO_BRL_RATE).toFixed(6));
}

/** Teto mensal de créditos = 20% do valor da assinatura do plano, convertido
 * em créditos. Derivado do preço, não armazenado, para nunca dessincronizar
 * — exceto quando o plano tem fixedMonthlyCreditLimit setado (ex.: o plano
 * Gratuito, que tem preço 0 mas precisa de um teto próprio; ver
 * src/lib/plans/trial.ts), caso em que esse valor manda.
 *
 * Calculado inteiramente em centavos (1 centavo = 10 créditos) em vez de
 * passar por R$ fracionário — evita erro de ponto flutuante do tipo
 * "247 * 0.2 = 49.400000000000006" virar 49.401 créditos por causa do ceil. */
export function getMonthlyCreditLimit(plan: {
  priceInCents: number;
  fixedMonthlyCreditLimit: number | null;
}): number {
  if (plan.fixedMonthlyCreditLimit !== null) return plan.fixedMonthlyCreditLimit;
  const ceilingInCents = Math.round(plan.priceInCents * PLAN_CREDIT_CEILING_RATIO);
  return ceilingInCents * 10;
}

export function usagePercentage(creditsUsed: number, creditLimit: number): number {
  if (creditLimit <= 0) return 0;
  return Math.min(100, Math.round((creditsUsed / creditLimit) * 100));
}

/** Classificação de impacto de custo exibida como badge no card de resultado. */
export type CostImpact = "low" | "medium" | "high";

export function classifyCostImpact(estimatedCostInCredits: number): CostImpact {
  if (estimatedCostInCredits <= 5) return "low";
  if (estimatedCostInCredits <= 25) return "medium";
  return "high";
}
