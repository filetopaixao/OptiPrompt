import { prisma } from "@/lib/db/prisma";

/**
 * Contas de cliente geridas por uma agência Enterprise (User.managedByUserId,
 * ver src/app/app/clients) não têm plano/assinatura/créditos próprios — tudo
 * isso resolve pro dono. Use esta função em qualquer lugar que hoje faz
 * `prisma.user.findUnique({ where: { id: userId }, select: { plan: ... } })`
 * ou mexe em créditos/OpenRouter, pra sempre operar na conta que realmente
 * paga, nunca na conta que só está logada.
 *
 * Contas comuns (sem managedByUserId) são donas de si mesmas — a função
 * simplesmente devolve o próprio id.
 */
export async function getBillingOwnerId(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { managedByUserId: true },
  });
  return user.managedByUserId ?? userId;
}
