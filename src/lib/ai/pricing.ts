/**
 * Tabela de preços por modelo, em R$ por 1.000 tokens.
 * Usada só pra ESTIMAR o orçamento antes de chamar o modelo (ver budget.ts,
 * que injeta o max_tokens dinâmico) — o custo real debitado do usuário vem
 * do `usage.cost` que o OpenRouter devolve em cada resposta (ver
 * openrouter.adapter.ts), não desta tabela.
 *
 * Valores derivados do preço por token em USD que a própria API do
 * OpenRouter expõe (GET /api/v1/models), convertidos pra R$/1k na mesma
 * cotação usada no resto do app.
 */
import type { ModelId } from "@/types/models";

export interface ModelPricing {
  /** R$ por 1.000 tokens de entrada (prompt). */
  inputPricePer1k: number;
  /** R$ por 1.000 tokens de saída (completion). */
  outputPricePer1k: number;
}

export const MODEL_PRICING: Record<ModelId, ModelPricing> = {
  "openai/gpt-4o": { inputPricePer1k: 0.012825, outputPricePer1k: 0.0513 },
  "openai/gpt-4o-mini": { inputPricePer1k: 0.0007695, outputPricePer1k: 0.003078 },
  "anthropic/claude-opus-5": { inputPricePer1k: 0.02565, outputPricePer1k: 0.12825 },
  "anthropic/claude-sonnet-5": { inputPricePer1k: 0.01026, outputPricePer1k: 0.0513 },
  "anthropic/claude-haiku-4.5": { inputPricePer1k: 0.00513, outputPricePer1k: 0.02565 },
  "google/gemini-3.1-pro-preview": { inputPricePer1k: 0.01026, outputPricePer1k: 0.06156 },
  "google/gemini-3.5-flash-lite": { inputPricePer1k: 0.001539, outputPricePer1k: 0.012825 },
  "google/gemini-3.8-flash": { inputPricePer1k: 0.0038475, outputPricePer1k: 0.0192375 },
  "openai/gpt-oss-120b": { inputPricePer1k: 0.0007695, outputPricePer1k: 0.003078 },
  "openai/gpt-oss-20b": { inputPricePer1k: 0.0001539, outputPricePer1k: 0.0006669 },
  // Preço do endpoint específico da Groq (não o menor preço geral do
  // modelo) — é o backend forçado via forceProvider em types/models.ts.
  "meta-llama/llama-3.3-70b-instruct": { inputPricePer1k: 0.0030267, outputPricePer1k: 0.0040527 },
  "meta-llama/llama-3.1-8b-instruct": { inputPricePer1k: 0.0002565, outputPricePer1k: 0.0004104 },
  "deepseek/deepseek-v4-pro-0813": { inputPricePer1k: 0.002966, outputPricePer1k: 0.008898 },
  "deepseek/deepseek-v3.2": { inputPricePer1k: 0.00137997, outputPricePer1k: 0.002052 },
  "mistralai/mistral-medium-3-5": { inputPricePer1k: 0.007695, outputPricePer1k: 0.038475 },
  "mistralai/mistral-small-3.2-24b-instruct": { inputPricePer1k: 0.00048094, outputPricePer1k: 0.0012825 },
};

export function calculateCostInBRL(
  modelId: ModelId,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = MODEL_PRICING[modelId];
  const inputCost = (promptTokens / 1000) * pricing.inputPricePer1k;
  const outputCost = (completionTokens / 1000) * pricing.outputPricePer1k;
  return Number((inputCost + outputCost).toFixed(6));
}
