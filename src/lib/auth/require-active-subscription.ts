import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "./current-user";

/**
 * Gate de assinatura. Roda em Server Components (Node.js), não em
 * middleware.ts — o Edge runtime do middleware não suporta o driver
 * node-postgres do Prisma sem Prisma Accelerate (serviço pago à parte).
 * A identidade já é resolvida por getCurrentUserId() via sessão NextAuth;
 * aqui só valida se a assinatura dessa conta está ativa.
 */
export async function requireActiveSubscription(): Promise<void> {
  const userId = await getCurrentUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { subscriptionStatus: true },
  });

  if (user.subscriptionStatus !== "ACTIVE") {
    redirect("/?assinatura=necessaria");
  }
}
