import Anthropic from "@anthropic-ai/sdk";
import { BaseModelAdapter } from "./base-adapter";
import type { ModelAdapterInput, ProviderCallResult } from "./types";
import type { Provider } from "@/types/models";
import { MAX_OUTPUT_TOKENS } from "@/lib/ai/limits";

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY não configurada.");
  }
  client ??= new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    // Necessário quando a chave é da organização (não escopada a um
    // workspace) — a API rejeita a chamada sem esse header nesse caso.
    defaultHeaders: process.env.ANTHROPIC_WORKSPACE_ID
      ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID }
      : undefined,
  });
  return client;
}

export class AnthropicAdapter extends BaseModelAdapter {
  readonly provider: Provider = "ANTHROPIC";

  protected async callProvider(input: ModelAdapterInput): Promise<ProviderCallResult> {
    const message = await getClient().messages.create({
      model: input.modelId,
      max_tokens: input.maxOutputTokens ?? MAX_OUTPUT_TOKENS,
      system: input.systemPrompt,
      messages: [{ role: "user", content: input.userMessage }],
    });

    const responseText = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return {
      responseText,
      promptTokens: message.usage.input_tokens,
      completionTokens: message.usage.output_tokens,
    };
  }
}
