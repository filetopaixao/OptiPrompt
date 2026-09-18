import { prisma } from "@/lib/db/prisma";
import { getMonthlyCreditLimit, usagePercentage } from "./credit-converter";

export interface UsageSummary {
  /** Créditos restantes no ciclo (nunca negativo). */
  creditsAvailable: number;
  /** Teto do ciclo — 20% do valor da assinatura do plano + créditos avulsos
   * comprados (esses não vencem, ver bonusCredits no schema). */
  creditsTotal: number;
  /** 0-100, usado só para o preenchimento visual da barra. */
  usagePercentage: number;
  /** Uso já bateu o limite do plano — bloqueia novas execuções. */
  isOverLimit: boolean;
}

async function buildUsageSummary(user: {
  creditsUsedThisCycle: number;
  bonusCredits: number;
  plan: { priceInCents: number } | null;
}): Promise<UsageSummary> {
  const planCreditLimit = user.plan ? getMonthlyCreditLimit(user.plan.priceInCents) : 0;
  const creditsTotal = planCreditLimit + user.bonusCredits;
  const creditsAvailable = Math.max(0, creditsTotal - user.creditsUsedThisCycle);

  return {
    creditsAvailable,
    creditsTotal,
    usagePercentage: usagePercentage(user.creditsUsedThisCycle, creditsTotal),
    isOverLimit: creditsTotal > 0 && user.creditsUsedThisCycle >= creditsTotal,
  };
}

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { creditsUsedThisCycle: true, bonusCredits: true, plan: { select: { priceInCents: true } } },
  });
  return buildUsageSummary(user);
}

/** Debita os créditos de uma execução do saldo mensal do usuário e retorna o
 * saldo já atualizado, para a UI renderizar a barra sem um segundo round-trip. */
export async function registerConsumption(
  userId: string,
  totalCreditsConsumed: number,
): Promise<UsageSummary> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { creditsUsedThisCycle: { increment: totalCreditsConsumed } },
    select: { creditsUsedThisCycle: true, bonusCredits: true, plan: { select: { priceInCents: true } } },
  });
  return buildUsageSummary(user);
}
