import { brlToCredits, USD_TO_BRL_RATE } from "@/lib/credits/credit-converter";
import { calculateCostInBRL } from "@/lib/ai/pricing";
import { getModelDefinition } from "@/types/models";
import type { ModelId, UnifiedModelResponse } from "@/types/models";
import type { ModelAdapter, ModelAdapterInput, ProviderCallResult } from "./types";

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 1500];

/** Erros transientes (rate limit / sobrecarga momentânea do provedor) valem
 * uma nova tentativa; os SDKs da OpenAI, Anthropic e Google expõem `.status`
 * com o código HTTP nesses casos. */
function isRetryableError(error: unknown): boolean {
  const status = (error as { status?: unknown } | null)?.status;
  return status === 429 || status === 503;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Template Method: centraliza o que é igual para todo provedor — cronometragem,
 * retry em erro transiente, cálculo de custo/créditos e captura de erro —
 * para que uma falha em um modelo (ex.: rate limit da OpenAI) não derrube o
 * `Promise.all` inteiro nem duplique essa lógica em cada adapter concreto.
 *
 * Cada provedor só precisa implementar `callProvider`.
 */
export abstract class BaseModelAdapter implements ModelAdapter {
  protected abstract callProvider(input: ModelAdapterInput): Promise<ProviderCallResult>;

  private async callWithRetry(input: ModelAdapterInput): Promise<ProviderCallResult> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.callProvider(input);
      } catch (error) {
        if (attempt >= MAX_ATTEMPTS - 1 || !isRetryableError(error)) {
          throw error;
        }
        await sleep(RETRY_DELAYS_MS[attempt]);
      }
    }
  }

  async execute(input: ModelAdapterInput): Promise<UnifiedModelResponse> {
    const { provider, tier } = getModelDefinition(input.modelId);
    const startedAt = performance.now();

    try {
      const result = await this.callWithRetry(input);
      const latencyMs = Math.round(performance.now() - startedAt);
      // Custo real devolvido pelo OpenRouter (usage.cost) é preferido à
      // estimativa da tabela estática — só cai pra estimativa se por algum
      // motivo o campo vier ausente.
      const estimatedCostInBRL =
        result.actualCostUSD != null
          ? Number((result.actualCostUSD * USD_TO_BRL_RATE).toFixed(6))
          : calculateCostInBRL(input.modelId as ModelId, result.promptTokens, result.completionTokens);

      return {
        modelId: input.modelId,
        provider,
        tier,
        status: "SUCCESS",
        responseText: result.responseText,
        errorMessage: null,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        latencyMs,
        estimatedCostInBRL,
        estimatedCostInCredits: brlToCredits(estimatedCostInBRL),
      };
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startedAt);
      return {
        modelId: input.modelId,
        provider,
        tier,
        status: "ERROR",
        responseText: null,
        errorMessage: error instanceof Error ? error.message : "Erro desconhecido ao chamar o modelo.",
        promptTokens: 0,
        completionTokens: 0,
        latencyMs,
        estimatedCostInBRL: 0,
        estimatedCostInCredits: 0,
      };
    }
  }
}
