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
export type Provider = "OPENAI" | "ANTHROPIC" | "GOOGLE" | "MARITACA" | "GROQ" | "DEEPSEEK" | "MISTRAL";

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
  /** Força o OpenRouter a rotear pra esse backend específico (provider
   * routing, ver openrouter.adapter.ts) — usado nos modelos Llama pra
   * garantir que rodem na Groq mesmo com outros backends disponíveis. */
  forceProvider?: string;
  /** Desliga o "thinking" de modelos com raciocínio habilitado por padrão
   * (ver openrouter.adapter.ts) — sem isso, um orçamento de max_tokens baixo
   * (usuário com pouco saldo) é todo consumido em tokens de raciocínio
   * invisíveis e a resposta visível volta vazia. */
  disableReasoning?: boolean;
}

export const MODEL_CATALOG: readonly ModelDefinition[] = [
  { id: "openai/gpt-4o", provider: "OPENAI", tier: "PREMIUM", label: "GPT-4o" },
  { id: "openai/gpt-4o-mini", provider: "OPENAI", tier: "COST_EFFECTIVE", label: "GPT-4o mini" },
  // reasoning.default_enabled=false (confirmado via GET /api/v1/models) —
  // não precisa de disableReasoning como o DeepSeek V4 Pro.
  { id: "openai/gpt-5.4", provider: "OPENAI", tier: "PREMIUM", label: "GPT-5.4" },
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
  // Llama forçado a rodar na Groq (forceProvider) — confirmado via
  // GET /api/v1/models/{id}/endpoints que a Groq serve esses dois; os
  // modelos Llama 4 (Maverick/Scout) ainda não têm backend Groq no OpenRouter.
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    provider: "GROQ",
    tier: "PREMIUM",
    label: "Llama 3.3 70B",
    forceProvider: "groq",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    provider: "GROQ",
    tier: "COST_EFFECTIVE",
    label: "Llama 3.1 8B",
    forceProvider: "groq",
  },
  // deepseek-v4-pro tem "thinking" habilitado por padrão (reasoning_effort
  // "high") — sem disableReasoning, um orçamento de max_tokens baixo é todo
  // consumido em tokens invisíveis e a resposta volta vazia (confirmado
  // direto na API). deepseek-v4.1-flash não tem esse comportamento.
  {
    id: "deepseek/deepseek-v4-pro-0813",
    provider: "DEEPSEEK",
    tier: "PREMIUM",
    label: "DeepSeek V4 Pro",
    disableReasoning: true,
  },
  // v4.1-flash tem "reasoning" ligado por padrão e ignora reasoning.exclude
  // em pelo menos um dos backends (confirmado: consumiu tokens de raciocínio
  // mesmo com exclude:true e voltou vazio sob orçamento apertado) — v3.2 tem
  // reasoning desligado por padrão e testou limpo no mesmo cenário.
  {
    id: "deepseek/deepseek-v3.2",
    provider: "DEEPSEEK",
    tier: "COST_EFFECTIVE",
    label: "DeepSeek V3.2",
  },
  // Atenção ao ID: é "3-5" (hífen), não "3.5" — confirmado via GET
  // /api/v1/models (a página de preços da Mistral usa "3.5", mas o slug do
  // OpenRouter não).
  { id: "mistralai/mistral-medium-3-5", provider: "MISTRAL", tier: "PREMIUM", label: "Mistral Medium 3.5" },
  // mistral-small-2603 ("Mistral Small 4") deu 429 sustentado — rate limit
  // compartilhado do OpenRouter com a Mistral pra esse modelo específico no
  // momento do teste. 3.2-24b é a geração anterior, mas respondeu estável.
  {
    id: "mistralai/mistral-small-3.2-24b-instruct",
    provider: "MISTRAL",
    tier: "COST_EFFECTIVE",
    label: "Mistral Small 3.2",
  },
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
