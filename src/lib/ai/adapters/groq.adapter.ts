import OpenAI from "openai";
import { BaseModelAdapter } from "./base-adapter";
import type { ModelAdapterInput, ProviderCallResult } from "./types";
import type { Provider } from "@/types/models";
import { MAX_OUTPUT_TOKENS } from "@/lib/ai/limits";

/**
 * Modelos open-weight de alta velocidade servidos pela Groq (LPU), endpoint
 * compatível com o formato OpenAI. A família passou a incluir modelos
 * GPT-OSS em vez de Llama 3 porque a Meta descontinuou a Llama API oficial
 * (06/07/2026) e a Groq moveu os modelos Llama para o plano Enterprise.
 */
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY não configurada.");
  }
  client ??= new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
  return client;
}

export class GroqAdapter extends BaseModelAdapter {
  readonly provider: Provider = "GROQ";

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
