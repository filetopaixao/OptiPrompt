import { prisma } from "@/lib/db/prisma";
import { getMonthlyCreditLimit } from "@/lib/credits/credit-converter";

export interface PlanSummary {
  id: string;
  slug: string;
  name: string;
  priceInCents: number;
  monthlyCreditLimit: number;
}

/** Planos internos (ex.: contas de teste com cota mínima) que não devem
 * aparecer na página pública de preços. */
const HIDDEN_PLAN_SLUGS = new Set(["teste-gratis"]);

export async function listPlans(): Promise<PlanSummary[]> {
  const plans = await prisma.plan.findMany({ orderBy: { priceInCents: "asc" } });
  return plans
    .filter((plan) => !HIDDEN_PLAN_SLUGS.has(plan.slug))
    .map((plan) => ({
      id: plan.id,
      slug: plan.slug,
      name: plan.name,
      priceInCents: plan.priceInCents,
      monthlyCreditLimit: getMonthlyCreditLimit(plan.priceInCents),
    }));
}
