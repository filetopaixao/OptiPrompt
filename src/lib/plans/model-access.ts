import { FREE_MAX_MODELS_PER_EXECUTION, FREE_PLAN_SLUG } from "./free-tier";
import { TRIAL_PLAN_SLUG } from "./trial";

/**
 * Regras de acesso por plano, PURAS e client-safe (sem tocar no banco) —
 * usadas tanto na UI (dashboard, histórico, relatório) quanto compartilhadas
 * pela validação server-side de /api/executions. A lista completa de
 * modelos liberados por plano (que precisa do banco pro Free — ver
 * FreeTierModel) mora à parte em src/lib/plans/allowed-models.ts,
 * justamente pra este arquivo poder ser importado por client components
 * sem arrastar o driver do Postgres pro bundle do navegador (ver comentário
 * em free-tier-models.ts).
 */

const STARTER_MAX_SIMULTANEOUS_MODELS = 4;

const PLANS_WITH_COST_PROJECTION = new Set(["pro", "agencia"]);
const PLANS_WITH_VERSION_COMPARE = new Set(["pro", "agencia"]);

/** Teto de modelos comparáveis numa única execução — Infinity nos planos
 * sem limite (a única trava real acaba sendo o tamanho do catálogo). */
export function getMaxSimultaneousModels(planSlug: string | null | undefined): number {
  if (planSlug === FREE_PLAN_SLUG) return FREE_MAX_MODELS_PER_EXECUTION;
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
