import { getAdapterForModel } from "./adapters";
import type { ModelBudgetPlan } from "./budget";
import type { ModelId, UnifiedModelResponse } from "@/types/models";

export interface RunComparisonInput {
  systemPrompt: string;
  userMessage: string;
  modelIds: ModelId[];
  /** Teto de tokens de saída por modelo, calculado por planExecutionBudget
   * a partir do saldo restante do usuário — ver src/lib/ai/budget.ts. */
  budgetPlans: ModelBudgetPlan[];
}

/**
 * Motor de execução simultânea: dispara um adapter por modelo selecionado em
 * paralelo (Promise.all) e retorna o formato unificado de cada um. Cada
 * adapter já captura seus próprios erros (ver BaseModelAdapter), então a
 * falha de um modelo nunca derruba os demais.
 */
export async function runComparison(input: RunComparisonInput): Promise<UnifiedModelResponse[]> {
  const { systemPrompt, userMessage, modelIds, budgetPlans } = input;

  const maxOutputTokensByModel = new Map(
    budgetPlans.map((plan) => [plan.modelId, plan.maxOutputTokens]),
  );

  const results = await Promise.all(
    modelIds.map((modelId) =>
      getAdapterForModel(modelId).execute({
        modelId,
        systemPrompt,
        userMessage,
        maxOutputTokens: maxOutputTokensByModel.get(modelId),
      }),
    ),
  );

  return results;
}
