import { prisma } from "@/lib/db/prisma";

/**
 * Contas colaboradoras de um projeto dentro de uma agência Enterprise
 * (User.projectId, ver src/app/app/projects) não têm plano/assinatura/
 * créditos próprios — tudo isso resolve pro dono do projeto. Use esta
 * função em qualquer lugar que hoje faz
 * `prisma.user.findUnique({ where: { id: userId }, select: { plan: ... } })`
 * ou mexe em créditos/OpenRouter, pra sempre operar na conta que realmente
 * paga, nunca na conta que só está logada.
 *
 * Contas comuns (sem projectId) são donas de si mesmas — a função
 * simplesmente devolve o próprio id.
 */
export async function getBillingOwnerId(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { project: { select: { ownerId: true } } },
  });
  return user.project?.ownerId ?? userId;
}
