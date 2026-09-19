import OpenAI from "openai";

/** Modelo barato e rápido só pra julgar — não é o modelo sendo comparado. */
const JUDGE_MODEL_ID = "openai/gpt-4o-mini";
const JUDGE_MAX_TOKENS = 60;

export interface RuleCheckResult {
  verdict: "PASSED" | "FAILED";
  reason: string;
  /** Custo real em USD dessa chamada de julgamento (usage.cost do
   * OpenRouter) — soma ao total de créditos debitados da execução. */
  costUSD: number;
}

/**
 * Usa um modelo barato como juiz pra checar se uma resposta específica
 * respeita a regra em texto livre que o usuário definiu pra essa execução
 * (ex.: "a resposta não pode dizer que é uma IA"). Roda depois da resposta
 * principal, com a chave OpenRouter do próprio usuário — o custo real dessa
 * chamada extra soma ao débito de créditos (ver run-comparison.ts).
 */
export async function checkRule(
  rule: string,
  responseText: string,
  apiKey: string,
): Promise<RuleCheckResult> {
  const client = new OpenAI({ apiKey, baseURL: "https://openrouter.ai/api/v1" });

  const completion = await client.chat.completions.create({
    model: JUDGE_MODEL_ID,
    max_tokens: JUDGE_MAX_TOKENS,
    messages: [
      {
        role: "system",
        content:
          "Você verifica se uma resposta de IA respeita uma regra definida pelo usuário. " +
          'Responda em português. Primeira linha: exatamente "PASSOU" ou "FALHOU". ' +
          "Segunda linha: uma frase curta (até 15 palavras) explicando por quê.",
      },
      {
        role: "user",
        content: `Regra: ${rule}\n\nResposta a avaliar:\n"""\n${responseText}\n"""`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  const [firstLine, ...rest] = text.split("\n");
  const verdict: RuleCheckResult["verdict"] = firstLine?.toUpperCase().includes("PASSOU")
    ? "PASSED"
    : "FAILED";
  const reason = (rest.join(" ").trim() || text).slice(0, 300);

  const usage = completion.usage as { cost?: number } | undefined;

  return { verdict, reason, costUSD: usage?.cost ?? 0 };
}
