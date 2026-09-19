import { getCurrentUserId } from "@/lib/auth/current-user";
import { getMostUsedModelIds } from "@/lib/executions/most-used-models";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  const mostUsedModelIds = await getMostUsedModelIds(userId);

  return <DashboardWorkspace mostUsedModelIds={mostUsedModelIds} />;
}
