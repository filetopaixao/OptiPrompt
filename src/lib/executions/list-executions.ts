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

/** Histórico compartilhado entre colaboradores do mesmo projeto (ver
 * User.projectId) — cada execução marca quem rodou (ExecutionDTO.executedBy)
 * pra distinguir de relance quem fez o quê dentro do projeto. Projetos são
 * isolados entre si: colaboradores de outro projeto nunca aparecem aqui. */
export async function listExecutionsForProject(projectId: string): Promise<ExecutionDTO[]> {
  const executions = await prisma.execution.findMany({
    where: { user: { projectId } },
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

/** Visão agregada pro dono de uma conta Enterprise: histórico dele mesmo +
 * de todos os colaboradores de todos os projetos que ele criou (ver
 * User.projectId / Project.ownerId), com cada execução marcando quem rodou
 * (ExecutionDTO.executedBy) e de qual projeto (ExecutionDTO.project) — pra
 * ele acompanhar o que cada projeto está testando. */
export async function listExecutionsForTeam(ownerId: string): Promise<ExecutionDTO[]> {
  const executions = await prisma.execution.findMany({
    where: { OR: [{ userId: ownerId }, { user: { project: { ownerId } } }] },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      prompt: { select: { name: true } },
      results: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          project: { select: { id: true, name: true } },
        },
      },
    },
  });

  return executions.map(toExecutionDTO);
}
