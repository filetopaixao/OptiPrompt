import { prisma } from "@/lib/db/prisma";
import type { ExecutionDTO } from "@/types/execution";
import { toExecutionDTO } from "./to-dto";

export async function getExecutionById(
  userId: string,
  executionId: string,
): Promise<ExecutionDTO | null> {
  const execution = await prisma.execution.findFirst({
    where: { id: executionId, userId },
    include: { prompt: { select: { name: true } }, results: true },
  });

  return execution ? toExecutionDTO(execution) : null;
}
