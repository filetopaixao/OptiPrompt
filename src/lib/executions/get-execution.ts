import { prisma } from "@/lib/db/prisma";
import type { ExecutionDTO } from "@/types/execution";
import { toExecutionDTO } from "./to-dto";

/** Quem pode ver o relatório de uma execução: quem rodou, qualquer
 * colaborador do mesmo projeto (histórico compartilhado, ver
 * listExecutionsForProject) ou o dono do projeto (visão agregada, ver
 * listExecutionsForTeam) — mesmas regras de visibilidade da lista de
 * histórico. Sem isso, o link "Relatório" que já aparece ali pra execuções
 * de outros colaboradores levaria a um 404. */
export async function getExecutionById(
  userId: string,
  executionId: string,
): Promise<ExecutionDTO | null> {
  const execution = await prisma.execution.findUnique({
    where: { id: executionId },
    include: {
      prompt: { select: { name: true } },
      results: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          projectId: true,
          project: { select: { id: true, name: true, ownerId: true } },
        },
      },
    },
  });
  if (!execution) return null;

  if (execution.userId === userId) {
    return toExecutionDTO(execution);
  }

  const viewer = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { projectId: true },
  });

  const isSameProjectTeammate =
    viewer.projectId !== null && execution.user.projectId === viewer.projectId;
  const isProjectOwnerViewing = execution.user.project?.ownerId === userId;

  if (!isSameProjectTeammate && !isProjectOwnerViewing) return null;

  return toExecutionDTO(execution);
}
