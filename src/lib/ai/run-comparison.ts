import { getAdapterForModel } from "./adapters";
import type { ModelId, UnifiedModelResponse } from "@/types/models";

export interface RunComparisonInput {
  systemPrompt: string;
  userMessage: string;
  modelIds: ModelId[];
}

/**
 * Motor de execução simultânea: dispara um adapter por modelo selecionado em
 * paralelo (Promise.all) e retorna o formato unificado de cada um. Cada
 * adapter já captura seus próprios erros (ver BaseModelAdapter), então a
 * falha de um modelo nunca derruba os demais.
 */
export async function runComparison(input: RunComparisonInput): Promise<UnifiedModelResponse[]> {
  const { systemPrompt, userMessage, modelIds } = input;

  const results = await Promise.all(
    modelIds.map((modelId) =>
      getAdapterForModel(modelId).execute({ modelId, systemPrompt, userMessage }),
    ),
  );

  return results;
}
