import type { ExecutionDTO } from "@/types/execution";

export interface ModelReliabilityRow {
  modelId: string;
  passed: number;
  total: number;
  /** Arredondado, 0-100. */
  passRate: number;
}

/**
 * Agrega o veredito da regra de IA-juiz por modelo ao longo de várias
 * execuções (não uma execução isolada) — responde "esse modelo costuma
 * manter a qualidade nesse tipo de tarefa, ou é inconsistente?", uma
 * pergunta que só existe olhando o acumulado do histórico. Só entram
 * respostas com veredito (execução tinha regra definida e o modelo não deu
 * ERROR); resultados sem regra não contam nem a favor nem contra.
 */
export function computeModelReliability(executions: ExecutionDTO[]): ModelReliabilityRow[] {
  const totals = new Map<string, { passed: number; total: number }>();

  for (const execution of executions) {
    if (!execution.rule) continue;

    for (const result of execution.results) {
      if (result.ruleVerdict === null) continue;

      const entry = totals.get(result.modelId) ?? { passed: 0, total: 0 };
      entry.total += 1;
      if (result.ruleVerdict === "PASSED") entry.passed += 1;
      totals.set(result.modelId, entry);
    }
  }

  return Array.from(totals.entries())
    .map(([modelId, { passed, total }]) => ({
      modelId,
      passed,
      total,
      passRate: Math.round((passed / total) * 100),
    }))
    .sort((a, b) => b.passRate - a.passRate || b.total - a.total);
}
