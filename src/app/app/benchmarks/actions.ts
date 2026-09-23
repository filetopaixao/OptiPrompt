"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";
import { canAccessProject } from "@/lib/benchmarks/access";
import { runBenchmark } from "@/lib/benchmarks/run-benchmark";
import { getMaxSimultaneousModels } from "@/lib/plans/model-access";
import { getAllowedModelIds } from "@/lib/plans/allowed-models";
import { getModelDefinition } from "@/types/models";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireProjectAccess(
  projectId: string,
): Promise<{ userId: string; planSlug: string | null }> {
  const userId = await getCurrentUserId();
  const { planSlug } = await requireActiveSubscription();
  const hasAccess = await canAccessProject(userId, projectId);
  if (!hasAccess) redirect("/app/benchmarks");
  return { userId, planSlug };
}

/** Cria um benchmark já com o primeiro caso e os modelos selecionados —
 * não obriga montar um dataset completo antes de testar (ver Parte 2 do
 * pedido: "permitir começar com um caso único"). */
export async function createBenchmark(input: {
  projectId: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  userMessage: string;
  modelIds: string[];
}): Promise<ActionResult & { benchmarkId?: string }> {
  const { userId, planSlug } = await requireProjectAccess(input.projectId);

  const name = input.name.trim();
  const userMessage = input.userMessage.trim();
  if (!name) return { ok: false, error: "Dê um nome ao benchmark." };
  if (!userMessage) return { ok: false, error: "Preencha a mensagem do primeiro caso de teste." };
  if (input.modelIds.length === 0) return { ok: false, error: "Selecione ao menos um modelo." };

  // Mesmo teto de modelos simultâneos do teste ao vivo (ver ModelSelector no
  // dashboard) — sem isso, um plano Free poderia contornar o limite de 3
  // modelos por execução só rodando um benchmark em vez de um teste direto.
  const maxSimultaneousModels = getMaxSimultaneousModels(planSlug);
  if (input.modelIds.length > maxSimultaneousModels) {
    return { ok: false, error: `Seu plano permite comparar até ${maxSimultaneousModels} modelos por vez.` };
  }

  const allowedModelIds = await getAllowedModelIds(planSlug);
  for (const modelId of input.modelIds) {
    try {
      getModelDefinition(modelId);
    } catch {
      return { ok: false, error: "Modelo inválido." };
    }
    if (!allowedModelIds.includes(modelId as (typeof allowedModelIds)[number])) {
      return { ok: false, error: "Alguns modelos selecionados não estão disponíveis no seu plano." };
    }
  }

  const benchmark = await prisma.benchmark.create({
    data: {
      projectId: input.projectId,
      name,
      description: input.description?.trim() || null,
      createdByUserId: userId,
      cases: {
        create: [{ systemPrompt: input.systemPrompt?.trim() || null, userMessage }],
      },
      models: {
        create: input.modelIds.map((modelId) => ({ modelId })),
      },
    },
  });

  revalidatePath("/app/benchmarks");
  return { ok: true, benchmarkId: benchmark.id };
}

export async function addBenchmarkCase(input: {
  benchmarkId: string;
  systemPrompt?: string;
  userMessage: string;
  attachedImageDataUrl?: string;
  expectedWinnerModelId?: string;
  expectedResponse?: string;
  tags?: string[];
}): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await requireActiveSubscription();

  const benchmark = await prisma.benchmark.findUnique({
    where: { id: input.benchmarkId },
    select: { projectId: true },
  });
  if (!benchmark) return { ok: false, error: "Benchmark não encontrado." };
  if (!(await canAccessProject(userId, benchmark.projectId))) {
    return { ok: false, error: "Benchmark não encontrado." };
  }

  const userMessage = input.userMessage.trim();
  if (!userMessage) return { ok: false, error: "Preencha a mensagem do caso de teste." };

  await prisma.benchmarkCase.create({
    data: {
      benchmarkId: input.benchmarkId,
      systemPrompt: input.systemPrompt?.trim() || null,
      userMessage,
      attachedImageDataUrl: input.attachedImageDataUrl || null,
      expectedWinnerModelId: input.expectedWinnerModelId || null,
      expectedResponse: input.expectedResponse?.trim() || null,
      tags: input.tags ?? [],
    },
  });

  revalidatePath(`/app/benchmarks/${input.benchmarkId}`);
  return { ok: true };
}

export async function removeBenchmarkCase(benchmarkId: string, caseId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await requireActiveSubscription();

  const benchmark = await prisma.benchmark.findUnique({
    where: { id: benchmarkId },
    select: { projectId: true },
  });
  if (!benchmark || !(await canAccessProject(userId, benchmark.projectId))) {
    return { ok: false, error: "Benchmark não encontrado." };
  }

  await prisma.benchmarkCase.deleteMany({ where: { id: caseId, benchmarkId } });
  revalidatePath(`/app/benchmarks/${benchmarkId}`);
  return { ok: true };
}

export async function runBenchmarkAction(
  benchmarkId: string,
  label?: string,
): Promise<ActionResult & { runId?: string; partial?: boolean }> {
  const userId = await getCurrentUserId();
  await requireActiveSubscription();

  const result = await runBenchmark({ benchmarkId, actingUserId: userId, label });
  revalidatePath(`/app/benchmarks/${benchmarkId}`);

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, runId: result.runId, partial: result.partial };
}

/** No máximo uma baseline por benchmark — desmarca a anterior (se houver)
 * numa transação antes de marcar a nova (ver comentário em BenchmarkRun no
 * schema, a exclusividade é garantida aqui, não por constraint de banco). */
export async function setBenchmarkBaseline(benchmarkId: string, runId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await requireActiveSubscription();

  const benchmark = await prisma.benchmark.findUnique({
    where: { id: benchmarkId },
    select: { projectId: true },
  });
  if (!benchmark || !(await canAccessProject(userId, benchmark.projectId))) {
    return { ok: false, error: "Benchmark não encontrado." };
  }

  await prisma.$transaction([
    prisma.benchmarkRun.updateMany({ where: { benchmarkId, isBaseline: true }, data: { isBaseline: false } }),
    prisma.benchmarkRun.update({ where: { id: runId }, data: { isBaseline: true } }),
  ]);

  revalidatePath(`/app/benchmarks/${benchmarkId}`);
  return { ok: true };
}

export async function deleteBenchmark(benchmarkId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await requireActiveSubscription();

  const benchmark = await prisma.benchmark.findUnique({
    where: { id: benchmarkId },
    select: { projectId: true },
  });
  if (!benchmark || !(await canAccessProject(userId, benchmark.projectId))) {
    return { ok: false, error: "Benchmark não encontrado." };
  }

  await prisma.benchmark.delete({ where: { id: benchmarkId } });
  revalidatePath("/app/benchmarks");
  return { ok: true };
}

/** Grava a nota manual de qualidade (0-10) de um resultado — revisão
 * humana, v1 do pedido ("começar com revisão manual", ver Parte 3). */
export async function setManualQualityScore(
  benchmarkId: string,
  resultId: string,
  score: number | null,
): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await requireActiveSubscription();

  const benchmark = await prisma.benchmark.findUnique({
    where: { id: benchmarkId },
    select: { projectId: true },
  });
  if (!benchmark || !(await canAccessProject(userId, benchmark.projectId))) {
    return { ok: false, error: "Benchmark não encontrado." };
  }
  if (score !== null && (score < 0 || score > 10)) {
    return { ok: false, error: "Nota precisa estar entre 0 e 10." };
  }

  await prisma.benchmarkResult.update({ where: { id: resultId }, data: { manualQualityScore: score } });
  revalidatePath(`/app/benchmarks/${benchmarkId}`);
  return { ok: true };
}

export async function updateBenchmarkThresholds(input: {
  benchmarkId: string;
  minQualityScore: number | null;
  maxQualityDropPoints: number | null;
  maxCostIncreasePercent: number | null;
  maxLatencyIncreasePercent: number | null;
  criteria: string[];
}): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await requireActiveSubscription();

  const benchmark = await prisma.benchmark.findUnique({
    where: { id: input.benchmarkId },
    select: { projectId: true },
  });
  if (!benchmark || !(await canAccessProject(userId, benchmark.projectId))) {
    return { ok: false, error: "Benchmark não encontrado." };
  }

  await prisma.benchmark.update({
    where: { id: input.benchmarkId },
    data: {
      minQualityScore: input.minQualityScore,
      maxQualityDropPoints: input.maxQualityDropPoints,
      maxCostIncreasePercent: input.maxCostIncreasePercent,
      maxLatencyIncreasePercent: input.maxLatencyIncreasePercent,
      criteria: input.criteria,
    },
  });

  revalidatePath(`/app/benchmarks/${input.benchmarkId}`);
  return { ok: true };
}
