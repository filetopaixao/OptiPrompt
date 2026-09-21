import { MODEL_CATALOG, type ModelId } from "@/types/models";
import { TRIAL_PLAN_SLUG } from "./trial";

/**
 * Regras de acesso por plano — usadas tanto na UI (ModelSelector, dashboard,
 * histórico, relatório) quanto na validação server-side de /api/executions
 * (trava de segurança por baixo: nunca confiar só no que o cliente manda).
 */

/** Catálogo reduzido do plano Starter: cobre todos os provedores com a
 * opção mais barata de cada um, mais uma amostra Premium (GPT-4o) pra dar
 * gosto do que os planos superiores liberam por completo. */
const STARTER_ALLOWED_MODEL_IDS: ModelId[] = [
  "openai/gpt-4o-mini",
  "openai/gpt-4o",
  "anthropic/claude-haiku-4.5",
  "google/gemini-3.5-flash-lite",
  "meta-llama/llama-3.1-8b-instruct",
  "deepseek/deepseek-v3.2",
  "mistralai/mistral-small-3.2-24b-instruct",
];

const STARTER_MAX_SIMULTANEOUS_MODELS = 4;

const PLANS_WITH_COST_PROJECTION = new Set(["pro", "agencia"]);
const PLANS_WITH_VERSION_COMPARE = new Set(["pro", "agencia"]);

/** Modelos que o plano do usuário permite selecionar — Starter e o
 * Gratuito (ver src/lib/plans/trial.ts) veem só o catálogo reduzido, os
 * demais planos veem tudo. */
export function getAllowedModelIds(planSlug: string | null | undefined): ModelId[] {
  if (planSlug === "starter" || planSlug === TRIAL_PLAN_SLUG) return STARTER_ALLOWED_MODEL_IDS;
  return MODEL_CATALOG.map((model) => model.id);
}

/** Teto de modelos comparáveis numa única execução — Infinity nos planos
 * sem limite (a única trava real acaba sendo o tamanho do catálogo). */
export function getMaxSimultaneousModels(planSlug: string | null | undefined): number {
  return planSlug === "starter" || planSlug === TRIAL_PLAN_SLUG
    ? STARTER_MAX_SIMULTANEOUS_MODELS
    : Infinity;
}

/** "Projeção de custo em escala" (o gráfico de requisições/mês) — recurso
 * dos planos Agência (Pro) e Enterprise. */
export function canUseCostProjection(planSlug: string | null | undefined): boolean {
  return PLANS_WITH_COST_PROJECTION.has(planSlug ?? "");
}

/** "Comparação de versões" (teste A/B de prompts no histórico) — recurso
 * dos planos Agência (Pro) e Enterprise. */
export function canUseVersionCompare(planSlug: string | null | undefined): boolean {
  return PLANS_WITH_VERSION_COMPARE.has(planSlug ?? "");
}
