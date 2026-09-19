import OpenAI from "openai";
import { BaseModelAdapter } from "./base-adapter";
import type { ModelAdapterInput, ProviderCallResult } from "./types";
import { MAX_OUTPUT_TOKENS } from "@/lib/ai/limits";
import { getModelDefinition } from "@/types/models";

/** Resposta do OpenRouter é compatível com o formato OpenAI, com um campo
 * extra em `usage`: o custo real em USD daquela chamada específica. */
interface OpenRouterUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  cost?: number;
}

/** Campos extras do OpenRouter (provider routing e controle de raciocínio) —
 * não fazem parte do schema oficial da OpenAI, então o SDK precisa desse
 * cast pra aceitar. */
type ChatCompletionParamsWithOpenRouterExtras = OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
  provider?: { order: string[]; allow_fallbacks: boolean };
  reasoning?: { exclude: boolean };
};

/**
 * Todo modelo (OpenAI, Anthropic, Google, GPT-OSS) passa por aqui — o
 * OpenRouter expõe um endpoint único, compatível com o SDK oficial da
 * OpenAI, então reaproveitamos o mesmo client trocando baseURL/chave.
 * A chave é a do usuário que está executando (provisionada em
 * src/lib/openrouter/client.ts), não uma chave compartilhada da plataforma.
 */
export class OpenRouterAdapter extends BaseModelAdapter {
  protected async callProvider(input: ModelAdapterInput): Promise<ProviderCallResult> {
    const client = new OpenAI({ apiKey: input.apiKey, baseURL: "https://openrouter.ai/api/v1" });
    const { forceProvider, disableReasoning } = getModelDefinition(input.modelId);

    const completion = await client.chat.completions.create({
      model: input.modelId,
      max_tokens: input.maxOutputTokens ?? MAX_OUTPUT_TOKENS,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userMessage },
      ],
      ...(forceProvider
        ? { provider: { order: [forceProvider], allow_fallbacks: false } }
        : {}),
      ...(disableReasoning ? { reasoning: { exclude: true } } : {}),
    } as ChatCompletionParamsWithOpenRouterExtras);

    const usage = completion.usage as OpenRouterUsage | undefined;

    return {
      responseText: completion.choices[0]?.message?.content ?? "",
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      actualCostUSD: usage?.cost,
    };
  }
}
