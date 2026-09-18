import { encodingForModel, getEncoding, type Tiktoken } from "js-tiktoken";
import { getClient as getAnthropicClient } from "./adapters/anthropic.adapter";
import { getClient as getGoogleClient } from "./adapters/google.adapter";
import { getModelDefinition, type ModelId } from "@/types/models";

let fallbackEncoder: Tiktoken | null = null;

/** Groq (Llama/GPT-OSS) e Maritaca (Sabiá) não publicam tokenizer próprio —
 * cl100k_base é a aproximação disponível, não uma contagem exata. */
function getFallbackEncoder(): Tiktoken {
  fallbackEncoder ??= getEncoding("cl100k_base");
  return fallbackEncoder;
}

/** ~4 caracteres por token — último recurso quando nem a contagem exata nem
 * o tokenizer local estão disponíveis (ver catch em countInputTokens). */
function estimateTokensByCharCount(text: string): number {
  return Math.ceil(text.length / 4);
}

async function countTokensForProvider(
  modelId: ModelId,
  systemPrompt: string,
  userMessage: string,
): Promise<number> {
  const { provider } = getModelDefinition(modelId);

  switch (provider) {
    case "ANTHROPIC": {
      const result = await getAnthropicClient().messages.countTokens({
        model: modelId,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });
      return result.input_tokens;
    }
    case "GOOGLE": {
      const result = await getGoogleClient().models.countTokens({
        model: modelId,
        contents: userMessage,
        config: { systemInstruction: systemPrompt },
      });
      return result.totalTokens ?? 0;
    }
    case "OPENAI": {
      const encoder = encodingForModel(modelId as Parameters<typeof encodingForModel>[0]);
      return encoder.encode(systemPrompt).length + encoder.encode(userMessage).length;
    }
    case "GROQ":
    case "MARITACA":
    default: {
      const encoder = getFallbackEncoder();
      return encoder.encode(systemPrompt).length + encoder.encode(userMessage).length;
    }
  }
}

/**
 * Conta tokens de ENTRADA antes de chamar o provedor de verdade — usado
 * pra calcular quanto do saldo sobra pra injetar como max_tokens dinâmico
 * (ver budget.ts). Anthropic e Google respondem com a contagem exata via
 * endpoint próprio (sem gerar texto, sem custo de output); OpenAI usa o
 * tokenizer real (o200k_base) via tiktoken.
 *
 * Anthropic/Google fazem uma chamada de API de verdade pra contar — se o
 * provedor estiver fora do ar, sem saldo ou com a chave inválida, essa
 * chamada pode falhar. Isso NÃO pode derrubar a execução inteira (o
 * BaseModelAdapter já garante que a falha de um modelo não afeta os
 * demais) — por isso cai pra estimativa por caracteres em vez de propagar
 * o erro. A falha real do provedor, se existir, aparece do jeito normal na
 * chamada de geração de verdade logo em seguida.
 */
export async function countInputTokens(
  modelId: ModelId,
  systemPrompt: string,
  userMessage: string,
): Promise<number> {
  try {
    return await countTokensForProvider(modelId, systemPrompt, userMessage);
  } catch {
    return estimateTokensByCharCount(systemPrompt + userMessage);
  }
}
