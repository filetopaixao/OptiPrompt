import { getAdapterForModel } from "./adapters";
import type { ModelBudgetPlan } from "./budget";
import type { ModelId, UnifiedModelResponse } from "@/types/models";

export interface RunComparisonInput {
  systemPrompt: string;
  userMessage: string;
  /** Imagem anexada no User message, como data URL — só chega aqui quando
   * todo modelo selecionado suporta imagem (checado em /api/executions). */
  imageDataUrl?: string;
  modelIds: ModelId[];
  /** Teto de tokens de saída por modelo, calculado por planExecutionBudget
   * a partir do saldo restante do usuário — ver src/lib/ai/budget.ts. */
  budgetPlans: ModelBudgetPlan[];
  /** Controla a aleatoriedade da resposta, igual pra todos os modelos desta
   * execução — vem do slider do dashboard. Cai para DEFAULT_TEMPERATURE
   * (limits.ts) quando ausente. */
  temperature?: number;
  /** Chave OpenRouter do usuário que está executando — ver
   * src/lib/openrouter/client.ts. */
  apiKey: string;
}

/**
 * Motor de execução simultânea: dispara um adapter por modelo selecionado em
 * paralelo (Promise.all) e retorna o formato unificado de cada um. Cada
 * adapter já captura seus próprios erros (ver BaseModelAdapter), então a
 * falha de um modelo nunca derruba os demais.
 */
export async function runComparison(input: RunComparisonInput): Promise<UnifiedModelResponse[]> {
  const { systemPrompt, userMessage, imageDataUrl, modelIds, budgetPlans, temperature, apiKey } = input;

  const maxOutputTokensByModel = new Map(
    budgetPlans.map((plan) => [plan.modelId, plan.maxOutputTokens]),
  );

  const results = await Promise.all(
    modelIds.map((modelId) =>
      getAdapterForModel().execute({
        modelId,
        systemPrompt,
        userMessage,
        imageDataUrl,
        maxOutputTokens: maxOutputTokensByModel.get(modelId),
        temperature,
        apiKey,
      }),
    ),
  );

  return results;
}
