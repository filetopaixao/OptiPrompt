/**
 * Catálogo estático dos modelos suportados pela plataforma.
 * Fonte única de verdade para IDs de modelo — usada pelo motor de execução
 * (back-end) e pelos seletores de modelo (front-end).
 */

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
  { id: "gpt-4o", provider: "OPENAI", tier: "PREMIUM", label: "GPT-4o" },
  { id: "gpt-4o-mini", provider: "OPENAI", tier: "COST_EFFECTIVE", label: "GPT-4o mini" },
  // claude-3-opus-20240229, claude-3-5-sonnet-20240620 e claude-3-haiku-20240307
  // foram desativados pela Anthropic (404 model not found, confirmado direto
  // na API) — substituídos pela geração atual dos mesmos tiers.
  {
    id: "claude-opus-5",
    provider: "ANTHROPIC",
    tier: "PREMIUM",
    label: "Claude Opus 5",
  },
  {
    id: "claude-sonnet-5",
    provider: "ANTHROPIC",
    tier: "PREMIUM",
    label: "Claude Sonnet 5",
  },
  {
    id: "claude-haiku-4-5-20251001",
    provider: "ANTHROPIC",
    tier: "COST_EFFECTIVE",
    label: "Claude Haiku 4.5",
  },
  // Gemini 1.5 foi desativado pela Google — usamos os aliases "-latest", que
  // sempre apontam para o modelo estável mais atual da respectiva categoria,
  // evitando quebrar de novo a cada descontinuação de versão.
  {
    id: "gemini-pro-latest",
    provider: "GOOGLE",
    tier: "PREMIUM",
    label: "Gemini Pro",
    // "gemini-3.5-pro" foi pedido mas NÃO existe na API da Google (confirmado
    // via ListModels em produção) — aplicamos o selo no alias Premium real.
    promoTag: "O novo Premium do Google",
  },
  // gemini-flash-latest ficou instável sob alta demanda (503 sustentado,
  // confirmado direto na API) — gemini-flash-lite-latest respondeu normal.
  { id: "gemini-flash-lite-latest", provider: "GOOGLE", tier: "COST_EFFECTIVE", label: "Gemini Flash Lite" },
  {
    id: "gemini-3.5-flash",
    provider: "GOOGLE",
    tier: "COST_EFFECTIVE",
    label: "Gemini 3.5 Flash",
    promoTag: "O novo Custo-benefício matador",
  },
  // sabia-3 foi descontinuado pela Maritaca — sabia-4 e sabiazinho-4 são os
  // modelos atuais (confirmado via GET /api/models com a chave real).
  { id: "sabia-4", provider: "MARITACA", tier: "PREMIUM", label: "Sabiá-4" },
  { id: "sabiazinho-4", provider: "MARITACA", tier: "COST_EFFECTIVE", label: "Sabiázinho-4" },
  // Llama 3 deixou de estar disponível no self-serve da Groq — usamos os
  // modelos open-weight que a conta efetivamente acessa hoje (confirmado via
  // GET /openai/v1/models com a chave real).
  {
    id: "openai/gpt-oss-120b",
    provider: "GROQ",
    tier: "PREMIUM",
    label: "GPT-OSS 120B",
  },
  {
    id: "openai/gpt-oss-20b",
    provider: "GROQ",
    tier: "COST_EFFECTIVE",
    label: "GPT-OSS 20B",
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
