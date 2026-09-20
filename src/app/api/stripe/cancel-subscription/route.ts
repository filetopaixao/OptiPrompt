import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { getStripeClient, getSubscriptionPeriodEnd } from "@/lib/stripe/client";

/** Cancela ao fim do ciclo pago atual (`cancel_at_period_end`), não na hora —
 * o usuário já pagou por esse ciclo, então mantém acesso e os créditos do
 * plano até lá. O webhook (`customer.subscription.deleted`) é quem, na data
 * certa, marca subscriptionStatus como CANCELED de fato. */
export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Cancelamento ainda não está disponível — STRIPE_SECRET_KEY não configurada." },
      { status: 501 },
    );
  }

  const userId = await getCurrentUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { stripeSubscriptionId: true, subscriptionStatus: true, cancelAtPeriodEnd: true },
  });

  if (!user.stripeSubscriptionId || user.subscriptionStatus !== "ACTIVE") {
    return NextResponse.json({ error: "Nenhuma assinatura ativa encontrada." }, { status: 400 });
  }

  if (user.cancelAtPeriodEnd) {
    return NextResponse.json({ error: "O cancelamento já está agendado." }, { status: 400 });
  }

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);
  await prisma.user.update({
    where: { id: userId },
    data: { cancelAtPeriodEnd: true, currentPeriodEnd },
  });

  return NextResponse.json({ ok: true, currentPeriodEnd });
}
