import "server-only";
import { MODEL_CATALOG, type ModelId } from "@/types/models";
import { FREE_PLAN_SLUG } from "./free-tier";
import { getFreeTierModelIds } from "./free-tier-models";
import { TRIAL_PLAN_SLUG } from "./trial";

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

/** Modelos que o plano do usuário permite selecionar — fonte única de
 * verdade por plano: Free usa a lista configurável em banco (ver
 * /admin/modelos), Starter e o Gratuito (ver src/lib/plans/trial.ts) veem
 * o catálogo reduzido fixo, os demais planos veem tudo. Async pela consulta
 * do Free — server-only (ver free-tier-models.ts), quem precisa disso num
 * client component recebe o resultado já pronto de um Server Component (ver
 * src/app/app/page.tsx). */
export async function getAllowedModelIds(planSlug: string | null | undefined): Promise<ModelId[]> {
  if (planSlug === FREE_PLAN_SLUG) return getFreeTierModelIds();
  if (planSlug === "starter" || planSlug === TRIAL_PLAN_SLUG) return STARTER_ALLOWED_MODEL_IDS;
  return MODEL_CATALOG.map((model) => model.id);
}
