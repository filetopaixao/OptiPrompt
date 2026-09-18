import { getModelDefinition } from "@/types/models";
import type { Provider } from "@/types/models";
import { AnthropicAdapter } from "./anthropic.adapter";
import { GoogleAdapter } from "./google.adapter";
import { GroqAdapter } from "./groq.adapter";
import { MaritacaAdapter } from "./maritaca.adapter";
import { OpenAIAdapter } from "./openai.adapter";
import type { ModelAdapter } from "./types";

/** Registry: mapeia cada provedor ao seu adapter concreto (Strategy). */
const ADAPTERS_BY_PROVIDER: Record<Provider, ModelAdapter> = {
  OPENAI: new OpenAIAdapter(),
  ANTHROPIC: new AnthropicAdapter(),
  GOOGLE: new GoogleAdapter(),
  MARITACA: new MaritacaAdapter(),
  GROQ: new GroqAdapter(),
};

export function getAdapterForModel(modelId: string): ModelAdapter {
  const { provider } = getModelDefinition(modelId);
  return ADAPTERS_BY_PROVIDER[provider];
}

export type { ModelAdapter, ModelAdapterInput, ProviderCallResult } from "./types";
