import { prisma } from "@/lib/db/prisma";

/** Quem pode ver/editar um projeto (e, por extensão, os benchmarks dentro
 * dele): o dono, ou — só em projetos Enterprise com colaboradores — um
 * colaborador vinculado ao mesmo projeto (ver User.projectId). Mesma regra
 * de visibilidade já usada pro histórico compartilhado
 * (listExecutionsForProject). */
export async function canAccessProject(userId: string, projectId: string): Promise<boolean> {
  const [project, viewer] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { projectId: true } }),
  ]);
  if (!project) return false;
  return project.ownerId === userId || viewer.projectId === projectId;
}

/** IDs de todos os projetos que `userId` pode ver — os que ele é dono, mais
 * o projeto do qual é colaborador (no máximo 1, ver User.projectId). Usado
 * pra listar benchmarks sem carregar todo o catálogo de projetos do banco. */
export async function getAccessibleProjectIds(userId: string): Promise<string[]> {
  const [ownedProjects, viewer] = await Promise.all([
    prisma.project.findMany({ where: { ownerId: userId }, select: { id: true } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { projectId: true } }),
  ]);
  const ids = new Set(ownedProjects.map((p) => p.id));
  if (viewer.projectId) ids.add(viewer.projectId);
  return Array.from(ids);
}
