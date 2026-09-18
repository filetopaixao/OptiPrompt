import type { ModelId, Provider, UnifiedModelResponse } from "@/types/models";

export interface ModelAdapterInput {
  modelId: ModelId;
  systemPrompt: string;
  userMessage: string;
}

/** O que cada provedor concreto precisa retornar — o resto (custo, latência,
 * status) é calculado pelo BaseModelAdapter, igual para todos os provedores. */
export interface ProviderCallResult {
  responseText: string;
  promptTokens: number;
  completionTokens: number;
}

/**
 * Strategy: cada provedor (OpenAI, Anthropic, Google, Maritaca) implementa
 * esta interface. O orquestrador (`run-comparison.ts`) depende apenas dela,
 * nunca de um SDK específico.
 */
export interface ModelAdapter {
  readonly provider: Provider;
  execute(input: ModelAdapterInput): Promise<UnifiedModelResponse>;
}
