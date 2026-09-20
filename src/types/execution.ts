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
  /** Veredito da regra de Execution.rule pra esta resposta — null quando a
   * execução não tinha regra definida ou o modelo deu ERROR. */
  ruleVerdict: "PASSED" | "FAILED" | null;
  ruleReason: string | null;
}

export interface ExecutionDTO {
  id: string;
  createdAt: string;
  promptId: string;
  promptName: string;
  systemPrompt: string;
  userMessage: string;
  /** Regra opcional em texto livre verificada em cada resposta (ver
   * src/lib/ai/rule-checker.ts) — null quando não foi definida. */
  rule: string | null;
  results: ExecutionResultDTO[];
  /** Quem rodou essa execução — só populado na visão agregada de equipe do
   * dono Enterprise (ver listExecutionsForTeam). Ausente na listagem pessoal
   * normal, onde já é implícito que é sempre o próprio usuário logado. */
  executedBy?: { name: string | null; email: string };
}
