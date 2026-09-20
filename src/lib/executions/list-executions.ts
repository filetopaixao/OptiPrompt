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

/** Visão agregada pro dono de uma conta Enterprise: histórico dele mesmo +
 * de todos os clientes que ele gerencia (ver User.managedByUserId), com
 * cada execução marcando quem rodou (ExecutionDTO.executedBy) — pra ele
 * acompanhar o que a carteira de clientes está testando. */
export async function listExecutionsForTeam(ownerId: string): Promise<ExecutionDTO[]> {
  const executions = await prisma.execution.findMany({
    where: { OR: [{ userId: ownerId }, { user: { managedByUserId: ownerId } }] },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      prompt: { select: { name: true } },
      results: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return executions.map(toExecutionDTO);
}
