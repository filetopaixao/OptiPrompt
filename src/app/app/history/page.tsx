import { getCurrentUserId } from "@/lib/auth/current-user";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";
import {
  listExecutionsForProject,
  listExecutionsForTeam,
  listExecutionsForUser,
} from "@/lib/executions/list-executions";
import { canUseVersionCompare } from "@/lib/plans/model-access";
import { HistoryExplorer } from "@/components/history/history-explorer";

export default async function HistoryPage() {
  const userId = await getCurrentUserId();
  const { planSlug, isManagedAccount, projectId } = await requireActiveSubscription();

  // Só quem é de fato dono da assinatura Enterprise (não um colaborador de
  // projeto) vê o histórico agregado de todos os projetos — colaboradores
  // veem só o histórico compartilhado do próprio projeto (ver
  // listExecutionsForProject), isolado dos demais projetos do mesmo dono.
  const isTeamOwner = !isManagedAccount && planSlug === "agencia";
  const executions = isTeamOwner
    ? await listExecutionsForTeam(userId)
    : projectId
      ? await listExecutionsForProject(projectId)
      : await listExecutionsForUser(userId);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <HistoryExplorer
        executions={executions}
        canCompareVersions={canUseVersionCompare(planSlug)}
        showingTeamHistory={isTeamOwner}
        showingProjectHistory={!isTeamOwner && projectId !== null}
        currentUserId={userId}
      />
    </div>
  );
}
