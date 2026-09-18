/**
 * Tabela de preços por modelo, em R$ por 1.000 tokens.
 * Fonte única de verdade para o cálculo de custo — atualize aqui quando os
 * provedores mudarem preços, sem tocar nos adapters.
 *
 * Valores derivados da tabela oficial de preço por milhão de tokens (R$/1M
 * ÷ 1.000 = R$/1k, usado por calculateCostInBRL).
 */
import type { ModelId } from "@/types/models";

export interface ModelPricing {
  /** R$ por 1.000 tokens de entrada (prompt). */
  inputPricePer1k: number;
  /** R$ por 1.000 tokens de saída (completion). */
  outputPricePer1k: number;
}

export const MODEL_PRICING: Record<ModelId, ModelPricing> = {
  "gpt-4o": { inputPricePer1k: 0.01283, outputPricePer1k: 0.0513 },
  "gpt-4o-mini": { inputPricePer1k: 0.00077, outputPricePer1k: 0.00308 },
  "claude-3-opus-20240229": { inputPricePer1k: 0.07695, outputPricePer1k: 0.38475 },
  "claude-3-5-sonnet-20240620": { inputPricePer1k: 0.01539, outputPricePer1k: 0.07695 },
  "claude-3-haiku-20240307": { inputPricePer1k: 0.00128, outputPricePer1k: 0.00641 },
  "gemini-pro-latest": { inputPricePer1k: 0.01026, outputPricePer1k: 0.06156 },
  "gemini-flash-lite-latest": { inputPricePer1k: 0.00128, outputPricePer1k: 0.0077 },
  "gemini-3.5-flash": { inputPricePer1k: 0.0077, outputPricePer1k: 0.04617 },
  "sabia-4": { inputPricePer1k: 0.005, outputPricePer1k: 0.02 },
  "sabiazinho-4": { inputPricePer1k: 0.001, outputPricePer1k: 0.004 },
  "openai/gpt-oss-120b": { inputPricePer1k: 0.00077, outputPricePer1k: 0.00308 },
  "openai/gpt-oss-20b": { inputPricePer1k: 0.00038, outputPricePer1k: 0.00154 },
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
