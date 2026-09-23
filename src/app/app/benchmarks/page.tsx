import Link from "next/link";
import { FlaskConical, GitCompareArrows } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";
import { listBenchmarksForUser } from "@/lib/benchmarks/list-benchmarks";
import { getAccessibleProjectIds } from "@/lib/benchmarks/access";
import { getMaxSimultaneousModels } from "@/lib/plans/model-access";
import { getAllowedModelIds } from "@/lib/plans/allowed-models";
import { BenchmarksExplorer } from "@/components/benchmarks/benchmarks-explorer";

export const dynamic = "force-dynamic";

export default async function BenchmarksPage() {
  await requireActiveSubscription();
  const userId = await getCurrentUserId();

  const [benchmarks, accessibleProjectIds] = await Promise.all([
    listBenchmarksForUser(userId),
    getAccessibleProjectIds(userId),
  ]);

  const projects = await prisma.project.findMany({
    where: { id: { in: accessibleProjectIds } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const { plan } = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: { select: { slug: true } } },
  });
  const allowedModelIds = await getAllowedModelIds(plan?.slug ?? null);
  const maxSelectableModels = getMaxSimultaneousModels(plan?.slug ?? null);

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Benchmarks</h1>
        <div className="mt-6 flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center text-muted-foreground">
          <FlaskConical className="size-8" />
          <p className="max-w-sm text-sm">
            Crie um projeto primeiro — benchmarks ficam organizados por cliente.
          </p>
          <Link href="/app/projects" className="font-medium text-primary hover:underline">
            Ir para Projetos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-2">
        <GitCompareArrows className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Benchmarks</h1>
          <p className="text-sm text-muted-foreground">
            Conjuntos salvos de casos de teste, reexecutáveis sempre que um prompt ou modelo mudar.
          </p>
        </div>
      </div>
      <BenchmarksExplorer
        benchmarks={benchmarks}
        projects={projects}
        allowedModelIds={allowedModelIds}
        maxSelectableModels={maxSelectableModels}
      />
    </div>
  );
}
