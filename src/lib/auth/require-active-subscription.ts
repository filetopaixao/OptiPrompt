import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "./current-user";

export interface ActiveSubscriptionUser {
  email: string;
  name: string | null;
  planName: string | null;
  planSlug: string | null;
  /** true quando esta conta é um cliente gerido por uma agência Enterprise
   * (ver User.managedByUserId) — plano/assinatura acima já vêm do dono,
   * não desta conta. Usado pra esconder telas de billing/gestão de clientes
   * que só fazem sentido pra quem realmente paga a assinatura. */
  isManagedAccount: boolean;
}

/**
 * Gate de assinatura. Roda em Server Components (Node.js), não em
 * middleware.ts — o Edge runtime do middleware não suporta o driver
 * node-postgres do Prisma sem Prisma Accelerate (serviço pago à parte).
 * A identidade já é resolvida por getCurrentUserId() via sessão NextAuth;
 * aqui só valida se a assinatura dessa conta está ativa.
 *
 * Retorna os dados básicos do usuário (já buscados pra checar a assinatura)
 * pra quem chamar reaproveitar em vez de fazer uma segunda consulta — ver
 * uso em src/app/app/layout.tsx (menu do usuário no header).
 */
export async function requireActiveSubscription(): Promise<ActiveSubscriptionUser> {
  const userId = await getCurrentUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      mustChangePassword: true,
      managedByUserId: true,
      subscriptionStatus: true,
      plan: { select: { name: true, slug: true } },
    },
  });

  // Senha provisória (conta criada pelo admin ou por uma agência Enterprise
  // pra um cliente) — troca obrigatória antes de qualquer outra coisa,
  // inclusive antes de checar assinatura.
  if (user.mustChangePassword) {
    redirect("/trocar-senha");
  }

  // Conta de cliente gerida (ver User.managedByUserId): não tem assinatura
  // própria, tudo isso vem de quem gere ela.
  const billingOwner = user.managedByUserId
    ? await prisma.user.findUniqueOrThrow({
        where: { id: user.managedByUserId },
        select: { subscriptionStatus: true, plan: { select: { name: true, slug: true } } },
      })
    : user;

  if (billingOwner.subscriptionStatus !== "ACTIVE") {
    redirect("/?assinatura=necessaria");
  }

  return {
    email: user.email,
    name: user.name,
    planName: billingOwner.plan?.name ?? null,
    planSlug: billingOwner.plan?.slug ?? null,
    isManagedAccount: user.managedByUserId !== null,
  };
}
