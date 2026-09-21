import { prisma } from "@/lib/db/prisma";
import { getMonthlyCreditLimit } from "@/lib/credits/credit-converter";
import { TRIAL_PLAN_SLUG } from "@/lib/plans/trial";

export interface PlanSummary {
  id: string;
  slug: string;
  name: string;
  priceInCents: number;
  monthlyCreditLimit: number;
}

/** Planos internos (o Gratuito — ver src/lib/plans/trial.ts) que não devem
 * aparecer na página pública de preços; só o admin atribui esses planos
 * manualmente. */
const HIDDEN_PLAN_SLUGS = new Set([TRIAL_PLAN_SLUG]);

export async function listPlans(): Promise<PlanSummary[]> {
  const plans = await prisma.plan.findMany({ orderBy: { priceInCents: "asc" } });
  return plans
    .filter((plan) => !HIDDEN_PLAN_SLUGS.has(plan.slug))
    .map((plan) => ({
      id: plan.id,
      slug: plan.slug,
      name: plan.name,
      priceInCents: plan.priceInCents,
      monthlyCreditLimit: getMonthlyCreditLimit(plan),
    }));
}
