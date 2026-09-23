import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, type RateLimitResult } from "@/lib/rate-limit/ip-limiter";
import { hasUsedFreeExecutionToday, nextFreeResetAt } from "./free-tier";

const IP_MAX_ATTEMPTS = 5;
const IP_WINDOW_MS = 60 * 60 * 1000; // 1 hora

export type FreeTierGate =
  | { ok: true }
  | { ok: false; error: string; status: number };

/** Checagens que têm que passar ANTES de gastar dinheiro numa chamada real
 * ao OpenRouter em nome do plano Free — email confirmado, cota diária
 * ainda não usada, e rate limit por IP (proteção contra abuso simples por
 * múltiplas contas/scripts). Chamado de /api/executions só quando
 * `plan.slug === FREE_PLAN_SLUG`. */
export async function checkFreeTierExecutionAllowed(input: {
  userId: string;
  ipAddress: string | null;
}): Promise<FreeTierGate> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: input.userId },
    select: { emailVerifiedAt: true, freeExecutionUsedAt: true },
  });

  if (!user.emailVerifiedAt) {
    return {
      ok: false,
      status: 403,
      error: "Confirme seu e-mail para usar a execução gratuita diária. Reenvie o link em Configurações.",
    };
  }

  if (hasUsedFreeExecutionToday(user.freeExecutionUsedAt)) {
    const resetAt = nextFreeResetAt();
    return {
      ok: false,
      status: 403,
      error: `Você já usou sua execução gratuita de hoje. Próximo reset às ${resetAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.`,
    };
  }

  if (input.ipAddress) {
    const rateLimit: RateLimitResult = checkRateLimit(
      `free-exec:${input.ipAddress}`,
      IP_MAX_ATTEMPTS,
      IP_WINDOW_MS,
    );
    if (!rateLimit.allowed) {
      return { ok: false, status: 429, error: "Muitas tentativas. Tente novamente em alguns minutos." };
    }
  }

  return { ok: true };
}

/** Registra o resultado de uma tentativa de execução Free (telemetria de
 * abuso) e só marca a cota diária como usada quando pelo menos um modelo
 * teve sucesso — uma falha exclusiva do provedor (todos os modelos deram
 * ERROR) não consome a execução do dia, mas fica registrada mesmo assim. */
export async function recordFreeExecutionAttempt(input: {
  userId: string;
  modelIds: string[];
  ipAddress: string | null;
  resultStatuses: ("SUCCESS" | "ERROR")[];
}): Promise<void> {
  const succeeded = input.resultStatuses.some((status) => status === "SUCCESS");

  await prisma.freeExecutionAttempt.create({
    data: {
      userId: input.userId,
      modelIds: input.modelIds,
      succeeded,
      providerErrorOccurred: !succeeded,
      ipAddress: input.ipAddress,
    },
  });

  if (succeeded) {
    await prisma.user.update({
      where: { id: input.userId },
      data: { freeExecutionUsedAt: new Date() },
    });
  }
}
