import { creditsToBRL } from "@/lib/credits/credit-converter";
import { MODEL_PRICING } from "./pricing";
import { countInputTokens } from "./token-counter";
import type { ModelId } from "@/types/models";

/** Nunca pede menos que isso ao provedor — evita max_tokens=0/negativo e uma
 * resposta completamente inútil quando o orçamento restante é minúsculo. */
const MIN_OUTPUT_TOKENS = 16;
/** Teto absoluto por resposta, independente de quanto saldo sobrar — mantém
 * o tamanho das respostas dentro do que faz sentido pra um teste comparativo. */
const MAX_OUTPUT_TOKENS_CEILING = 4096;

export interface ModelBudgetPlan {
  modelId: ModelId;
  inputTokens: number;
  inputCostInBRL: number;
  maxOutputTokens: number;
}

export type BudgetPlanResult =
  | { ok: true; plans: ModelBudgetPlan[] }
  | { ok: false; reason: string };

/**
 * Injeção dinâmica de max_tokens: conta o custo de ENTRADA real (exato pra
 * Anthropic/Google, tokenizer real pra OpenAI, aproximado pra Groq/Maritaca —
 * ver token-counter.ts) de cada modelo selecionado, soma tudo e confere
 * contra o saldo disponível.
 *
 * Se só o envio (sem gerar nenhuma resposta) já estoura o saldo, bloqueia
 * a execução inteira antes de chamar qualquer provedor. Caso contrário,
 * divide o que sobra igualmente entre os modelos selecionados (rodam em
 * paralelo, então o orçamento de saída precisa ser reservado por modelo
 * antes de disparar as chamadas) e converte a fatia de cada um em tokens de
 * saída — esse valor vira o `max_tokens` daquela chamada específica. Assim
 * o usuário nunca fica com saldo negativo: na pior das hipóteses a resposta
 * vem cortada no meio, o que já serve de aviso natural de fim de crédito.
 */
export async function planExecutionBudget(
  modelIds: ModelId[],
  systemPrompt: string,
  userMessage: string,
  creditsAvailable: number,
): Promise<BudgetPlanResult> {
  const availableBRL = creditsToBRL(creditsAvailable);

  // O mesmo texto gera a mesma contagem de tokens independente do modelo
  // (tokenizer único desde a migração pro OpenRouter — ver token-counter.ts),
  // então basta contar uma vez e reaproveitar pra todos.
  const inputTokens = await countInputTokens(systemPrompt, userMessage);

  const inputCostsInBRL = modelIds.map(
    (modelId) => (inputTokens / 1000) * MODEL_PRICING[modelId].inputPricePer1k,
  );
  const totalInputCostInBRL = inputCostsInBRL.reduce((sum, cost) => sum + cost, 0);

  if (totalInputCostInBRL > availableBRL) {
    return {
      ok: false,
      reason:
        modelIds.length > 1
          ? "Só o envio deste prompt para os modelos selecionados já custa mais do que seu saldo disponível. Selecione menos modelos ou reduza o texto."
          : "Só o envio deste prompt já custa mais do que seu saldo disponível. Reduza o texto ou aguarde a renovação do ciclo.",
    };
  }

  const remainingBRL = availableBRL - totalInputCostInBRL;
  const perModelBudgetBRL = remainingBRL / modelIds.length;

  const plans: ModelBudgetPlan[] = modelIds.map((modelId, i) => {
    const { outputPricePer1k } = MODEL_PRICING[modelId];
    const affordableOutputTokens = Math.floor((perModelBudgetBRL / outputPricePer1k) * 1000);
    const maxOutputTokens = Math.max(
      MIN_OUTPUT_TOKENS,
      Math.min(MAX_OUTPUT_TOKENS_CEILING, affordableOutputTokens),
    );

    return {
      modelId,
      inputTokens,
      inputCostInBRL: inputCostsInBRL[i],
      maxOutputTokens,
    };
  });

  return { ok: true, plans };
}
