import { prisma } from "@/lib/db/prisma";
import { getMonthlyCreditLimit } from "@/lib/credits/credit-converter";
import { TRIAL_PLAN_SLUG } from "@/lib/plans/trial";
import { FREE_PLAN_SLUG } from "@/lib/plans/free-tier";

export interface PlanSummary {
  id: string;
  slug: string;
  name: string;
  priceInCents: number;
  monthlyCreditLimit: number;
}

/** Planos que não devem aparecer na grade pública de preços: o Gratuito (só
 * o admin atribui — ver trial.ts) e o Free (autoatendimento, mas oferecido
 * pelo cadastro/CTAs da landing, não por um card "assinar" via Stripe —
 * ver free-tier.ts e o fluxo de /cadastro). */
const HIDDEN_PLAN_SLUGS = new Set([TRIAL_PLAN_SLUG, FREE_PLAN_SLUG]);

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
