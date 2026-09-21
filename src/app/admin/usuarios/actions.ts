"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getMonthlyCreditLimit } from "@/lib/credits/credit-converter";
import { computeTrialEndsAt } from "@/lib/plans/trial";
import { syncOpenRouterLimit } from "@/lib/openrouter/client";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createFreeUser(input: {
  name: string;
  email: string;
  planId: string;
  initialCredits: number;
}): Promise<ActionResult & { password?: string }> {
  await requireAdmin();

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name || !email || !input.planId) {
    return { ok: false, error: "Preencha nome, e-mail e plano." };
  }
  if (!Number.isFinite(input.initialCredits) || input.initialCredits < 0) {
    return { ok: false, error: "Quantidade de créditos inválida." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Já existe uma conta com este e-mail." };
  }

  const plan = await prisma.plan.findUnique({ where: { id: input.planId }, select: { slug: true } });
  if (!plan) {
    return { ok: false, error: "Plano inválido." };
  }

  // Senha temporária gerada pelo admin — exibida uma única vez na UI.
  // mustChangePassword força a troca no primeiro login (ver /trocar-senha).
  const password = randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      planId: input.planId,
      subscriptionStatus: "ACTIVE",
      mustChangePassword: true,
      bonusCredits: Math.floor(input.initialCredits),
      // Só o plano Gratuito ganha prazo — ver computeTrialEndsAt e
      // expireTrialIfNeeded (lib/auth/expire-trial.ts).
      trialEndsAt: computeTrialEndsAt(plan.slug),
    },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true, password };
}

export async function updateUserAccess(input: {
  userId: string;
  planId: string;
  subscriptionStatus: SubscriptionStatus;
}): Promise<ActionResult> {
  await requireAdmin();

  // Recalcula o prazo do trial a cada troca de plano: vira null pra
  // qualquer plano que não seja o Gratuito, e reinicia os 7 dias a partir
  // de agora se o admin (re)atribuir o Gratuito manualmente.
  const plan = input.planId
    ? await prisma.plan.findUnique({ where: { id: input.planId }, select: { slug: true } })
    : null;

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      planId: input.planId || null,
      subscriptionStatus: input.subscriptionStatus,
      trialEndsAt: computeTrialEndsAt(plan?.slug),
    },
  });
  await syncOpenRouterLimit(input.userId);

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function resetUserCycle(userId: string): Promise<ActionResult> {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { creditsUsedThisCycle: 0, cycleStartedAt: new Date() },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

/** Ajusta o LIMITE MÁXIMO do usuário (créditos avulsos, somam ao teto do
 * plano) — aceita valores negativos pra remover crédito já concedido. O
 * resultado nunca fica abaixo de 0. Isso muda o teto, não o saldo restante
 * no ciclo atual — pra isso, ver adjustCurrentCredits. */
export async function adjustBonusCredits(input: {
  userId: string;
  amount: number;
}): Promise<ActionResult & { newBonusCredits?: number }> {
  await requireAdmin();

  const amount = Math.trunc(input.amount);
  if (!Number.isFinite(amount) || amount === 0) {
    return { ok: false, error: "Informe uma quantidade de créditos válida (positiva ou negativa)." };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: input.userId },
    select: { bonusCredits: true },
  });
  const newBonusCredits = Math.max(0, user.bonusCredits + amount);

  await prisma.user.update({
    where: { id: input.userId },
    data: { bonusCredits: newBonusCredits },
  });
  await syncOpenRouterLimit(input.userId);

  revalidatePath("/admin/usuarios");
  return { ok: true, newBonusCredits };
}

/** Ajusta o SALDO DISPONÍVEL AGORA, dentro do ciclo atual — sem mexer no
 * teto (bonusCredits) nem no plano. Por baixo, isso é feito ao contrário:
 * "dar" crédito agora reduz creditsUsedThisCycle (nunca abaixo de 0);
 * "tirar" crédito agora aumenta creditsUsedThisCycle. Como o disponível é
 * sempre teto - usado, dar mais do que já foi consumido neste ciclo trava
 * no teto atual — pra abrir espaço além do teto, use adjustBonusCredits. */
export async function adjustCurrentCredits(input: {
  userId: string;
  amount: number;
}): Promise<ActionResult & { newCreditsAvailable?: number }> {
  await requireAdmin();

  const amount = Math.trunc(input.amount);
  if (!Number.isFinite(amount) || amount === 0) {
    return { ok: false, error: "Informe uma quantidade de créditos válida (positiva ou negativa)." };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: input.userId },
    select: {
      creditsUsedThisCycle: true,
      bonusCredits: true,
      plan: { select: { priceInCents: true, fixedMonthlyCreditLimit: true } },
    },
  });

  const newCreditsUsedThisCycle = Math.max(0, user.creditsUsedThisCycle - amount);

  await prisma.user.update({
    where: { id: input.userId },
    data: { creditsUsedThisCycle: newCreditsUsedThisCycle },
  });
  // Sem syncOpenRouterLimit aqui de propósito: o teto no OpenRouter reflete
  // creditsTotal (plano + avulso), que não muda ao mexer só no consumo do
  // ciclo — só adjustBonusCredits e updateUserAccess afetam esse número.

  revalidatePath("/admin/usuarios");

  const creditsTotal = (user.plan ? getMonthlyCreditLimit(user.plan) : 0) + user.bonusCredits;
  const newCreditsAvailable = Math.max(0, creditsTotal - newCreditsUsedThisCycle);

  return { ok: true, newCreditsAvailable };
}
