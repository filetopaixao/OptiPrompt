import OpenAI from "openai";
import { BaseModelAdapter } from "./base-adapter";
import type { ModelAdapterInput, ProviderCallResult } from "./types";
import type { Provider } from "@/types/models";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export class OpenAIAdapter extends BaseModelAdapter {
  readonly provider: Provider = "OPENAI";

  protected async callProvider(input: ModelAdapterInput): Promise<ProviderCallResult> {
    const completion = await getClient().chat.completions.create({
      model: input.modelId,
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
