import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";
import { getBenchmarkById } from "@/lib/benchmarks/get-benchmark";
import { getAllowedModelIds } from "@/lib/plans/allowed-models";
import { BenchmarkDetail } from "@/components/benchmarks/benchmark-detail";

export const dynamic = "force-dynamic";

export default async function BenchmarkDetailPage({
  params,
}: {
  params: Promise<{ benchmarkId: string }>;
}) {
  await requireActiveSubscription();
  const userId = await getCurrentUserId();
  const { benchmarkId } = await params;

  const benchmark = await getBenchmarkById(userId, benchmarkId);
  if (!benchmark) notFound();

  const { plan } = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: { select: { slug: true } } },
  });
  const allowedModelIds = await getAllowedModelIds(plan?.slug ?? null);

  return <BenchmarkDetail benchmark={benchmark} allowedModelIds={allowedModelIds} />;
}
