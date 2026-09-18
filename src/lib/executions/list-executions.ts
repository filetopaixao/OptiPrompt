import { prisma } from "@/lib/db/prisma";
import type { ExecutionDTO } from "@/types/execution";
import { toExecutionDTO } from "./to-dto";

export async function listExecutionsForUser(userId: string): Promise<ExecutionDTO[]> {
  const executions = await prisma.execution.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { prompt: { select: { name: true } }, results: true },
  });

  return executions.map(toExecutionDTO);
}
