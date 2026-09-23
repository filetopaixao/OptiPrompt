import { prisma } from "@/lib/db/prisma";
import { getBillingOwnerId } from "@/lib/auth/billing-owner";
import { getAdapterForModel } from "@/lib/ai/adapters";
import { getUsageSummary, registerConsumption } from "@/lib/credits/usage-service";
import { ensureOpenRouterApiKey } from "@/lib/openrouter/client";
import { getAllowedModelIds } from "@/lib/plans/allowed-models";
import type { ModelId } from "@/types/models";
import type { UnifiedModelResponse } from "@/types/models";
import { canAccessProject } from "./access";

export type RunBenchmarkResult =
  | { ok: true; runId: string; partial: boolean }
  | { ok: false; error: string; status: number };

/**
 * Executa um benchmark inteiro: todos os casos × todos os modelos
 * habilitados no benchmark, reaproveitando o MESMO motor de execução do
 * dashboard (getAdapterForModel().execute — ver run-comparison.ts) caso a
 * caso, em vez de duplicar lógica de chamada ao OpenRouter. Cada resultado
 * vira uma BenchmarkResult; o conjunto todo vira uma BenchmarkRun nova.
 *
 * Verifica o saldo de crédito ANTES de começar e de novo entre cada caso —
 * se acabar no meio (ex.: benchmark grande), para aí e salva os resultados
 * já obtidos como uma run parcial, em vez de perder tudo ou deixar a conta
 * negativa.
 */
export async function runBenchmark(input: {
  benchmarkId: string;
  actingUserId: string;
  label?: string;
}): Promise<RunBenchmarkResult> {
  const benchmark = await prisma.benchmark.findUnique({
    where: { id: input.benchmarkId },
    include: { cases: { orderBy: { createdAt: "asc" } }, models: true },
  });
  if (!benchmark) return { ok: false, error: "Benchmark não encontrado.", status: 404 };

  const hasAccess = await canAccessProject(input.actingUserId, benchmark.projectId);
  if (!hasAccess) return { ok: false, error: "Benchmark não encontrado.", status: 404 };

  if (benchmark.cases.length === 0) {
    return { ok: false, error: "Adicione ao menos um caso de teste antes de executar.", status: 400 };
  }
  if (benchmark.models.length === 0) {
    return { ok: false, error: "Selecione ao menos um modelo antes de executar.", status: 400 };
  }

  const billingOwnerId = await getBillingOwnerId(input.actingUserId);
  const { plan } = await prisma.user.findUniqueOrThrow({
    where: { id: billingOwnerId },
    select: { plan: { select: { slug: true } } },
  });

  // Defende contra o plano ter mudado (downgrade) depois que o benchmark
  // foi criado com um modelo que não é mais permitido — nunca confiar só
  // na seleção feita na hora da criação.
  const allowedModelIds = await getAllowedModelIds(plan?.slug ?? null);
  const modelIds = benchmark.models.map((m) => m.modelId).filter((id) => allowedModelIds.includes(id));
  if (modelIds.length === 0) {
    return {
      ok: false,
      error: "Nenhum dos modelos deste benchmark está disponível no seu plano atual.",
      status: 403,
    };
  }

  const initialUsage = await getUsageSummary(billingOwnerId);
  if (initialUsage.isOverLimit) {
    return {
      ok: false,
      error: "Sua cota mensal de uso foi atingida. Faça upgrade do plano para continuar.",
      status: 403,
    };
  }

  const apiKey = await ensureOpenRouterApiKey(billingOwnerId);

  const allResults: Array<{ caseId: string; result: UnifiedModelResponse }> = [];
  let partial = false;

  for (const benchmarkCase of benchmark.cases) {
    const usage = await getUsageSummary(billingOwnerId);
    if (usage.isOverLimit) {
      partial = true;
      break;
    }

    const caseResults = await Promise.all(
      modelIds.map((modelId) =>
        getAdapterForModel().execute({
          modelId: modelId as ModelId,
          systemPrompt: benchmarkCase.systemPrompt ?? "",
          userMessage: benchmarkCase.userMessage,
          imageDataUrl: benchmarkCase.attachedImageDataUrl ?? undefined,
          apiKey,
        }),
      ),
    );

    caseResults.forEach((result) => allResults.push({ caseId: benchmarkCase.id, result }));
  }

  if (allResults.length === 0) {
    return { ok: false, error: "Não foi possível executar nenhum caso — cota esgotada.", status: 402 };
  }

  const run = await prisma.benchmarkRun.create({
    data: {
      benchmarkId: benchmark.id,
      label: input.label,
      createdByUserId: input.actingUserId,
      results: {
        create: allResults.map(({ caseId, result }) => ({
          benchmarkCaseId: caseId,
          provider: result.provider,
          modelId: result.modelId,
          tier: result.tier,
          status: result.status,
          responseText: result.responseText,
          errorMessage: result.errorMessage,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          latencyMs: result.latencyMs,
          costInBRL: result.estimatedCostInBRL,
          costInCredits: result.estimatedCostInCredits,
        })),
      },
    },
  });

  const totalCreditsConsumed = allResults.reduce(
    (sum, { result }) => sum + result.estimatedCostInCredits,
    0,
  );
  await registerConsumption(billingOwnerId, totalCreditsConsumed);

  await prisma.benchmark.update({ where: { id: benchmark.id }, data: { updatedAt: new Date() } });

  return { ok: true, runId: run.id, partial };
}
