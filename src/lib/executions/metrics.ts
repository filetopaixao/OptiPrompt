import type { ExecutionDTO } from "@/types/execution";

export interface ExecutionMetrics {
  modelCount: number;
  avgLatencyMs: number;
  totalTokens: number;
  totalCreditsConsumed: number;
  totalCostInBRL: number;
  successCount: number;
  errorCount: number;
  /** Resumo do veredito da regra entre todos os modelos da execução — null
   * quando a execução não tinha regra definida. "FAILED" prevalece sobre
   * "PASSED" (um modelo só reprovando já compromete a resposta como um
   * todo pra quem está decidindo qual versão do prompt manter). */
  ruleSummary: "PASSED" | "FAILED" | null;
}

export function aggregateExecutionMetrics(execution: ExecutionDTO): ExecutionMetrics {
  const { results } = execution;
  const successResults = results.filter((result) => result.status === "SUCCESS");

  const totalLatencyMs = successResults.reduce((sum, result) => sum + result.latencyMs, 0);
  const totalTokens = successResults.reduce(
    (sum, result) => sum + result.promptTokens + result.completionTokens,
    0,
  );
  const totalCreditsConsumed = successResults.reduce(
    (sum, result) => sum + result.estimatedCostInCredits,
    0,
  );
  const totalCostInBRL = successResults.reduce((sum, result) => sum + result.estimatedCostInBRL, 0);

  const verdicts = results.map((result) => result.ruleVerdict);
  const ruleSummary = verdicts.includes("FAILED")
    ? "FAILED"
    : verdicts.includes("PASSED")
      ? "PASSED"
      : null;

  return {
    modelCount: results.length,
    avgLatencyMs: successResults.length > 0 ? Math.round(totalLatencyMs / successResults.length) : 0,
    totalTokens,
    totalCreditsConsumed,
    totalCostInBRL,
    successCount: successResults.length,
    errorCount: results.length - successResults.length,
    ruleSummary,
  };
}
