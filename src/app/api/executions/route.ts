import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { getUsageSummary, registerConsumption } from "@/lib/credits/usage-service";
import { prisma } from "@/lib/db/prisma";
import { toExecutionDTO } from "@/lib/executions/to-dto";
import { runComparison } from "@/lib/ai/run-comparison";
import { planExecutionBudget } from "@/lib/ai/budget";
import { ensureOpenRouterApiKey } from "@/lib/openrouter/client";
import { checkRule } from "@/lib/ai/rule-checker";
import { brlToCredits, USD_TO_BRL_RATE } from "@/lib/credits/credit-converter";
import { MODEL_CATALOG } from "@/types/models";
import type { UnifiedModelResponse } from "@/types/models";

const VALID_MODEL_IDS = MODEL_CATALOG.map((model) => model.id) as [string, ...string[]];

const runExecutionSchema = z.object({
  promptId: z.string().cuid().optional(),
  promptName: z.string().min(1).max(120).optional(),
  systemPrompt: z.string().max(20_000),
  userMessage: z.string().min(1).max(20_000),
  modelIds: z.array(z.enum(VALID_MODEL_IDS)).min(1, "Selecione ao menos um modelo."),
  /** Regra opcional em texto livre, verificada em cada resposta por um
   * modelo-juiz (ver src/lib/ai/rule-checker.ts). */
  rule: z.string().trim().max(2000).optional(),
});

interface JudgedResult extends UnifiedModelResponse {
  ruleVerdict: "PASSED" | "FAILED" | null;
  ruleReason: string | null;
}

/** Roda o juiz em cada resposta bem-sucedida, em paralelo — uma falha no
 * julgamento de um modelo não derruba os demais nem a execução principal,
 * só deixa o veredito daquele resultado como null. */
async function applyRuleChecks(
  results: UnifiedModelResponse[],
  rule: string | undefined,
  apiKey: string,
): Promise<{ results: JudgedResult[]; ruleCheckCreditsConsumed: number }> {
  if (!rule) {
    return {
      results: results.map((result) => ({ ...result, ruleVerdict: null, ruleReason: null })),
      ruleCheckCreditsConsumed: 0,
    };
  }

  let ruleCheckCreditsConsumed = 0;

  const judged = await Promise.all(
    results.map(async (result): Promise<JudgedResult> => {
      if (result.status !== "SUCCESS" || !result.responseText) {
        return { ...result, ruleVerdict: null, ruleReason: null };
      }
      try {
        const check = await checkRule(rule, result.responseText, apiKey);
        ruleCheckCreditsConsumed += brlToCredits(check.costUSD * USD_TO_BRL_RATE);
        return { ...result, ruleVerdict: check.verdict, ruleReason: check.reason };
      } catch {
        return { ...result, ruleVerdict: null, ruleReason: "Não foi possível verificar a regra." };
      }
    }),
  );

  return { results: judged, ruleCheckCreditsConsumed };
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  const parsed = runExecutionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload inválido." }, { status: 400 });
  }

  const { promptId, promptName, systemPrompt, userMessage, modelIds, rule } = parsed.data;

  const usage = await getUsageSummary(userId);
  if (usage.isOverLimit) {
    return NextResponse.json(
      { error: "Sua cota mensal de uso foi atingida. Faça upgrade do plano para continuar." },
      { status: 403 },
    );
  }

  // Injeção dinâmica de max_tokens: conta o custo real de ENTRADA antes de
  // chamar qualquer provedor. Se só o envio já estoura o saldo, bloqueia
  // aqui (nenhum dinheiro gasto); caso contrário, o que sobra vira o teto
  // de tokens de saída de cada modelo — na pior das hipóteses a resposta
  // vem cortada no meio, nunca deixando o usuário com saldo negativo.
  const budgetPlan = await planExecutionBudget(modelIds, systemPrompt, userMessage, usage.creditsAvailable);
  if (!budgetPlan.ok) {
    return NextResponse.json({ error: budgetPlan.reason }, { status: 402 });
  }

  const prompt = promptId
    ? await prisma.prompt.findFirstOrThrow({ where: { id: promptId, userId } })
    : await prisma.prompt.create({
        data: { userId, name: promptName?.trim() || "Prompt sem título" },
      });

  const apiKey = await ensureOpenRouterApiKey(userId);

  const rawResults = await runComparison({
    systemPrompt,
    userMessage,
    modelIds,
    budgetPlans: budgetPlan.plans,
    apiKey,
  });

  const { results, ruleCheckCreditsConsumed } = await applyRuleChecks(rawResults, rule, apiKey);

  const execution = await prisma.execution.create({
    data: {
      userId,
      promptId: prompt.id,
      systemPrompt,
      userMessage,
      rule: rule ?? null,
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
          ruleVerdict: result.ruleVerdict,
          ruleReason: result.ruleReason,
        })),
      },
    },
    include: { prompt: { select: { name: true } }, results: true },
  });

  const totalCreditsConsumed =
    results.reduce((sum, result) => sum + result.estimatedCostInCredits, 0) + ruleCheckCreditsConsumed;
  const updatedUsage = await registerConsumption(userId, totalCreditsConsumed);

  return NextResponse.json(
    { execution: toExecutionDTO(execution), usage: updatedUsage },
    { status: 201 },
  );
}
