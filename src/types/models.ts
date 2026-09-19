/**
 * Catálogo estático dos modelos suportados pela plataforma.
 * Fonte única de verdade para IDs de modelo — usada pelo motor de execução
 * (back-end) e pelos seletores de modelo (front-end).
 *
 * Toda chamada passa pelo OpenRouter (ver src/lib/openrouter e
 * src/lib/ai/adapters/openrouter.adapter.ts) — os IDs abaixo usam a
 * convenção `provider/modelo` exigida pela API deles, não o ID nativo de
 * cada provedor. "Provider" aqui vira só um agrupamento visual da UI.
 */

/** MARITACA fica no tipo só por compatibilidade com execuções históricas no
 * banco (de antes da migração pro OpenRouter, que não tem modelos Sabiá) —
 * nenhum modelo novo usa esse provider. */
export type Provider = "OPENAI" | "ANTHROPIC" | "GOOGLE" | "MARITACA" | "GROQ";

export type ModelTier = "PREMIUM" | "COST_EFFECTIVE";

export interface ModelDefinition {
  /** ID exato exigido pela API do provedor. */
  id: string;
  provider: Provider;
  tier: ModelTier;
  /** Nome amigável exibido na UI. */
  label: string;
  /** Selo promocional opcional (ex.: "O novo Premium do Google"). */
  promoTag?: string;
}

export const MODEL_CATALOG: readonly ModelDefinition[] = [
  { id: "openai/gpt-4o", provider: "OPENAI", tier: "PREMIUM", label: "GPT-4o" },
  { id: "openai/gpt-4o-mini", provider: "OPENAI", tier: "COST_EFFECTIVE", label: "GPT-4o mini" },
  { id: "anthropic/claude-opus-5", provider: "ANTHROPIC", tier: "PREMIUM", label: "Claude Opus 5" },
  { id: "anthropic/claude-sonnet-5", provider: "ANTHROPIC", tier: "PREMIUM", label: "Claude Sonnet 5" },
  {
    id: "anthropic/claude-haiku-4.5",
    provider: "ANTHROPIC",
    tier: "COST_EFFECTIVE",
    label: "Claude Haiku 4.5",
  },
  // Ainda não existe uma "google/gemini-3-pro" estável no OpenRouter — o
  // tier Pro atual é servido como preview (confirmado via GET /api/v1/models).
  {
    id: "google/gemini-3.1-pro-preview",
    provider: "GOOGLE",
    tier: "PREMIUM",
    label: "Gemini Pro",
  },
  { id: "google/gemini-3.5-flash-lite", provider: "GOOGLE", tier: "COST_EFFECTIVE", label: "Gemini Flash Lite" },
  {
    id: "google/gemini-3.8-flash",
    provider: "GOOGLE",
    tier: "COST_EFFECTIVE",
    label: "Gemini 3.8 Flash",
    promoTag: "O novo Custo-benefício matador",
  },
  // GPT-OSS continua agrupado como "GROQ" na UI (família open-weight) mesmo
  // chamado via OpenRouter — o provedor de inferência real por baixo pode
  // variar (Groq, Cerebras etc.), não afeta o app.
  { id: "openai/gpt-oss-120b", provider: "GROQ", tier: "PREMIUM", label: "GPT-OSS 120B" },
  { id: "openai/gpt-oss-20b", provider: "GROQ", tier: "COST_EFFECTIVE", label: "GPT-OSS 20B" },
] as const;

export type ModelId = (typeof MODEL_CATALOG)[number]["id"];

export function getModelDefinition(modelId: string): ModelDefinition {
  const model = MODEL_CATALOG.find((m) => m.id === modelId);
  if (!model) {
    throw new Error(`Modelo desconhecido: ${modelId}`);
  }
  return model;
}

/** Formato unificado retornado por todo adapter, independentemente do provedor. */
export interface UnifiedModelResponse {
  modelId: string;
  provider: Provider;
  tier: ModelTier;
  status: "SUCCESS" | "ERROR";
  responseText: string | null;
  errorMessage: string | null;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  estimatedCostInBRL: number;
  estimatedCostInCredits: number;
}
