import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { getUsageSummary, registerConsumption } from "@/lib/credits/usage-service";
import { prisma } from "@/lib/db/prisma";
import { toExecutionDTO } from "@/lib/executions/to-dto";
import { runComparison } from "@/lib/ai/run-comparison";
import { MODEL_CATALOG } from "@/types/models";

const VALID_MODEL_IDS = MODEL_CATALOG.map((model) => model.id) as [string, ...string[]];

const runExecutionSchema = z.object({
  promptId: z.string().cuid().optional(),
  promptName: z.string().min(1).max(120).optional(),
  systemPrompt: z.string().max(20_000),
  userMessage: z.string().min(1).max(20_000),
  modelIds: z.array(z.enum(VALID_MODEL_IDS)).min(1, "Selecione ao menos um modelo."),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  const usage = await getUsageSummary(userId);
  if (usage.isOverLimit) {
    return NextResponse.json(
      { error: "Sua cota mensal de uso foi atingida. Faça upgrade do plano para continuar." },
      { status: 403 },
    );
  }

  const parsed = runExecutionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload inválido." }, { status: 400 });
  }

  const { promptId, promptName, systemPrompt, userMessage, modelIds } = parsed.data;

  const prompt = promptId
    ? await prisma.prompt.findFirstOrThrow({ where: { id: promptId, userId } })
    : await prisma.prompt.create({
        data: { userId, name: promptName?.trim() || "Prompt sem título" },
      });

  const results = await runComparison({ systemPrompt, userMessage, modelIds });

  const execution = await prisma.execution.create({
    data: {
      userId,
      promptId: prompt.id,
      systemPrompt,
      userMessage,
      results: {
        create: results.map((result) => ({
          provider: result.provider,
          modelId: result.modelId,
          tier: result.tier,
          status: result.status,
          responseText: result.responseText,
          errorMessage: result.errorMessage,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          latencyMs: result.latencyMs,
          estimatedCostInBRL: result.estimatedCostInBRL,
          estimatedCostInCredits: result.estimatedCostInCredits,
        })),
      },
    },
    include: { prompt: { select: { name: true } }, results: true },
  });

  const totalCreditsConsumed = results.reduce((sum, result) => sum + result.estimatedCostInCredits, 0);
  const updatedUsage = await registerConsumption(userId, totalCreditsConsumed);

  return NextResponse.json(
    { execution: toExecutionDTO(execution), usage: updatedUsage },
    { status: 201 },
  );
}
