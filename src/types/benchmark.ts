import type { ModelTier, Provider } from "./models";

export interface BenchmarkResultDTO {
  id: string;
  benchmarkCaseId: string;
  modelId: string;
  provider: Provider;
  tier: ModelTier;
  status: "SUCCESS" | "ERROR";
  responseText: string | null;
  errorMessage: string | null;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  costInBRL: number;
  costInCredits: number;
  manualQualityScore: number | null;
  ruleVerdict: "PASSED" | "FAILED" | null;
  ruleReason: string | null;
}

export interface BenchmarkRunDTO {
  id: string;
  benchmarkId: string;
  label: string | null;
  isBaseline: boolean;
  createdAt: string;
  /** null quando a conta de quem rodou foi removida depois (ex.: colaborador
   * excluído) — a run sobrevive, só perde atribuição (ver onDelete: SetNull
   * no schema). */
  createdBy: { id: string; name: string | null; email: string } | null;
  results: BenchmarkResultDTO[];
}

export interface BenchmarkCaseDTO {
  id: string;
  systemPrompt: string | null;
  userMessage: string;
  attachedImageDataUrl: string | null;
  expectedWinnerModelId: string | null;
  expectedResponse: string | null;
  tags: string[];
  isAnonymized: boolean;
  createdAt: string;
}

export interface BenchmarkDTO {
  id: string;
  name: string;
  description: string | null;
  taskType: string | null;
  criteria: string[];
  minQualityScore: number | null;
  maxQualityDropPoints: number | null;
  maxCostIncreasePercent: number | null;
  maxLatencyIncreasePercent: number | null;
  projectId: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  cases: BenchmarkCaseDTO[];
  modelIds: string[];
  runs: BenchmarkRunDTO[];
}

/** Versão leve pra lista de benchmarks — sem casos/runs completos. */
export interface BenchmarkSummaryDTO {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  caseCount: number;
  modelCount: number;
  runCount: number;
  lastRunAt: string | null;
  hasBaseline: boolean;
}
