import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY não configurada.");
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/** Mapeia o slug interno do plano ao Price ID configurado no Stripe. */
export function getStripePriceId(planSlug: string): string {
  const priceIdByPlanSlug: Record<string, string | undefined> = {
    starter: process.env.STRIPE_PRICE_ID_STARTER,
    pro: process.env.STRIPE_PRICE_ID_PRO,
    agencia: process.env.STRIPE_PRICE_ID_AGENCIA,
  };

  const priceId = priceIdByPlanSlug[planSlug];
  if (!priceId) {
    throw new Error(`Nenhum Stripe Price ID configurado para o plano "${planSlug}".`);
  }
  return priceId;
}

/** Espelha Stripe.Subscription.Status para o nosso enum interno. */
export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): "ACTIVE" | "PAST_DUE" | "CANCELED" | "INACTIVE" {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    default:
      return "INACTIVE";
  }
}
