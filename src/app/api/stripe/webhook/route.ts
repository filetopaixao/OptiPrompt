import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { getStripeClient, getSubscriptionPeriodEnd, mapStripeSubscriptionStatus } from "@/lib/stripe/client";
import { CREDIT_PACK_AMOUNT } from "@/lib/credits/credit-pack";
import { syncOpenRouterLimit } from "@/lib/openrouter/client";

/** Pacote avulso de créditos: pagamento único, sem assinatura envolvida.
 * Idempotente via CreditPackPurchase.stripeSessionId (reentrega do webhook
 * não credita duas vezes). */
async function handleCreditPackPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId || session.payment_status !== "paid") return;

  const existing = await prisma.creditPackPurchase.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existing) return;

  await prisma.$transaction([
    prisma.creditPackPurchase.create({
      data: {
        userId,
        stripeSessionId: session.id,
        amountPaidInCents: session.amount_total ?? 0,
        creditsAdded: CREDIT_PACK_AMOUNT,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { bonusCredits: { increment: CREDIT_PACK_AMOUNT } },
    }),
  ]);

  await syncOpenRouterLimit(userId);
}

async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  // "unpaid" acontece quando o checkout é concluído mas o pagamento em si
  // falha (ex.: 3DS pendente) — nesse caso não ativa; o webhook
  // customer.subscription.updated que vem em seguida reflete o status real.
  if (!userId || session.payment_status === "unpaid") return;

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  // Busca a assinatura completa pra sincronizar o fim do ciclo pago e limpar
  // um cancelamento agendado de uma assinatura anterior (ex: usuário
  // cancelou, o acesso seguiu até o fim do ciclo, e depois assinou de novo).
  const subscription = subscriptionId
    ? await getStripeClient().subscriptions.retrieve(subscriptionId)
    : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(planId ? { planId } : {}),
      ...(customerId ? { stripeCustomerId: customerId } : {}),
      ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
      subscriptionStatus: "ACTIVE",
      cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
      currentPeriodEnd: subscription ? getSubscriptionPeriodEnd(subscription) : null,
    },
  });

  await syncOpenRouterLimit(userId);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === "payment") {
    await handleCreditPackPurchase(session);
  } else {
    await handleSubscriptionCheckoutCompleted(session);
  }
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: mapStripeSubscriptionStatus(subscription.status),
      stripeSubscriptionId: subscription.id,
      // Cobre tanto quem cancelou pelo nosso botão quanto quem cancelou (ou
      // reverteu) direto pelo portal do Stripe — o webhook é a fonte da
      // verdade, o botão só dispara a chamada que gera este evento.
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    },
  });
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook do Stripe ainda não configurado." },
      { status: 501 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionChanged(event.data.object);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
