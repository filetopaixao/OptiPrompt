import type {
  Benchmark,
  BenchmarkCase,
  BenchmarkModel,
  BenchmarkResult,
  BenchmarkRun,
  Project,
  User,
} from "@prisma/client";
import type { BenchmarkCaseDTO, BenchmarkDTO, BenchmarkResultDTO, BenchmarkRunDTO } from "@/types/benchmark";

export function toBenchmarkResultDTO(result: BenchmarkResult): BenchmarkResultDTO {
  return {
    id: result.id,
    benchmarkCaseId: result.benchmarkCaseId,
    modelId: result.modelId,
    provider: result.provider,
    tier: result.tier,
    status: result.status,
    responseText: result.responseText,
    errorMessage: result.errorMessage,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    latencyMs: result.latencyMs,
    costInBRL: Number(result.costInBRL),
    costInCredits: result.costInCredits,
    manualQualityScore: result.manualQualityScore,
    ruleVerdict: result.ruleVerdict,
    ruleReason: result.ruleReason,
  };
}

export function toBenchmarkCaseDTO(benchmarkCase: BenchmarkCase): BenchmarkCaseDTO {
  return {
    id: benchmarkCase.id,
    systemPrompt: benchmarkCase.systemPrompt,
    userMessage: benchmarkCase.userMessage,
    attachedImageDataUrl: benchmarkCase.attachedImageDataUrl,
    expectedWinnerModelId: benchmarkCase.expectedWinnerModelId,
    expectedResponse: benchmarkCase.expectedResponse,
    tags: benchmarkCase.tags,
    isAnonymized: benchmarkCase.isAnonymized,
    createdAt: benchmarkCase.createdAt.toISOString(),
  };
}

type RunWithRelations = BenchmarkRun & {
  // null quando quem rodou teve a conta removida depois (ver onDelete:
  // SetNull no schema) — o registro da run sobrevive, só perde atribuição.
  createdByUser: Pick<User, "id" | "name" | "email"> | null;
  results: BenchmarkResult[];
};

export function toBenchmarkRunDTO(run: RunWithRelations): BenchmarkRunDTO {
  return {
    id: run.id,
    benchmarkId: run.benchmarkId,
    label: run.label,
    isBaseline: run.isBaseline,
    createdAt: run.createdAt.toISOString(),
    createdBy: run.createdByUser,
    results: run.results.map(toBenchmarkResultDTO),
  };
}

type BenchmarkWithRelations = Benchmark & {
  project: Pick<Project, "id" | "name">;
  cases: BenchmarkCase[];
  models: BenchmarkModel[];
  runs: RunWithRelations[];
};

export function toBenchmarkDTO(benchmark: BenchmarkWithRelations): BenchmarkDTO {
  return {
    id: benchmark.id,
    name: benchmark.name,
    description: benchmark.description,
    taskType: benchmark.taskType,
    criteria: benchmark.criteria,
    minQualityScore: benchmark.minQualityScore,
    maxQualityDropPoints: benchmark.maxQualityDropPoints,
    maxCostIncreasePercent: benchmark.maxCostIncreasePercent,
    maxLatencyIncreasePercent: benchmark.maxLatencyIncreasePercent,
    projectId: benchmark.project.id,
    projectName: benchmark.project.name,
    createdAt: benchmark.createdAt.toISOString(),
    updatedAt: benchmark.updatedAt.toISOString(),
    cases: benchmark.cases.map(toBenchmarkCaseDTO),
    modelIds: benchmark.models.map((m) => m.modelId),
    runs: benchmark.runs.map(toBenchmarkRunDTO),
  };
}
