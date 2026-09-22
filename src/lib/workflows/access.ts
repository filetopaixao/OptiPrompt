import { prisma } from "@/lib/db/prisma";

export async function getWorkflowAccessContext(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { projectId: true, ownedProjects: { select: { id: true } } },
  });
}

export async function findAccessibleWorkflow(workflowId: string, userId: string) {
  const context = await getWorkflowAccessContext(userId);
  return prisma.workflowProject.findFirst({
    where: {
      id: workflowId,
      OR: [
        { userId },
        ...(context.projectId ? [{ projectId: context.projectId }] : []),
        ...(context.ownedProjects.length ? [{ projectId: { in: context.ownedProjects.map((p) => p.id) } }] : []),
      ],
    },
  });
}
