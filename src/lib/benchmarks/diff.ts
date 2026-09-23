export interface BenchmarkResultLike {
  status: "SUCCESS" | "ERROR";
  costInBRL: number;
  latencyMs: number;
  manualQualityScore: number | null;
}

export interface BenchmarkThresholds {
  minQualityScore?: number | null;
  maxQualityDropPoints?: number | null;
  maxCostIncreasePercent?: number | null;
  maxLatencyIncreasePercent?: number | null;
}

export type RegressionVerdict = "APROVADO" | "ATENCAO" | "REPROVADO";

export interface BenchmarkRunAggregate {
  avgCostInBRL: number;
  avgLatencyMs: number;
  /** null quando nenhum resultado bem-sucedido tem nota manual de
   * qualidade — v1 usa revisão manual (ver Parte 3 do pedido). */
  avgQualityScore: number | null;
  errorRate: number;
  total: number;
}

export interface BenchmarkDiffResult {
  verdict: RegressionVerdict;
  reasons: string[];
  baseline: BenchmarkRunAggregate;
  candidate: BenchmarkRunAggregate;
  costDeltaPercent: number | null;
  latencyDeltaPercent: number | null;
  qualityDeltaPoints: number | null;
}

/** Fração da margem de "piora máxima de qualidade" a partir da qual, mesmo
 * sem estourar o limite, o resultado já merece atenção (ex.: limite de 1.0
 * ponto, queda de 0.7 já avisa em vez de deixar o usuário descobrir só
 * quando ultrapassar). */
const ATTENTION_THRESHOLD_RATIO = 0.7;

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function aggregate(results: BenchmarkResultLike[]): BenchmarkRunAggregate {
  const successResults = results.filter((r) => r.status === "SUCCESS");
  const qualityScores = successResults
    .map((r) => r.manualQualityScore)
    .filter((score): score is number => score !== null);

  return {
    avgCostInBRL: average(successResults.map((r) => r.costInBRL)) ?? 0,
    avgLatencyMs: average(successResults.map((r) => r.latencyMs)) ?? 0,
    avgQualityScore: average(qualityScores),
    errorRate: results.length > 0 ? (results.length - successResults.length) / results.length : 0,
    total: results.length,
  };
}

function percentDelta(from: number, to: number): number | null {
  if (from <= 0) return null;
  return ((to - from) / from) * 100;
}

function formatBRL(value: number): string {
  return `R$${value.toFixed(4)}`;
}

/**
 * Compara duas execuções de benchmark (baseline vs. candidata) contra os
 * limites configurados (ver Benchmark.minQualityScore/maxQualityDropPoints/
 * maxCostIncreasePercent/maxLatencyIncreasePercent) — v1 usa regras
 * determinísticas (Parte 3 do pedido: "começar com regras determinísticas e
 * revisão manual"), sem depender de um juiz de IA.
 *
 * Um benchmark sem nenhum limite configurado nunca reprova automaticamente
 * — só informa as diferenças (comportamento pensado pra não travar quem
 * ainda não decidiu os critérios).
 */
export function compareBenchmarkRuns(
  baselineResults: BenchmarkResultLike[],
  candidateResults: BenchmarkResultLike[],
  thresholds: BenchmarkThresholds = {},
): BenchmarkDiffResult {
  const baseline = aggregate(baselineResults);
  const candidate = aggregate(candidateResults);

  const costDeltaPercent = percentDelta(baseline.avgCostInBRL, candidate.avgCostInBRL);
  const latencyDeltaPercent = percentDelta(baseline.avgLatencyMs, candidate.avgLatencyMs);
  const qualityDeltaPoints =
    baseline.avgQualityScore !== null && candidate.avgQualityScore !== null
      ? candidate.avgQualityScore - baseline.avgQualityScore
      : null;

  const reasons: string[] = [];
  let verdict: RegressionVerdict = "APROVADO";

  function fail(reason: string) {
    verdict = "REPROVADO";
    reasons.push(reason);
  }
  function warn(reason: string) {
    if (verdict !== "REPROVADO") verdict = "ATENCAO";
    reasons.push(reason);
  }

  // Erros novos (formato inválido, falha de chamada etc.) — qualquer
  // aumento na taxa de erro já reprova, seguindo o exemplo do pedido
  // ("JSON inválido em 3 de 25 casos" = REPROVADO direto).
  if (candidate.errorRate > baseline.errorRate) {
    const errorCount = Math.round(candidate.errorRate * candidate.total);
    fail(`${errorCount} de ${candidate.total} casos falharam (antes: ${Math.round(baseline.errorRate * baseline.total)}).`);
  }

  if (thresholds.maxCostIncreasePercent != null && costDeltaPercent !== null) {
    if (costDeltaPercent > thresholds.maxCostIncreasePercent) {
      fail(
        `Custo ${costDeltaPercent.toFixed(0)}% acima do limite de ${thresholds.maxCostIncreasePercent}% (${formatBRL(baseline.avgCostInBRL)} → ${formatBRL(candidate.avgCostInBRL)}).`,
      );
    } else if (costDeltaPercent > 0) {
      reasons.push(
        `Custo: ${formatBRL(baseline.avgCostInBRL)} → ${formatBRL(candidate.avgCostInBRL)}, dentro do limite`,
      );
    } else {
      reasons.push(`Custo: ${formatBRL(baseline.avgCostInBRL)} → ${formatBRL(candidate.avgCostInBRL)}, melhoria`);
    }
  }

  if (thresholds.maxLatencyIncreasePercent != null && latencyDeltaPercent !== null) {
    if (latencyDeltaPercent > thresholds.maxLatencyIncreasePercent) {
      fail(
        `Latência ${latencyDeltaPercent.toFixed(0)}% acima do limite de ${thresholds.maxLatencyIncreasePercent}% (${Math.round(baseline.avgLatencyMs)}ms → ${Math.round(candidate.avgLatencyMs)}ms).`,
      );
    } else if (latencyDeltaPercent > 0) {
      reasons.push(`Latência: ${Math.round(baseline.avgLatencyMs)}ms → ${Math.round(candidate.avgLatencyMs)}ms, dentro do limite`);
    } else {
      reasons.push(`Latência: ${Math.round(baseline.avgLatencyMs)}ms → ${Math.round(candidate.avgLatencyMs)}ms, melhoria`);
    }
  }

  if (thresholds.minQualityScore != null && candidate.avgQualityScore !== null) {
    if (candidate.avgQualityScore < thresholds.minQualityScore) {
      fail(`Qualidade ${candidate.avgQualityScore.toFixed(1)} abaixo do mínimo de ${thresholds.minQualityScore}.`);
    }
  }

  if (qualityDeltaPoints !== null && qualityDeltaPoints < 0) {
    const dropAmount = Math.abs(qualityDeltaPoints);
    if (thresholds.maxQualityDropPoints != null) {
      if (dropAmount > thresholds.maxQualityDropPoints) {
        fail(
          `Queda de qualidade de ${dropAmount.toFixed(1)} pontos acima do limite de ${thresholds.maxQualityDropPoints} (${baseline.avgQualityScore?.toFixed(1)} → ${candidate.avgQualityScore?.toFixed(1)}).`,
        );
      } else if (dropAmount >= thresholds.maxQualityDropPoints * ATTENTION_THRESHOLD_RATIO) {
        warn(
          `Qualidade: ${baseline.avgQualityScore?.toFixed(1)} → ${candidate.avgQualityScore?.toFixed(1)}, próximo do limite`,
        );
      } else {
        reasons.push(
          `Qualidade: ${baseline.avgQualityScore?.toFixed(1)} → ${candidate.avgQualityScore?.toFixed(1)}, queda dentro do limite`,
        );
      }
    } else {
      warn(`Qualidade: ${baseline.avgQualityScore?.toFixed(1)} → ${candidate.avgQualityScore?.toFixed(1)}, caiu`);
    }
  } else if (qualityDeltaPoints !== null && qualityDeltaPoints > 0) {
    reasons.push(`Qualidade: ${baseline.avgQualityScore?.toFixed(1)} → ${candidate.avgQualityScore?.toFixed(1)}, melhoria`);
  }

  if (reasons.length === 0) {
    reasons.push("Sem diferença relevante em relação à baseline.");
  }

  return { verdict, reasons, baseline, candidate, costDeltaPercent, latencyDeltaPercent, qualityDeltaPoints };
}
