import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";
import { getBenchmarkRunReport } from "@/lib/benchmarks/get-run-report";
import { BenchmarkReportView } from "@/components/benchmarks/benchmark-report-view";

export const dynamic = "force-dynamic";

export default async function BenchmarkRunReportPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const user = await requireActiveSubscription();
  const userId = await getCurrentUserId();
  const { runId } = await params;

  const data = await getBenchmarkRunReport(userId, runId);
  if (!data) notFound();

  return <BenchmarkReportView data={data} allowWhitelabelLogo={user.planSlug === "agencia"} />;
}
