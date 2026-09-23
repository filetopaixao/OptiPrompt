import { getBillingOwnerId } from "@/lib/auth/billing-owner";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { getMostUsedModelIds } from "@/lib/executions/most-used-models";
import { getMaxSimultaneousModels } from "@/lib/plans/model-access";
import { getAllowedModelIds } from "@/lib/plans/allowed-models";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  const billingOwnerId = await getBillingOwnerId(userId);
  const [mostUsedModelIds, billingOwner] = await Promise.all([
    getMostUsedModelIds(userId),
    prisma.user.findUniqueOrThrow({ where: { id: billingOwnerId }, select: { plan: { select: { slug: true } } } }),
  ]);
  const planSlug = billingOwner.plan?.slug ?? null;
  // getAllowedModelIds é async (a lista do Free vem do banco — ver
  // FreeTierModel) e não pode rodar dentro do client component, por isso o
  // resultado já pronto desce como prop (ver DashboardWorkspace).
  const allowedModelIds = await getAllowedModelIds(planSlug);

  return (
    <DashboardWorkspace
      mostUsedModelIds={mostUsedModelIds}
      planSlug={planSlug}
      allowedModelIds={allowedModelIds}
      maxSelectableModels={getMaxSimultaneousModels(planSlug)}
    />
  );
}
