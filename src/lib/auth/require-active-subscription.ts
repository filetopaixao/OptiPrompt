import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "./current-user";

export interface ActiveSubscriptionUser {
  email: string;
  name: string | null;
  planName: string | null;
  planSlug: string | null;
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
      subscriptionStatus: true,
      mustChangePassword: true,
      plan: { select: { name: true, slug: true } },
    },
  });

  // Senha provisória (conta criada pelo admin) — troca obrigatória antes de
  // qualquer outra coisa, inclusive antes de checar assinatura.
  if (user.mustChangePassword) {
    redirect("/trocar-senha");
  }

  if (user.subscriptionStatus !== "ACTIVE") {
    redirect("/?assinatura=necessaria");
  }

  return {
    email: user.email,
    name: user.name,
    planName: user.plan?.name ?? null,
    planSlug: user.plan?.slug ?? null,
  };
}
