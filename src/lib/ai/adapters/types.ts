import type { ModelId, Provider, UnifiedModelResponse } from "@/types/models";

export interface ModelAdapterInput {
  modelId: ModelId;
  systemPrompt: string;
  userMessage: string;
  /** Teto de tokens de saída pra esta chamada específica — calculado por
   * planExecutionBudget (src/lib/ai/budget.ts) a partir do saldo restante
   * do usuário. Cai para MAX_OUTPUT_TOKENS (limits.ts) quando ausente. */
  maxOutputTokens?: number;
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
