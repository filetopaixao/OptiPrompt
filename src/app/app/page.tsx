import { getBillingOwnerId } from "@/lib/auth/billing-owner";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { getMostUsedModelIds } from "@/lib/executions/most-used-models";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  const billingOwnerId = await getBillingOwnerId(userId);
  const [mostUsedModelIds, billingOwner] = await Promise.all([
    getMostUsedModelIds(userId),
    prisma.user.findUniqueOrThrow({ where: { id: billingOwnerId }, select: { plan: { select: { slug: true } } } }),
  ]);

  return <DashboardWorkspace mostUsedModelIds={mostUsedModelIds} planSlug={billingOwner.plan?.slug ?? null} />;
}
