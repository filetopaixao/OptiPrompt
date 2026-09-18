import { prisma } from "@/lib/db/prisma";
import { getMonthlyCreditLimit } from "@/lib/credits/credit-converter";

export interface PlanSummary {
  id: string;
  slug: string;
  name: string;
  priceInCents: number;
  monthlyCreditLimit: number;
}

export async function listPlans(): Promise<PlanSummary[]> {
  const plans = await prisma.plan.findMany({ orderBy: { priceInCents: "asc" } });
  return plans.map((plan) => ({
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    priceInCents: plan.priceInCents,
    monthlyCreditLimit: getMonthlyCreditLimit(plan.priceInCents),
  }));
}
