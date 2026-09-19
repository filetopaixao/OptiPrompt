import { prisma } from "@/lib/db/prisma";
import type { CreditProvider } from "@prisma/client";

/**
 * Fatia da receita de cada pagamento de assinatura reservada para recarregar
 * o saldo pré-pago da OptiPrompt nos provedores de IA. Anthropic, Google e
 * Maritaca não expõem API de recarga programática de billing — a recarga em
 * si é sempre manual, feita no painel de cada provedor (ver /admin/creditos).
 * Este cálculo só automatiza o "quanto e quando", não o depósito.
 */
const REVENUE_SHARE_RATIO = 0.2;

/** Split da fatia de 20% entre os três provedores pré-pagos — sem indicação
 * do mix de uso real entre eles, assumimos 1/3 cada. Ajuste aqui se tiver
 * dados de consumo por provedor. */
const PROVIDER_SPLIT: Record<CreditProvider, number> = {
  ANTHROPIC: 1 / 3,
  GOOGLE: 1 / 3,
  MARITACA: 1 / 3,
};

export async function allocateProviderCredits(params: {
  userId: string;
  stripeEventId: string;
  amountPaidInCents: number;
}): Promise<void> {
  const { userId, stripeEventId, amountPaidInCents } = params;
  const totalShareInCents = Math.round(amountPaidInCents * REVENUE_SHARE_RATIO);
  if (totalShareInCents <= 0) return;

  const entries = Object.entries(PROVIDER_SPLIT) as [CreditProvider, number][];

  await prisma.$transaction(
    entries.map(([provider, ratio]) =>
      prisma.providerCreditAllocation.upsert({
        // Um stripeEventId gera uma linha por provedor — sufixo garante
        // idempotência mesmo se o Stripe reenviar o webhook.
        where: { stripeEventId: `${stripeEventId}:${provider}` },
        update: {},
        create: {
          userId,
          stripeEventId: `${stripeEventId}:${provider}`,
          amountPaidInCents,
          provider,
          amountInCents: Math.round(totalShareInCents * ratio),
        },
      }),
    ),
  );
}
