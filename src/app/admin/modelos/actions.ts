"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getModelDefinition } from "@/types/models";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Ativa/desativa um modelo na lista do plano Free (ver
 * src/lib/plans/free-tier.ts) — fonte única de verdade em banco
 * (FreeTierModel), nunca hardcoded no frontend. Não trava um número exato
 * de ativos aqui (o admin pode querer 0 temporariamente); a tela mostra um
 * aviso quando o total foge de ~5. */
export async function toggleFreeTierModel(modelId: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();

  try {
    getModelDefinition(modelId);
  } catch {
    return { ok: false, error: "Modelo desconhecido." };
  }

  await prisma.freeTierModel.upsert({
    where: { modelId },
    update: { active },
    create: { modelId, active },
  });

  revalidatePath("/admin/modelos");
  return { ok: true };
}
