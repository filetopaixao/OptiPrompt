"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
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

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      planId: input.planId || null,
      subscriptionStatus: input.subscriptionStatus,
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

export async function grantBonusCredits(input: {
  userId: string;
  amount: number;
}): Promise<ActionResult> {
  await requireAdmin();

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Informe uma quantidade de créditos válida." };
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: { bonusCredits: { increment: Math.floor(input.amount) } },
  });
  await syncOpenRouterLimit(input.userId);

  revalidatePath("/admin/usuarios");
  return { ok: true };
}
