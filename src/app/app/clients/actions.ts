"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { requireActiveSubscription } from "@/lib/auth/require-active-subscription";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Só a própria conta Enterprise (não um cliente já gerido por ela) pode
 * gerenciar a carteira de clientes — mesma trava da página, repetida aqui
 * porque uma Server Action pode ser chamada direto, sem passar pela UI. */
async function requireEnterpriseOwner(): Promise<string> {
  const userId = await getCurrentUserId();
  const { planSlug, isManagedAccount } = await requireActiveSubscription();
  if (planSlug !== "agencia" || isManagedAccount) {
    redirect("/app");
  }
  return userId;
}

export async function createClientUser(input: {
  name: string;
  email: string;
}): Promise<ActionResult & { password?: string }> {
  const ownerId = await requireEnterpriseOwner();

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !email) {
    return { ok: false, error: "Preencha nome e e-mail." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Já existe uma conta com este e-mail." };
  }

  // Senha temporária exibida uma única vez — mesmo padrão de
  // admin/usuarios/actions.ts (createFreeUser).
  const password = randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      mustChangePassword: true,
      // Sem plano/assinatura própria de propósito — créditos, modelos
      // liberados e todo o resto vêm da conta-mãe (ver getBillingOwnerId).
      // subscriptionStatus fica ACTIVE só como valor seguro caso algum
      // código antigo leia esse campo direto sem passar pelo resolver.
      subscriptionStatus: "ACTIVE",
      managedByUserId: ownerId,
    },
  });

  revalidatePath("/app/clients");
  return { ok: true, password };
}

export async function removeClientUser(clientUserId: string): Promise<ActionResult> {
  const ownerId = await requireEnterpriseOwner();

  const client = await prisma.user.findUnique({
    where: { id: clientUserId },
    select: { managedByUserId: true },
  });
  if (!client || client.managedByUserId !== ownerId) {
    return { ok: false, error: "Cliente não encontrado." };
  }

  await prisma.user.delete({ where: { id: clientUserId } });

  revalidatePath("/app/clients");
  return { ok: true };
}
