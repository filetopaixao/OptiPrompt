import { OpenRouterAdapter } from "./openrouter.adapter";
import type { ModelAdapter } from "./types";

/** Todo modelo do catálogo passa pelo mesmo adapter — ver openrouter.adapter.ts. */
const adapter: ModelAdapter = new OpenRouterAdapter();

export function getAdapterForModel(): ModelAdapter {
  return adapter;
}

export type { ModelAdapter, ModelAdapterInput, ProviderCallResult } from "./types";
