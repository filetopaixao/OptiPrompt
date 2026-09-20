import { getBillingOwnerId } from "@/lib/auth/billing-owner";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { listExecutionsForTeam, listExecutionsForUser } from "@/lib/executions/list-executions";
import { canUseVersionCompare } from "@/lib/plans/model-access";
import { HistoryExplorer } from "@/components/history/history-explorer";

export default async function HistoryPage() {
  const userId = await getCurrentUserId();
  const billingOwnerId = await getBillingOwnerId(userId);
  const billingOwner = await prisma.user.findUniqueOrThrow({
    where: { id: billingOwnerId },
    select: { plan: { select: { slug: true } } },
  });

  // Só quem é de fato dono da assinatura Enterprise (não um cliente gerido)
  // vê o histórico agregado da equipe — os demais veem só o próprio.
  const isTeamOwner = userId === billingOwnerId && billingOwner.plan?.slug === "agencia";
  const executions = isTeamOwner
    ? await listExecutionsForTeam(userId)
    : await listExecutionsForUser(userId);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <HistoryExplorer
        executions={executions}
        canCompareVersions={canUseVersionCompare(billingOwner.plan?.slug)}
        showingTeamHistory={isTeamOwner}
        currentUserId={userId}
      />
    </div>
  );
}
