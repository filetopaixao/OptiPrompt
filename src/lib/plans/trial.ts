/** Plano "Gratuito" — só o admin cria (ver admin/usuarios/actions.ts), nunca
 * aparece na página pública de preços (ver HIDDEN_PLAN_SLUGS em
 * src/lib/plans.ts) nem é comprável via Stripe. Dá 300 créditos por 7 dias;
 * vencido o prazo, a conta perde o plano (ver expireTrialIfNeeded). */
export const TRIAL_PLAN_SLUG = "gratuito";
export const TRIAL_DURATION_DAYS = 7;
export const TRIAL_CREDITS = 300;

/** Calcula o vencimento do trial a partir de agora, só quando o plano em
 * questão é o Gratuito — qualquer outro slug (ou null) não tem prazo. */
export function computeTrialEndsAt(planSlug: string | null | undefined): Date | null {
  if (planSlug !== TRIAL_PLAN_SLUG) return null;
  return new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
}
