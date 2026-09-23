import { prisma } from "@/lib/db/prisma";
import type { BenchmarkSummaryDTO } from "@/types/benchmark";
import { getAccessibleProjectIds } from "./access";

/** Lista os benchmarks de todos os projetos que o usuário pode ver (dono ou
 * colaborador — ver getAccessibleProjectIds), mais recentes primeiro. */
export async function listBenchmarksForUser(userId: string): Promise<BenchmarkSummaryDTO[]> {
  const projectIds = await getAccessibleProjectIds(userId);
  if (projectIds.length === 0) return [];

  const benchmarks = await prisma.benchmark.findMany({
    where: { projectId: { in: projectIds } },
    orderBy: { updatedAt: "desc" },
    include: {
      project: { select: { name: true } },
      cases: { select: { id: true } },
      models: { select: { id: true } },
      runs: { select: { id: true, isBaseline: true, createdAt: true }, orderBy: { createdAt: "desc" } },
    },
  });

  return benchmarks.map((benchmark) => ({
    id: benchmark.id,
    name: benchmark.name,
    projectId: benchmark.projectId,
    projectName: benchmark.project.name,
    caseCount: benchmark.cases.length,
    modelCount: benchmark.models.length,
    runCount: benchmark.runs.length,
    lastRunAt: benchmark.runs[0]?.createdAt.toISOString() ?? null,
    hasBaseline: benchmark.runs.some((run) => run.isBaseline),
  }));
}
