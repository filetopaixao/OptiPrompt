import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { ModelId } from "@/types/models";

/** Lista de modelos liberados no Free — fonte única de verdade em banco
 * (FreeTierModel), configurável em /admin/modelos, nunca hardcoded no
 * frontend. Modelos marcados ativos que não existem mais no MODEL_CATALOG
 * (ex.: removido do catálogo) são ignorados silenciosamente aqui; a
 * validação de "exatamente ~5 ativos" acontece na tela de admin, não aqui.
 *
 * Separado de free-tier.ts de propósito: aquele arquivo tem constantes e
 * funções puras importadas por código client-safe (ver model-access.ts);
 * como este arquivo importa o Prisma no nível do módulo, juntar os dois
 * faria qualquer client component que importasse uma constante de lá
 * arrastar o driver do Postgres pro bundle do navegador (erro real já visto
 * em teste — "Module not found: Can't resolve 'dns'/'fs'/'net'"). */
export async function getFreeTierModelIds(): Promise<ModelId[]> {
  const rows = await prisma.freeTierModel.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((row) => row.modelId as ModelId);
}
