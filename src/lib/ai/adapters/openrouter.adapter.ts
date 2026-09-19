import OpenAI from "openai";
import { BaseModelAdapter } from "./base-adapter";
import type { ModelAdapterInput, ProviderCallResult } from "./types";
import { MAX_OUTPUT_TOKENS } from "@/lib/ai/limits";

/** Resposta do OpenRouter é compatível com o formato OpenAI, com um campo
 * extra em `usage`: o custo real em USD daquela chamada específica. */
interface OpenRouterUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  cost?: number;
}

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

    const completion = await client.chat.completions.create({
      model: input.modelId,
      max_tokens: input.maxOutputTokens ?? MAX_OUTPUT_TOKENS,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userMessage },
      ],
    });

    const usage = completion.usage as OpenRouterUsage | undefined;

    return {
      responseText: completion.choices[0]?.message?.content ?? "",
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      actualCostUSD: usage?.cost,
    };
  }
}
