import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { listExecutionsForUser } from "@/lib/executions/list-executions";
import { canUseVersionCompare } from "@/lib/plans/model-access";
import { HistoryExplorer } from "@/components/history/history-explorer";

export default async function HistoryPage() {
  const userId = await getCurrentUserId();
  const [executions, user] = await Promise.all([
    listExecutionsForUser(userId),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { plan: { select: { slug: true } } } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <HistoryExplorer executions={executions} canCompareVersions={canUseVersionCompare(user.plan?.slug)} />
    </div>
  );
}
