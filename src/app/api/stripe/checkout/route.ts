import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { getStripeClient, getStripePriceId } from "@/lib/stripe/client";

const checkoutSchema = z.object({ planSlug: z.string().min(1) });

/** Cria (ou reaproveita) o Stripe Customer do usuário. */
async function getOrCreateStripeCustomerId(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Checkout ainda não está disponível — STRIPE_SECRET_KEY não configurada." },
      { status: 501 },
    );
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const plan = await prisma.plan.findUnique({ where: { slug: parsed.data.planSlug } });
  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  let priceId: string;
  try {
    priceId = getStripePriceId(plan.slug);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Plano sem preço configurado no Stripe." },
      { status: 501 },
    );
  }

  const userId = await getCurrentUserId();
  const customerId = await getOrCreateStripeCustomerId(userId);

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/app?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
    metadata: { userId, planId: plan.id },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe não retornou a URL de checkout." }, { status: 502 });
  }

  return NextResponse.json({ checkoutUrl: session.url });
}
