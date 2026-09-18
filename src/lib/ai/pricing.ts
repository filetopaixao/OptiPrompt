/**
 * Tabela de preços por modelo, em R$ por 1.000 tokens.
 * Fonte única de verdade para o cálculo de custo — atualize aqui quando os
 * provedores mudarem preços, sem tocar nos adapters.
 *
 * NOTA: valores placeholder (aprox. USD list price convertido a ~R$5,50/USD).
 * Ajustar antes de operar em produção.
 */
import type { ModelId } from "@/types/models";

export interface ModelPricing {
  /** R$ por 1.000 tokens de entrada (prompt). */
  inputPricePer1k: number;
  /** R$ por 1.000 tokens de saída (completion). */
  outputPricePer1k: number;
}

export const MODEL_PRICING: Record<ModelId, ModelPricing> = {
  "gpt-4o": { inputPricePer1k: 0.0275, outputPricePer1k: 0.11 },
  "gpt-4o-mini": { inputPricePer1k: 0.00083, outputPricePer1k: 0.0033 },
  "claude-3-opus-20240229": { inputPricePer1k: 0.0825, outputPricePer1k: 0.4125 },
  "claude-3-5-sonnet-20240620": { inputPricePer1k: 0.0165, outputPricePer1k: 0.0825 },
  "claude-3-haiku-20240307": { inputPricePer1k: 0.00138, outputPricePer1k: 0.00688 },
  "gemini-pro-latest": { inputPricePer1k: 0.006875, outputPricePer1k: 0.055 },
  "gemini-flash-lite-latest": { inputPricePer1k: 0.001375, outputPricePer1k: 0.00825 },
  "gemini-3.5-flash": { inputPricePer1k: 0.001925, outputPricePer1k: 0.0154 },
  "sabia-4": { inputPricePer1k: 0.005, outputPricePer1k: 0.015 },
  "sabiazinho-4": { inputPricePer1k: 0.0015, outputPricePer1k: 0.005 },
  "openai/gpt-oss-120b": { inputPricePer1k: 0.000825, outputPricePer1k: 0.0033 },
  "openai/gpt-oss-20b": { inputPricePer1k: 0.0004125, outputPricePer1k: 0.00165 },
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
