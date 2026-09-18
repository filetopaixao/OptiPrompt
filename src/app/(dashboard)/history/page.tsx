import { getCurrentUserId } from "@/lib/auth/current-user";
import { listExecutionsForUser } from "@/lib/executions/list-executions";
import { HistoryExplorer } from "@/components/history/history-explorer";

export default async function HistoryPage() {
  const userId = await getCurrentUserId();
  const executions = await listExecutionsForUser(userId);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <HistoryExplorer executions={executions} />
    </div>
  );
}
