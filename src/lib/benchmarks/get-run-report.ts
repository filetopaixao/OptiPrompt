import { prisma } from "@/lib/db/prisma";
import type { BenchmarkThresholds } from "./diff";
import { canAccessProject } from "./access";
import { toBenchmarkCaseDTO, toBenchmarkRunDTO } from "./to-dto";
import type { BenchmarkCaseDTO, BenchmarkRunDTO } from "@/types/benchmark";

export interface BenchmarkRunReportData {
  run: BenchmarkRunDTO;
  benchmarkName: string;
  benchmarkDescription: string | null;
  projectName: string;
  cases: BenchmarkCaseDTO[];
  baselineRun: BenchmarkRunDTO | null;
  thresholds: BenchmarkThresholds;
}

/** Carrega os dados pro relatório de uma BenchmarkRun específica — mesma
 * checagem de acesso por projeto do resto do módulo (ver access.ts). */
export async function getBenchmarkRunReport(
  userId: string,
  runId: string,
): Promise<BenchmarkRunReportData | null> {
  const run = await prisma.benchmarkRun.findUnique({
    where: { id: runId },
    include: {
      createdByUser: { select: { id: true, name: true, email: true } },
      results: true,
      benchmark: {
        include: {
          project: { select: { name: true } },
          cases: { orderBy: { createdAt: "asc" } },
          runs: {
            where: { isBaseline: true },
            include: { createdByUser: { select: { id: true, name: true, email: true } }, results: true },
          },
        },
      },
    },
  });
  if (!run) return null;

  const hasAccess = await canAccessProject(userId, run.benchmark.projectId);
  if (!hasAccess) return null;

  const baseline = run.benchmark.runs[0];

  return {
    run: toBenchmarkRunDTO(run),
    benchmarkName: run.benchmark.name,
    benchmarkDescription: run.benchmark.description,
    projectName: run.benchmark.project.name,
    cases: run.benchmark.cases.map(toBenchmarkCaseDTO),
    baselineRun: baseline && baseline.id !== run.id ? toBenchmarkRunDTO(baseline) : null,
    thresholds: {
      minQualityScore: run.benchmark.minQualityScore,
      maxQualityDropPoints: run.benchmark.maxQualityDropPoints,
      maxCostIncreasePercent: run.benchmark.maxCostIncreasePercent,
      maxLatencyIncreasePercent: run.benchmark.maxLatencyIncreasePercent,
    },
  };
}
