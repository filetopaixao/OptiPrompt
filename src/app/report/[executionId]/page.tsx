import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";
import { getExecutionById } from "@/lib/executions/get-execution";
import { ReportView } from "@/components/report/report-view";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ executionId: string }>;
}) {
  const user = await requireActiveSubscription();

  const { executionId } = await params;
  const userId = await getCurrentUserId();
  const execution = await getExecutionById(userId, executionId);

  if (!execution) notFound();

  return <ReportView execution={execution} allowWhitelabelLogo={user.planSlug === "agencia"} />;
}
