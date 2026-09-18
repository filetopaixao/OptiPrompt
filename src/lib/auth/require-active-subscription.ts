import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "./current-user";

/**
 * Gate de assinatura. Roda em Server Components (Node.js), não em
 * middleware.ts — o Edge runtime do middleware não suporta o driver
 * node-postgres do Prisma sem Prisma Accelerate (serviço pago à parte).
 * Se/quando entrar sessão real via cookie, este é o lugar certo pra também
 * checar a identidade — hoje só valida o usuário demo fixo.
 */
export async function requireActiveSubscription(): Promise<void> {
  const userId = await getCurrentUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { subscriptionStatus: true },
  });

  if (user.subscriptionStatus !== "ACTIVE") {
    redirect("/agencias?assinatura=necessaria");
  }
}
