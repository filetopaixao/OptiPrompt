import { prisma } from "@/lib/db/prisma";
import type { BenchmarkDTO } from "@/types/benchmark";
import { canAccessProject } from "./access";
import { toBenchmarkDTO } from "./to-dto";

/** Carrega um benchmark completo (casos, modelos, runs com resultados) só
 * se `userId` puder ver o projeto dono dele (ver canAccessProject) — null
 * tanto pra "não existe" quanto pra "sem permissão", pra não vazar a
 * existência de benchmarks de outros workspaces (mesmo padrão de
 * getExecutionById). */
export async function getBenchmarkById(userId: string, benchmarkId: string): Promise<BenchmarkDTO | null> {
  const benchmark = await prisma.benchmark.findUnique({
    where: { id: benchmarkId },
    include: {
      project: { select: { id: true, name: true } },
      cases: { orderBy: { createdAt: "asc" } },
      models: true,
      runs: {
        orderBy: { createdAt: "desc" },
        include: {
          createdByUser: { select: { id: true, name: true, email: true } },
          results: true,
        },
      },
    },
  });
  if (!benchmark) return null;

  const hasAccess = await canAccessProject(userId, benchmark.projectId);
  if (!hasAccess) return null;

  return toBenchmarkDTO(benchmark);
}
