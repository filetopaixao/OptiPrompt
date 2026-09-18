import type { ExecutionDTO } from "@/types/execution";

export interface ExecutionMetrics {
  modelCount: number;
  avgLatencyMs: number;
  totalTokens: number;
  totalCreditsConsumed: number;
  successCount: number;
  errorCount: number;
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

  return {
    modelCount: results.length,
    avgLatencyMs: successResults.length > 0 ? Math.round(totalLatencyMs / successResults.length) : 0,
    totalTokens,
    totalCreditsConsumed,
    successCount: successResults.length,
    errorCount: results.length - successResults.length,
  };
}
