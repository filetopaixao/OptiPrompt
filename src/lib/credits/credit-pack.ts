/**
 * Pacote avulso de créditos — pagamento único (fora da assinatura),
 * não vence. Único pacote por enquanto: 10.000 créditos por R$39,00
 * (Price já criado no Stripe, ver STRIPE_PRICE_ID_CREDIT_PACK).
 */
export const CREDIT_PACK_AMOUNT = 10_000;

export function getCreditPackPriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ID_CREDIT_PACK;
  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID_CREDIT_PACK não configurado.");
  }
  return priceId;
}
