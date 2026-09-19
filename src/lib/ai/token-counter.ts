import { getEncoding, type Tiktoken } from "js-tiktoken";

let encoder: Tiktoken | null = null;

/** cl100k_base é uma aproximação — nenhum provedor exposto pelo OpenRouter
 * tem endpoint próprio de contagem de tokens, então o mesmo tokenizer é
 * usado pra todo modelo do catálogo. */
function getSharedEncoder(): Tiktoken {
  encoder ??= getEncoding("cl100k_base");
  return encoder;
}

function estimateTokensByCharCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Conta tokens de ENTRADA antes de chamar o provedor de verdade — usado
 * pra calcular quanto do saldo sobra pra injetar como max_tokens dinâmico
 * (ver budget.ts). É sempre uma aproximação (ver comentário acima), com
 * fallback por contagem de caracteres se o encoder falhar por algum motivo
 * — nunca pode propagar erro e derrubar a execução inteira.
 */
export async function countInputTokens(systemPrompt: string, userMessage: string): Promise<number> {
  try {
    const encoder = getSharedEncoder();
    return encoder.encode(systemPrompt).length + encoder.encode(userMessage).length;
  } catch {
    return estimateTokensByCharCount(systemPrompt + userMessage);
  }
}
