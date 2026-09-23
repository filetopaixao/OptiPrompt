export interface SavingsCalculatorInput {
  /** Gasto mensal atual com APIs de IA, em reais. */
  monthlySpendInBRL: number;
  /** % do gasto que é afetado pela escolha do modelo (0-100). */
  optimizablePercent: number;
  /** % de economia esperada sobre a parcela otimizável (0-100). */
  expectedSavingsPercent: number;
}

export interface SavingsCalculatorResult {
  monthlySpendInBRL: number;
  optimizableSpendInBRL: number;
  estimatedMonthlySavingsInBRL: number;
  estimatedAnnualSavingsInBRL: number;
  projectedMonthlySpendInBRL: number;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculadora de economia da landing page — fórmula transparente e local
 * (nenhuma chamada ao OpenRouter, resultado instantâneo):
 *
 *   gasto_otimizavel = gasto_mensal × percentual_otimizavel
 *   economia_estimada = gasto_otimizavel × percentual_economia
 *   gasto_projetado = gasto_mensal - economia_estimada
 *
 * Entradas negativas ou vazias (NaN) viram 0; percentuais são sempre
 * limitados a 0-100 mesmo que a UI já limite via slider — nunca confiar só
 * na trava do componente. Valores monetários de saída são arredondados pra
 * centavos (a precisão de ponto flutuante intermediária não é exposta).
 */
export function calculateSavings(input: SavingsCalculatorInput): SavingsCalculatorResult {
  const monthlySpend = clamp(input.monthlySpendInBRL, 0, Number.MAX_SAFE_INTEGER);
  const optimizablePercent = clamp(input.optimizablePercent, 0, 100);
  const expectedSavingsPercent = clamp(input.expectedSavingsPercent, 0, 100);

  const optimizableSpend = monthlySpend * (optimizablePercent / 100);
  const estimatedMonthlySavings = optimizableSpend * (expectedSavingsPercent / 100);
  const projectedMonthlySpend = monthlySpend - estimatedMonthlySavings;

  return {
    monthlySpendInBRL: roundToCents(monthlySpend),
    optimizableSpendInBRL: roundToCents(optimizableSpend),
    estimatedMonthlySavingsInBRL: roundToCents(estimatedMonthlySavings),
    estimatedAnnualSavingsInBRL: roundToCents(estimatedMonthlySavings * 12),
    projectedMonthlySpendInBRL: roundToCents(projectedMonthlySpend),
  };
}
