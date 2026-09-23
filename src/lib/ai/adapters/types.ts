import type { ModelId, UnifiedModelResponse } from "@/types/models";

export interface ModelAdapterInput {
  modelId: ModelId;
  systemPrompt: string;
  userMessage: string;
  /** Imagem anexada no User message, como data URL — vira uma parte extra
   * de conteúdo multimodal na mensagem do usuário (ver openrouter.adapter.ts).
   * Só chega aqui quando o modelo suporta imagem (checado em
   * /api/executions antes de disparar qualquer chamada). */
  imageDataUrl?: string;
  /** Teto de tokens de saída pra esta chamada específica — calculado por
   * planExecutionBudget (src/lib/ai/budget.ts) a partir do saldo restante
   * do usuário. Cai para MAX_OUTPUT_TOKENS (limits.ts) quando ausente. */
  maxOutputTokens?: number;
  /** Controla a aleatoriedade da resposta (0 = mais determinístico, 2 = mais
   * criativo/aleatório) — vem do slider do dashboard (ver
   * prompt-editor-panel.tsx). Cai para DEFAULT_TEMPERATURE (limits.ts)
   * quando ausente. */
  temperature?: number;
  /** Chave OpenRouter própria do usuário que está executando — ver
   * src/lib/openrouter/client.ts. */
  apiKey: string;
}

/** O que o adapter concreto precisa retornar — o resto (tier, latência,
 * status) é calculado pelo BaseModelAdapter. */
export interface ProviderCallResult {
  responseText: string;
  promptTokens: number;
  completionTokens: number;
  /** Custo real em USD que o OpenRouter devolveu pra essa chamada específica
   * (campo `usage.cost` da resposta) — usado no lugar da estimativa da
   * tabela estática sempre que presente (ver base-adapter.ts). */
  actualCostUSD?: number;
}

/**
 * Todo modelo passa pelo mesmo adapter concreto (OpenRouter) — a interface
 * existe pra manter o orquestrador (`run-comparison.ts`) desacoplado de
 * como a chamada é feita por baixo.
 */
export interface ModelAdapter {
  execute(input: ModelAdapterInput): Promise<UnifiedModelResponse>;
}
