import OpenAI from "openai";
import { BaseModelAdapter } from "./base-adapter";
import type { ModelAdapterInput, ProviderCallResult } from "./types";
import type { Provider } from "@/types/models";
import { MAX_OUTPUT_TOKENS } from "@/lib/ai/limits";

// A Maritaca AI expõe um endpoint compatível com o formato OpenAI
// (https://chat.maritaca.ai/api), então reaproveitamos o SDK oficial da
// OpenAI apenas trocando a baseURL/chave.
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.MARITACA_API_KEY) {
    throw new Error("MARITACA_API_KEY não configurada.");
  }
  client ??= new OpenAI({
    apiKey: process.env.MARITACA_API_KEY,
    baseURL: "https://chat.maritaca.ai/api",
  });
  return client;
}

export class MaritacaAdapter extends BaseModelAdapter {
  readonly provider: Provider = "MARITACA";

  protected async callProvider(input: ModelAdapterInput): Promise<ProviderCallResult> {
    const completion = await getClient().chat.completions.create({
      model: input.modelId,
      max_tokens: input.maxOutputTokens ?? MAX_OUTPUT_TOKENS,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userMessage },
      ],
    });

    return {
      responseText: completion.choices[0]?.message?.content ?? "",
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
    };
  }
}
