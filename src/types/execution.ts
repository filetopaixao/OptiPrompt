import type { ModelTier, Provider } from "./models";

/**
 * Formato enviado ao cliente.
 *
 * `estimatedCostInCredits` classifica o badge de impacto de custo
 * (ver lib/credits/credit-converter.ts) e nunca aparece como número cru na
 * UI principal — é o que protege a barra de cota global.
 *
 * `estimatedCostInBRL` é o custo real estimado da chamada. Fica de fora da
 * UI principal do dashboard, mas alimenta o relatório executivo/exportável
 * (resumo de vencedor, projeção de custo em escala, PDF) — uma feature
 * paga pensada para agências mostrarem impacto financeiro ao cliente delas.
 */
export interface ExecutionResultDTO {
  id: string;
  modelId: string;
  provider: Provider;
  tier: ModelTier;
  status: "SUCCESS" | "ERROR";
  responseText: string | null;
  errorMessage: string | null;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  estimatedCostInCredits: number;
  estimatedCostInBRL: number;
}

export interface ExecutionDTO {
  id: string;
  createdAt: string;
  promptId: string;
  promptName: string;
  systemPrompt: string;
  userMessage: string;
  results: ExecutionResultDTO[];
}
