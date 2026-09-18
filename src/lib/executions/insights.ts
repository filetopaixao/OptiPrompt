import type { ExecutionResultDTO } from "@/types/execution";

export type ComparisonPriority = "speed" | "price";

export interface WinnerInsight {
  winner: ExecutionResultDTO;
  runnerUp: ExecutionResultDTO;
  /** Quanto o vencedor é melhor que o segundo colocado, em %. */
  percentGain: number;
}

function metricFor(result: ExecutionResultDTO, priority: ComparisonPriority): number {
  return priority === "speed" ? result.latencyMs : result.estimatedCostInBRL;
}

/**
 * Elege o "modelo vencedor" da execução por velocidade ou por preço — menor
 * métrica vence. Precisa de pelo menos 2 respostas bem-sucedidas para fazer
 * sentido comparar; caso contrário não há "vencedor", só um resultado.
 */
export function computeWinner(
  results: ExecutionResultDTO[],
  priority: ComparisonPriority,
): WinnerInsight | null {
  const successResults = results.filter((r) => r.status === "SUCCESS");
  if (successResults.length < 2) return null;

  const sorted = [...successResults].sort(
    (a, b) => metricFor(a, priority) - metricFor(b, priority),
  );
  const [winner, runnerUp] = sorted;

  const winnerMetric = metricFor(winner, priority);
  const runnerUpMetric = metricFor(runnerUp, priority);
  const percentGain =
    runnerUpMetric > 0 ? Math.round(((runnerUpMetric - winnerMetric) / runnerUpMetric) * 100) : 0;

  return { winner, runnerUp, percentGain };
}

export interface LatencyRow {
  modelId: string;
  latencyMs: number;
}

/** Ordena os resultados bem-sucedidos por latência (mais rápido primeiro) —
 * usado no gráfico de velocidade, alternativa ao projectMonthlyCost. */
export function buildLatencyComparison(results: ExecutionResultDTO[]): LatencyRow[] {
  return results
    .filter((r) => r.status === "SUCCESS")
    .map((r) => ({ modelId: r.modelId, latencyMs: r.latencyMs }))
    .sort((a, b) => a.latencyMs - b.latencyMs);
}

export interface CostProjectionRow {
  modelId: string;
  costPerRequestBRL: number;
  monthlyCostBRL: number;
}

/** Projeta o custo mensal de cada modelo bem-sucedido para um volume de
 * requisições informado pelo usuário (simulador de escala). */
export function projectMonthlyCost(
  results: ExecutionResultDTO[],
  requestsPerMonth: number,
): CostProjectionRow[] {
  return results
    .filter((r) => r.status === "SUCCESS")
    .map((r) => ({
      modelId: r.modelId,
      costPerRequestBRL: r.estimatedCostInBRL,
      monthlyCostBRL: r.estimatedCostInBRL * requestsPerMonth,
    }))
    .sort((a, b) => a.monthlyCostBRL - b.monthlyCostBRL);
}
