import { prisma } from "@/lib/db/prisma";

/**
 * Contas no plano Gratuito (ver src/lib/plans/trial.ts) têm um prazo de 7
 * dias guardado em User.trialEndsAt. Não há cron: o vencimento é resolvido
 * de forma preguiçosa (lazy) aqui, chamado a partir de
 * requireActiveSubscription — que já roda em toda página de /app — no
 * primeiro acesso após o prazo vencer.
 *
 * Vencido, a conta perde o plano (planId null) e vira INACTIVE, o mesmo
 * estado de uma assinatura cancelada/sem pagamento — reaproveita o gate e a
 * tela de "escolha um plano" que já existem pra esse caso.
 *
 * trialEndsAt NÃO é limpo aqui de propósito: fica como um marcador
 * permanente de "esta conta inativa caiu assim por causa do trial", pra
 * requireActiveSubscription escolher a mensagem certa em qualquer chamada
 * (não só na que efetivamente expirou) — sem isso, duas requisições quase
 * simultâneas (ex.: router.push + router.refresh do login) puderiam fazer
 * uma delas ganhar a corrida achando a conta já expirada por outra e
 * mostrar o aviso genérico de pagamento em vez do de trial. O marcador só
 * some quando o admin atribui outro plano (updateUserAccess/createFreeUser)
 * ou quando uma assinatura paga de verdade é ativada (webhook do Stripe).
 */
export async function expireTrialIfNeeded(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEndsAt: true, subscriptionStatus: true },
  });

  if (!user?.trialEndsAt || user.trialEndsAt > new Date() || user.subscriptionStatus !== "ACTIVE") {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { planId: null, subscriptionStatus: "INACTIVE" },
  });
}
