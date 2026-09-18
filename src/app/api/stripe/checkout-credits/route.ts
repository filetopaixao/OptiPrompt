import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/current-user";
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
