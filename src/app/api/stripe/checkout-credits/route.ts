import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { getCreditPackPriceId } from "@/lib/credits/credit-pack";
import { getOrCreateStripeCustomerId, getStripeClient } from "@/lib/stripe/client";

/** Checkout de pagamento único (mode "payment") para o pacote avulso de
 * créditos — diferente do checkout de assinatura (mode "subscription"),
 * então fica num endpoint próprio em vez de sobrecarregar /api/stripe/checkout. */
export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Checkout ainda não está disponível — STRIPE_SECRET_KEY não configurada." },
      { status: 501 },
    );
  }

  let priceId: string;
  try {
    priceId = getCreditPackPriceId();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pacote de créditos não configurado." },
      { status: 501 },
    );
  }

  const userId = await getCurrentUserId();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { subscriptionStatus: true, cancelAtPeriodEnd: true, managedByUserId: true },
  });
  // Conta de cliente gerida por uma agência (ver User.managedByUserId) não
  // tem assinatura própria — créditos avulsos são comprados pela agência,
  // não por quem só tem acesso à plataforma.
  if (user.managedByUserId) {
    return NextResponse.json(
      { error: "Sua conta é gerida por uma agência — fale com o administrador dela para comprar créditos." },
      { status: 403 },
    );
  }
  if (user.subscriptionStatus !== "ACTIVE" || user.cancelAtPeriodEnd) {
    return NextResponse.json(
      { error: "Sua assinatura está cancelada ou com cancelamento agendado — não é possível comprar créditos avulsos." },
      { status: 403 },
    );
  }

  const customerId = await getOrCreateStripeCustomerId(userId);

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/app/billing?creditos=comprados`,
    cancel_url: `${origin}/app/billing?checkout=cancelled`,
    metadata: { userId, type: "credit_pack" },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe não retornou a URL de checkout." }, { status: 502 });
  }

  return NextResponse.json({ checkoutUrl: session.url });
}
