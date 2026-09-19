import { prisma } from "@/lib/db/prisma";
import { MODEL_CATALOG, type ModelId } from "@/types/models";

const MOST_USED_LIMIT = 3;
const CURRENT_MODEL_IDS = MODEL_CATALOG.map((model) => model.id);

/** Modelos mais usados pelo próprio usuário em execuções bem-sucedidas —
 * usado pra destacar atalhos no seletor de modelos (ver ModelSelector).
 * Restrito ao catálogo atual — sem isso, IDs antigos de antes da migração
 * pro OpenRouter (ex.: "gpt-4o-mini" em vez de "openai/gpt-4o-mini") nunca
 * combinam com nenhum modelo selecionável hoje e desperdiçam posições no
 * ranking sem nunca aparecer destacados. */
export async function getMostUsedModelIds(userId: string): Promise<ModelId[]> {
  const grouped = await prisma.executionResult.groupBy({
    by: ["modelId"],
    where: { execution: { userId }, status: "SUCCESS", modelId: { in: CURRENT_MODEL_IDS } },
    _count: { modelId: true },
    orderBy: { _count: { modelId: "desc" } },
    take: MOST_USED_LIMIT,
  });

  return grouped.map((row) => row.modelId as ModelId);
}
