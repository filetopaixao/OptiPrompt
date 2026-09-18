import { GoogleGenAI } from "@google/genai";
import { BaseModelAdapter } from "./base-adapter";
import type { ModelAdapterInput, ProviderCallResult } from "./types";
import type { Provider } from "@/types/models";
import { MAX_OUTPUT_TOKENS } from "@/lib/ai/limits";

let client: GoogleGenAI | null = null;

export function getClient(): GoogleGenAI {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY não configurada.");
  }
  client ??= new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  return client;
}

export class GoogleAdapter extends BaseModelAdapter {
  readonly provider: Provider = "GOOGLE";

  protected async callProvider(input: ModelAdapterInput): Promise<ProviderCallResult> {
    const response = await getClient().models.generateContent({
      model: input.modelId,
      contents: input.userMessage,
      config: {
        systemInstruction: input.systemPrompt,
        maxOutputTokens: input.maxOutputTokens ?? MAX_OUTPUT_TOKENS,
      },
    });

    return {
      responseText: response.text ?? "",
      promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    };
  }
}
