import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { expireTrialIfNeeded } from "./expire-trial";
import { getCurrentUserId } from "./current-user";

export interface ActiveSubscriptionUser {
  email: string;
  name: string | null;
  planName: string | null;
  planSlug: string | null;
  /** true quando esta conta é colaboradora de um projeto dentro de uma
   * agência Enterprise (ver User.projectId) — plano/assinatura acima já
   * vêm do dono do projeto, não desta conta. Usado pra esconder telas de
   * billing/gestão de projetos que só fazem sentido pra quem realmente
   * paga a assinatura. */
  isManagedAccount: boolean;
  /** Projeto do qual esta conta é colaboradora (ver User.projectId) — null
   * pra conta dona/comum. Usado pra escopar o histórico compartilhado (ver
   * listExecutionsForProject). */
  projectId: string | null;
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
      projectId: true,
      project: { select: { ownerId: true } },
    },
  });

  // Senha provisória (conta criada pelo admin ou por uma agência Enterprise
  // pra um colaborador de projeto) — troca obrigatória antes de qualquer
  // outra coisa, inclusive antes de checar assinatura.
  if (user.mustChangePassword) {
    redirect("/trocar-senha");
  }

  // Conta colaboradora de projeto (ver User.projectId): não tem assinatura
  // própria, tudo isso vem do dono do projeto.
  const billingOwnerId = user.project?.ownerId ?? userId;

  // Lazy: se o dono está num trial do plano Gratuito vencido (ver
  // src/lib/plans/trial.ts), essa chamada já derruba o plano dele antes de
  // buscarmos subscriptionStatus abaixo — sem isso, uma conta trial vencida
  // ficaria "ACTIVE" pra sempre. Sempre busca o dono de novo (mesmo quando é
  // a própria conta) pra nunca devolver dado desatualizado depois do update.
  await expireTrialIfNeeded(billingOwnerId);

  const billingOwner = await prisma.user.findUniqueOrThrow({
    where: { id: billingOwnerId },
    select: {
      subscriptionStatus: true,
      trialEndsAt: true,
      plan: { select: { name: true, slug: true } },
    },
  });

  if (billingOwner.subscriptionStatus !== "ACTIVE") {
    // trialEndsAt continua marcado (ver expireTrialIfNeeded) enquanto o
    // motivo da inatividade for o trial vencido — só some quando o admin
    // muda o plano ou uma assinatura paga é ativada (webhook do Stripe).
    redirect(billingOwner.trialEndsAt !== null ? "/?assinatura=trial-expirada" : "/?assinatura=necessaria");
  }

  return {
    email: user.email,
    name: user.name,
    planName: billingOwner.plan?.name ?? null,
    planSlug: billingOwner.plan?.slug ?? null,
    isManagedAccount: user.projectId !== null,
    projectId: user.projectId,
  };
}
